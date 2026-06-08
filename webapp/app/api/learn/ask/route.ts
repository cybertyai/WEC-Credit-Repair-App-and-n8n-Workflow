import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { retrieveLegalContext } from "@/lib/rag/retrieve";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

const AskSchema = z.object({
  question: z.string().min(1).max(500),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = checkRateLimit(`learn:${user.id}`, 10, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const parsed = AskSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { question } = parsed.data;

  const safeQuestion = sanitizeText(question);
  const chunks = await retrieveLegalContext(safeQuestion, 4);

  const context = chunks
    .map(c => `[${c.source_document} — ${c.section}]\n${c.content}`)
    .join("\n\n---\n\n");

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 500,
    system: "You are a credit rights educator for a credit repair company. Answer consumer questions about credit law in plain English, citing specific statutes. Be accurate, concise, and helpful. Do not provide legal advice or make guarantees. Keep answers to 3-5 sentences.",
    messages: [
      {
        role: "user",
        content: `Question: ${safeQuestion}\n\nRelevant legal statutes:\n${context}`,
      },
    ],
  });

  const answer = (message.content[0] as { type: string; text: string }).text;
  const sources = chunks.map(c => ({ source_document: c.source_document, section: c.section }));

  return NextResponse.json({ answer, sources });
}
