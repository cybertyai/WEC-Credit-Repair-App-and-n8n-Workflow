export type Bureau = 'Equifax' | 'TransUnion' | 'Experian'

export interface LetterInput {
  clientName: string
  clientAddress: string
  bureau: Bureau
  body: string
  date?: string
}

export const BUREAU_ADDRESSES: Record<Bureau, string> = {
  Equifax: 'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374',
  TransUnion: 'TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016',
  Experian: 'Experian\nP.O. Box 4500\nAllen, TX 75013',
}

export function buildDisputeLetter(input: LetterInput): string {
  const date = input.date ?? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return [
    input.clientName,
    input.clientAddress,
    '',
    date,
    '',
    BUREAU_ADDRESSES[input.bureau],
    '',
    `Re: Formal Dispute of Inaccurate Credit Information`,
    '',
    `To Whom It May Concern:`,
    '',
    input.body.trim(),
    '',
    'I respectfully request that you investigate this matter and correct my credit file in accordance with your obligations under the Fair Credit Reporting Act.',
    '',
    'Sincerely,',
    '',
    input.clientName,
    '',
    'Enclosures: Copy of government-issued ID, proof of address',
  ].join('\n')
}
