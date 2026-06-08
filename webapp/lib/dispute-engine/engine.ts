import Anthropic from '@anthropic-ai/sdk'
import { retrieveLegalContext } from '../rag/retrieve'
import { runContentFilter, FilterResult } from './content-filter'
import { buildDisputeLetter, Bureau } from './letter-generator'

export type ItemType =
  | 'late_payment'
  | 'collection'
  | 'charge_off'
  | 'bankruptcy'
  | 'hard_inquiry'
  | 'not_mine'

export interface DisputeInput {
  itemType: ItemType
  creditor: string
  accountNumber?: string
  amount?: number
  reason: string
  clientName: string
  clientAddress: string
  bureau: Bureau
}

export interface DisputeResult {
  letter: string
  filter: FilterResult
  sources: { source_document: string; section: string; similarity: number }[]
}

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  late_payment: 'late payment',
  collection: 'collection account',
  charge_off: 'charge-off',
  bankruptcy: 'bankruptcy entry',
  hard_inquiry: 'unauthorized hard inquiry',
  not_mine: 'account that does not belong to me',
}

export async function generateDisputeLetter(input: DisputeInput): Promise<DisputeResult> {
  const ragQuery = `dispute ${ITEM_TYPE_LABELS[input.itemType]} ${input.reason} FCRA consumer rights`
  const chunks = await retrieveLegalContext(ragQuery, 5)

  const legalContext = chunks
    .map(c => `[${c.source_document} — ${c.section}]\n${c.content}`)
    .join('\n\n---\n\n')

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const systemPrompt = `You are a credit repair specialist drafting a formal dispute letter on behalf of a consumer. You write accurate, professional letters that cite specific federal statutes. You do not provide legal advice, make guarantees, or promise outcomes. Write only the body paragraphs of the letter — no salutation, no closing, no signature block.`

  const userPrompt = `Draft dispute letter body paragraphs for the following:

Item type: ${ITEM_TYPE_LABELS[input.itemType]}
Creditor / Furnisher: ${input.creditor}${input.accountNumber ? `\nAccount number (last 4): ${input.accountNumber.slice(-4)}` : ''}${input.amount ? `\nAmount: $${input.amount}` : ''}
Dispute reason: ${input.reason}
Target bureau: ${input.bureau}

Relevant legal statutes for citation:
${legalContext}

Requirements:
- Cite at least two specific statute sections (e.g. 15 U.S.C. § 1681i)
- State clearly that the item is disputed and must be investigated
- Request deletion or correction if the item cannot be verified
- Reference the bureau's 30-day reinvestigation obligation
- Do not make guarantees or outcome promises
- Keep to 3-4 paragraphs`

  const message = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 800,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const body = (message.content[0] as { type: string; text: string }).text
  const filter = runContentFilter(body)
  const letter = buildDisputeLetter({
    clientName: input.clientName,
    clientAddress: input.clientAddress,
    bureau: input.bureau,
    body: filter.cleaned,
  })

  return {
    letter,
    filter,
    sources: chunks.map(c => ({ source_document: c.source_document, section: c.section, similarity: c.similarity })),
  }
}
