import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { generateReDispute } from '@/lib/dispute-engine/re-dispute'
import { checkRateLimit } from '@/lib/rate-limit'

const ReDisputeSchema = z.object({
  letterId:           z.number().int().positive(),
  bureauResponseText: z.string().max(5000).default(''),
  responseOutcome:    z.enum(['verified', 'no_response']),
})

export async function POST(req: NextRequest) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = checkRateLimit(`redispute:${user.id}`, 5, 60_000)
  if (!rl.allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = ReDisputeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 422 })
  }
  const { letterId, bureauResponseText, responseOutcome } = parsed.data

  const service = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: letter, error: letterErr } = await service
    .from('dispute_letters')
    .select('*, cases(first_name, last_name, street, city, state, zip, email)')
    .eq('letter_id', letterId)
    .single()

  if (letterErr || !letter) {
    return NextResponse.json({ error: 'Letter not found' }, { status: 404 })
  }

  // Ensure the requesting user owns this case
  const c = letter.cases as Record<string, string>
  if (c.email !== user.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if ((letter.round as number) >= 4) {
    return NextResponse.json({ error: 'Max rounds reached — please contact WEC for attorney referral' }, { status: 400 })
  }

  if (letter.re_dispute_triggered) {
    return NextResponse.json({ error: 'Re-dispute already triggered for this letter' }, { status: 409 })
  }

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
      bureauResponseText,
      responseOutcome,
      clientName,
      clientAddress,
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Re-dispute generation failed', detail: err.message }, { status: 500 })
  }

  const { data: newLetter, error: insertErr } = await service
    .from('dispute_letters')
    .insert({
      case_id:               letter.case_id,
      bureau:                letter.bureau,
      round:                 reDispute.round,
      letter_body:           reDispute.letterBody,
      letter_status:         'pending_review',
      requires_notarization: reDispute.requiresNotarization,
      parent_letter_id:      letterId,
    })
    .select('letter_id')
    .single()

  if (insertErr) throw insertErr

  await service
    .from('dispute_letters')
    .update({ re_dispute_triggered: true, response_outcome: responseOutcome })
    .eq('letter_id', letterId)

  await service
    .from('cases')
    .update({ current_round: reDispute.round, case_status: 'letters_pending_review' })
    .eq('case_id', letter.case_id)

  await service.from('events').insert({
    case_id:    letter.case_id,
    event_type: 're_dispute_generated',
    detail:     {
      parent_letter_id: letterId,
      new_letter_id:    newLetter.letter_id,
      round:            reDispute.round,
      strategy:         reDispute.strategy,
      bureau:           letter.bureau,
      triggered_by:     'client',
    },
  })

  return NextResponse.json({
    newLetterId:          newLetter.letter_id,
    round:                reDispute.round,
    strategy:             reDispute.strategy,
    requiresNotarization: reDispute.requiresNotarization,
    letterPreview:        reDispute.letterBody.slice(0, 200) + '…',
  })
}
