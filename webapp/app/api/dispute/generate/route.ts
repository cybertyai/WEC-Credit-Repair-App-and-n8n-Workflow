import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateDisputeLetter, DisputeInput } from '@/lib/dispute-engine/engine'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: DisputeInput
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const required = ['itemType', 'creditor', 'reason', 'clientName', 'clientAddress', 'bureau'] as const
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
    }
  }

  try {
    const result = await generateDisputeLetter(body)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[dispute/generate]', err)
    return NextResponse.json({ error: 'Letter generation failed' }, { status: 500 })
  }
}
