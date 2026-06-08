import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateDisputeLetter } from '@/lib/dispute-engine/engine'
import { checkRateLimit } from '@/lib/rate-limit'

const DisputeSchema = z.object({
  itemType: z.enum(['late_payment', 'collection', 'charge_off', 'bankruptcy', 'hard_inquiry', 'not_mine']),
  creditor: z.string().min(1).max(200),
  accountNumber: z.string().max(50).optional(),
  amount: z.number().positive().optional(),
  reason: z.string().min(1).max(1000),
  clientName: z.string().min(1).max(200),
  clientAddress: z.string().min(1).max(500),
  bureau: z.enum(['Equifax', 'TransUnion', 'Experian']),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = checkRateLimit(`dispute:${user.id}`, 10, 60_000)
  if (!rl.allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const parsed = DisputeSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const result = await generateDisputeLetter(parsed.data)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[dispute/generate]', err)
    return NextResponse.json({ error: 'Letter generation failed' }, { status: 500 })
  }
}
