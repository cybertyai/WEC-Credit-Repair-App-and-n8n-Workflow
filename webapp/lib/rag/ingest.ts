import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { VoyageAIClient } from 'voyageai'
import { createClient } from '@supabase/supabase-js'
import { chunkDocument } from './chunk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const CORPUS_DIR = join(__dirname, '../../../rag/corpus')
const BATCH_SIZE = 64

async function main() {
  const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_AI_API_KEY! })
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const files = readdirSync(CORPUS_DIR).filter(f => f.endsWith('.txt'))
  console.log(`Found ${files.length} corpus files`)

  for (const file of files) {
    const sourceDoc = file.replace('.txt', '').toUpperCase()
    console.log(`\nProcessing ${sourceDoc}...`)

    const { error: delErr } = await supabase
      .from('legal_chunks')
      .delete()
      .eq('source_document', sourceDoc)
    if (delErr) throw delErr

    const text = readFileSync(join(CORPUS_DIR, file), 'utf-8')
    const chunks = chunkDocument(sourceDoc, text)
    console.log(`  ${chunks.length} chunks`)

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE)

      const embedWithRetry = async () => {
        for (let attempt = 1; attempt <= 5; attempt++) {
          try {
            return await voyage.embed({ input: batch.map(c => c.content), model: 'voyage-law-2' })
          } catch (err: any) {
            if (err?.statusCode === 429 && attempt < 5) {
              const wait = attempt * 25000
              console.log(`  rate limited — waiting ${wait / 1000}s (attempt ${attempt}/5)`)
              await new Promise(r => setTimeout(r, wait))
            } else {
              throw err
            }
          }
        }
        throw new Error('Embedding failed after 5 attempts')
      }

      const res = await embedWithRetry()
      if (!res.data) throw new Error('Voyage AI returned no embedding data')
      const rows = batch.map((chunk, j) => ({
        ...chunk,
        embedding: res.data![j].embedding,
      }))

      const { error } = await supabase.from('legal_chunks').insert(rows)
      if (error) throw error

      console.log(`  embedded ${i + batch.length}/${chunks.length}`)
      if (i + BATCH_SIZE < chunks.length) await new Promise(r => setTimeout(r, 21000))
    }
  }

  console.log('\nIngestion complete.')
}

main().catch(err => { console.error(err); process.exit(1) })
