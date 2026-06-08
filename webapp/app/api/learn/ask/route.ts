import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { retrieveLegalContext } from "@/lib/rag/retrieve";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { question } = await req.json().catch(() => ({}));
  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }

  const chunks = await retrieveLegalContext(question, 4);

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
        content: `Question: ${question}\n\nRelevant legal statutes:\n${context}`,
      },
    ],
  });

  const answer = (message.content[0] as { type: string; text: string }).text;
  const sources = chunks.map(c => ({ source_document: c.source_document, section: c.section }));

  return NextResponse.json({ answer, sources });
}
