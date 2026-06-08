"use client";

import { useState } from "react";
import { BookOpen, Send, Loader2, Scale, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { source_document: string; section: string }[];
}

const STARTER_QUESTIONS = [
  "How long can a late payment stay on my credit report?",
  "What is the 30-day dispute investigation rule?",
  "What are my rights if a debt collector harasses me?",
  "Can a collection account be removed if I pay it?",
  "What is the difference between FCRA and FDCPA?",
];

export default function LearnPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(question: string) {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setInput("");
    setError("");
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const res = await fetch("/api/learn/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
      }]);
    } catch {
      setError("Something went wrong. Please try again.");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-8 flex flex-col h-[calc(100vh-0px)] max-h-screen">
      <div className="mb-5 flex-shrink-0">
        <p className="section-label mb-1">Education Hub</p>
        <h1 className="text-2xl font-bold text-white">Credit Law Q&amp;A</h1>
        <p className="text-slate-400 text-sm mt-1">Ask questions about FCRA, FDCPA, CROA, ECOA and FCBA — answers grounded in real statutes</p>
      </div>

      {/* Legal disclaimer */}
      <div className="card p-3 flex items-start gap-2 border-brand-gold/10 bg-brand-gold/5 mb-4 flex-shrink-0">
        <Scale className="w-3.5 h-3.5 text-brand-gold flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400">Educational information only — not legal advice. For litigation, consult a licensed consumer rights attorney.</p>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0" aria-live="polite" aria-label="Conversation">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Try one of these questions:</p>
            <div className="flex flex-col gap-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left p-3 rounded-xl bg-surface-1 border border-white/[0.06] text-sm text-slate-300 hover:border-brand-gold/30 hover:text-white transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center flex-shrink-0 text-[10px] font-black text-brand-navy mt-0.5">
                AI
              </div>
            )}
            <div className={cn(
              "max-w-[80%] space-y-2",
              msg.role === "user" ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-brand-gold/10 text-white border border-brand-gold/20 rounded-tr-sm"
                  : "bg-surface-1 text-slate-300 border border-white/[0.06] rounded-tl-sm"
              )}>
                {msg.content}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-1">
                  {msg.sources.slice(0, 3).map((s, j) => (
                    <span key={j} className="text-[10px] bg-surface-2 text-slate-500 rounded px-2 py-0.5 font-mono border border-white/[0.04]">
                      {s.source_document} — {s.section.replace(/^§\s*/, "§")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center text-[10px] font-black text-brand-navy">AI</div>
            <div className="card px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching statutes…
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-status-cancelled mb-2 flex-shrink-0" role="alert">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
        className="flex gap-2 flex-shrink-0"
        aria-label="Ask a question"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your credit rights…"
          disabled={loading}
          className="flex-1"
          aria-label="Question input"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn-gold disabled:opacity-40 disabled:cursor-not-allowed px-4"
          aria-label="Send question"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
