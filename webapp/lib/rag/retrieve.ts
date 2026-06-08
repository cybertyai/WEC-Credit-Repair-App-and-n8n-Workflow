import { VoyageAIClient } from 'voyageai'
import { createClient } from '@supabase/supabase-js'

export interface LegalChunk {
  id: string
  source_document: string
  section: string
  content: string
  similarity: number
}

export async function retrieveLegalContext(query: string, matchCount = 5): Promise<LegalChunk[]> {
  const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_AI_API_KEY! })
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let embedRes
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      embedRes = await voyage.embed({ input: [query], model: 'voyage-law-2' })
      break
    } catch (err: any) {
      if (err?.statusCode === 429 && attempt < 5) {
        await new Promise(r => setTimeout(r, attempt * 25000))
      } else {
        throw err
      }
    }
  }
  const queryEmbedding = embedRes!.data[0].embedding

  const { data, error } = await supabase.rpc('match_legal_chunks', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
  })

  if (error) throw error
  return data as LegalChunk[]
}
