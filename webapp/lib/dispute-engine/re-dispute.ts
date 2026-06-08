import Anthropic from '@anthropic-ai/sdk'
import { retrieveLegalContext } from '../rag/retrieve'
import { runContentFilter } from './content-filter'
import { BUREAU_ADDRESSES } from './letter-generator'
import { sanitizeText } from '../sanitize'

export interface ReDisputeInput {
  caseId: string
  bureau: 'Equifax' | 'TransUnion' | 'Experian'
  previousRound: number
  itemType: string
  creditor: string
  originalReason: string
  bureauResponseText: string
  responseOutcome: 'verified' | 'updated' | 'no_response'
  clientName: string
  clientAddress: string
}

export interface ReDisputeResult {
  letterBody: string
  round: number
  requiresNotarization: boolean
  strategy: string
}

const ROUND_STRATEGIES: Record<number, string> = {
  2: 'method_of_verification',
  3: 'legal_threat',
  4: 'final_demand',
}

function buildRoundPrompt(input: ReDisputeInput, round: number, context: string): string {
  const bureauAddress = BUREAU_ADDRESSES[input.bureau]
  const strategy = ROUND_STRATEGIES[round] ?? 'final_demand'

  const strategyInstructions: Record<string, string> = {
    method_of_verification: `
This is a Round 2 Method of Verification demand.
The bureau claimed to have verified the item but did not delete it.
Demand in writing: (1) the name, address, and phone number of each person contacted during verification; (2) a description of the procedures used; (3) copies of any documents reviewed.
Reference the right to request this information under the Fair Credit Reporting Act, Section 611(a)(7).
State that if the bureau cannot provide this documentation within 15 days, the item must be deleted.`,

    legal_threat: `
This is a Round 3 Escalation letter.
The bureau has now twice failed to properly investigate or verify this item.
Reference the possibility of willful noncompliance and the remedies available to consumers.
State the client intends to file a complaint with the Consumer Financial Protection Bureau and the state attorney general if the item is not deleted within 15 days.
Reference that consumers may seek actual damages, punitive damages, and attorney fees under the Fair Credit Reporting Act for willful noncompliance.
Tone should be firm and professional — not threatening in a personal sense, but clear about legal remedies available.`,

    final_demand: `
This is a Round 4 Final Demand.
All prior rounds have failed. Reference the complete history of disputes.
State that the client's attorney has been engaged and a lawsuit will be filed if the item is not deleted within 10 days.
Include a demand to preserve all records related to the investigation under legal hold.
Reference willful and negligent noncompliance remedies.`,
  }

  return `You are a credit repair specialist generating a formal dispute letter for Round ${round}.

IMPORTANT: This is Round ${round} of an ongoing dispute. The bureau has already responded without deleting or correcting the item.

CLIENT INFORMATION:
Name: ${input.clientName}
Address: ${input.clientAddress}

BUREAU: ${input.bureau}
Bureau Address: ${bureauAddress}

DISPUTED ITEM:
Creditor: ${input.creditor}
Item Type: ${input.itemType}
Original Dispute Reason: ${input.originalReason}

BUREAU'S PRIOR RESPONSE (Round ${input.previousRound}):
Outcome: ${input.responseOutcome}
Response: ${input.bureauResponseText || 'Bureau verified item without providing documentation.'}

ROUND ${round} STRATEGY:
${strategyInstructions[strategy]}

RELEVANT LEGAL CONTEXT:
${context}

LETTER REQUIREMENTS:
- Professional formal letter format
- Date: [DATE]
- Reference dispute history (Round ${input.previousRound} sent, bureau responded)
- Be specific about what the bureau must do and by when
- Include FCRA rights language appropriate to this round
- Do NOT include: guarantees, promises of specific outcomes, legal advice, or claims we will definitely remove the item
- Close with client's signature block
- Keep to 1–2 pages

Generate only the letter body. No preamble or explanation.`
}

export async function generateReDispute(input: ReDisputeInput): Promise<ReDisputeResult> {
  const round = Math.min(input.previousRound + 1, 4)
  const strategy = ROUND_STRATEGIES[round] ?? 'final_demand'

  const safeCreditor = sanitizeText(input.creditor)
  const safeReason = sanitizeText(input.originalReason)
  const safeResponse = sanitizeText(input.bureauResponseText)

  const query = `${input.itemType} dispute ${input.bureau} round ${round} ${strategy}`
  const legalChunks = await retrieveLegalContext(query, 4)
  const context = legalChunks.map(c => `[${c.source_document} — ${c.section}]\n${c.content}`).join('\n\n')

  const prompt = buildRoundPrompt(
    { ...input, creditor: safeCreditor, originalReason: safeReason, bureauResponseText: safeResponse },
    round,
    context
  )

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const message = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const filtered = runContentFilter(raw)
  if (!filtered.passed) {
    throw new Error(`Content filter blocked re-dispute letter: ${filtered.violations.join(', ')}`)
  }

  return {
    letterBody: filtered.cleaned,
    round,
    requiresNotarization: round >= 3,
    strategy,
  }
}
