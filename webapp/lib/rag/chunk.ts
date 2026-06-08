export interface TextChunk {
  source_document: string
  section: string
  chunk_index: number
  content: string
}

const MAX_CHARS = 1800
const OVERLAP_CHARS = 150

export function chunkDocument(sourceDocument: string, text: string): TextChunk[] {
  const sections = splitIntoSections(text)
  const chunks: TextChunk[] = []
  let globalIndex = 0

  for (const { title, body } of sections) {
    const subChunks = splitByLength(body, MAX_CHARS, OVERLAP_CHARS)
    for (const content of subChunks) {
      chunks.push({ source_document: sourceDocument, section: title, chunk_index: globalIndex++, content })
    }
  }

  return chunks
}

function splitIntoSections(text: string): { title: string; body: string }[] {
  const lines = text.split('\n')
  const sections: { title: string; body: string }[] = []
  let currentTitle = 'Preamble'
  let currentBody: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^§\s*\d/.test(trimmed) || /^Section\s+\d/i.test(trimmed)) {
      if (currentBody.join('\n').trim().length > 50) {
        sections.push({ title: currentTitle, body: currentBody.join('\n').trim() })
      }
      currentTitle = trimmed
      currentBody = [line]
    } else {
      currentBody.push(line)
    }
  }

  if (currentBody.join('\n').trim().length > 50) {
    sections.push({ title: currentTitle, body: currentBody.join('\n').trim() })
  }

  return sections
}

function splitByLength(text: string, maxChars: number, overlapChars: number): string[] {
  if (text.length <= maxChars) return [text]

  const chunks: string[] = []
  const paragraphs = text.split(/\n\n+/)
  let current = ''

  for (const para of paragraphs) {
    if ((current ? current.length + 2 : 0) + para.length <= maxChars) {
      current = current ? `${current}\n\n${para}` : para
    } else {
      if (current) {
        chunks.push(current)
        const overlap = current.slice(-overlapChars)
        current = overlap ? `${overlap}\n\n${para}` : para
      } else {
        const sentences = para.match(/[^.!?]+[.!?]+\s*/g) ?? [para]
        for (const sent of sentences) {
          if (current.length + sent.length <= maxChars) {
            current += sent
          } else {
            if (current) chunks.push(current)
            current = sent
          }
        }
      }
    }
  }

  if (current) chunks.push(current)
  return chunks
}
