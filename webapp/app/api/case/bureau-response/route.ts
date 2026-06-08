import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { generateReDispute } from '@/lib/dispute-engine/re-dispute'

const BureauResponseSchema = z.object({
  letterId:      z.number().int().positive(),
  outcome:       z.enum(['deleted', 'updated', 'verified', 'no_response']),
  responseText:  z.string().max(5000).default(''),
})

// Called by WF06 (n8n response tracking) when a bureau response is recorded
export async function POST(req: NextRequest) {
  // Validate n8n shared secret
  const secret = req.headers.get('x-n8n-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = BureauResponseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 422 })
  }
  const { letterId, outcome, responseText } = parsed.data

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch the original letter + case
  const { data: letter, error: letterErr } = await supabase
    .from('dispute_letters')
    .select('*, cases(first_name, last_name, street, city, state, zip, email)')
    .eq('letter_id', letterId)
    .single()

  if (letterErr || !letter) {
    return NextResponse.json({ error: 'Letter not found' }, { status: 404 })
  }

  // Record the bureau response
  const { error: insertErr } = await supabase.from('bureau_responses').insert({
    letter_id:     letterId,
    case_id:       letter.case_id,
    bureau:        letter.bureau,
    response_text: responseText,
    outcome,
  })
  if (insertErr) throw insertErr

  // Update the letter's response outcome
  await supabase
    .from('dispute_letters')
    .update({ response_outcome: outcome, bureau_response_at: new Date().toISOString() })
    .eq('letter_id', letterId)

  // Log audit event
  await supabase.from('events').insert({
    case_id:    letter.case_id,
    event_type: 'bureau_response_received',
    detail:     { letter_id: letterId, bureau: letter.bureau, outcome, round: letter.round },
  })

  // If item was deleted or updated — no re-dispute needed
  if (outcome === 'deleted' || outcome === 'updated') {
    // Check if all items for this case are resolved; if so, update case status
    const { data: pending } = await supabase
      .from('dispute_letters')
      .select('letter_id')
      .eq('case_id', letter.case_id)
      .not('response_outcome', 'in', '("deleted","updated")')
      .is('response_outcome', null)

    if (!pending || pending.length === 0) {
      await supabase
        .from('cases')
        .update({ case_status: 'resolved' })
        .eq('case_id', letter.case_id)
    }

    return NextResponse.json({ action: 'none', reason: `Item ${outcome} — no re-dispute needed` })
  }

  // Item was verified or no response — trigger re-dispute if round < 4
  if (letter.round >= 4) {
    return NextResponse.json({ action: 'none', reason: 'Max rounds reached — escalate to attorney' })
  }

  // Build client info for re-dispute
  const c = letter.cases as Record<string, string>
  const clientName    = `${c.first_name} ${c.last_name}`
  const clientAddress = [c.street, c.city, c.state, c.zip].filter(Boolean).join(', ')

  let reDispute: Awaited<ReturnType<typeof generateReDispute>>
  try {
    reDispute = await generateReDispute({
      caseId:            letter.case_id,
      bureau:            letter.bureau as 'Equifax' | 'TransUnion' | 'Experian',
      previousRound:     letter.round as number,
      itemType:          letter.dispute_type ?? 'dispute',
      creditor:          letter.creditor ?? '',
      originalReason:    letter.original_reason ?? '',
      bureauResponseText: responseText,
      responseOutcome:   outcome as 'verified' | 'updated' | 'no_response',
      clientName,
      clientAddress,
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Re-dispute generation failed', detail: err.message }, { status: 500 })
  }

  // Insert new dispute letter for next round
  const { data: newLetter, error: newLetterErr } = await supabase
    .from('dispute_letters')
    .insert({
      case_id:              letter.case_id,
      bureau:               letter.bureau,
      round:                reDispute.round,
      letter_body:          reDispute.letterBody,
      letter_status:        'pending_review',
      requires_notarization: reDispute.requiresNotarization,
      parent_letter_id:     letterId,
    })
    .select('letter_id')
    .single()

  if (newLetterErr) throw newLetterErr

  // Mark original letter as re-dispute triggered
  await supabase
    .from('dispute_letters')
    .update({ re_dispute_triggered: true })
    .eq('letter_id', letterId)

  // Update case round counter
  await supabase
    .from('cases')
    .update({ current_round: reDispute.round, case_status: 'letters_pending_review' })
    .eq('case_id', letter.case_id)

  // Log re-dispute event
  await supabase.from('events').insert({
    case_id:    letter.case_id,
    event_type: 're_dispute_generated',
    detail:     {
      parent_letter_id: letterId,
      new_letter_id:    newLetter.letter_id,
      round:            reDispute.round,
      strategy:         reDispute.strategy,
      bureau:           letter.bureau,
    },
  })

  return NextResponse.json({
    action:        're_dispute_generated',
    newLetterId:   newLetter.letter_id,
    round:         reDispute.round,
    strategy:      reDispute.strategy,
    requiresNotarization: reDispute.requiresNotarization,
  })
}
