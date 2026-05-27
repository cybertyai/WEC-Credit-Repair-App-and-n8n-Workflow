"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Shield, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) { setError(authError.message); }
    else { setSent(true); }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col">
      <header className="bg-surface-1 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gold-gradient flex items-center justify-center text-brand-navy font-black text-xs">WEC</div>
            <span className="text-white font-bold text-sm">Williams Equity Capital</span>
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">Apply Now</Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center text-brand-navy font-black text-lg mx-auto mb-4">WEC</div>
            <h1 className="text-2xl font-bold text-white">Client Portal Login</h1>
            <p className="text-slate-400 text-sm mt-2">Enter your email to receive a secure magic link</p>
          </div>

          <div className="card p-8">
            {sent ? (
              <div className="text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-status-resolved mx-auto" />
                <h2 className="text-lg font-semibold text-white">Check Your Email</h2>
                <p className="text-slate-400 text-sm">
                  We sent a magic link to <span className="text-white font-medium">{email}</span>.
                  Click it to log in — no password needed.
                </p>
                <p className="text-slate-500 text-xs">The link expires in 60 minutes.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-status-cancelled/10 border border-status-cancelled/20 text-status-cancelled text-sm">{error}</div>
                )}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">
                    <Mail className="w-3 h-3 inline mr-1" /> Email Address
                  </label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="you@example.com" autoComplete="email" />
                </div>
                <button type="submit" disabled={submitting} className="btn-gold w-full justify-center py-3">
                  {submitting ? "Sending..." : <><span>Send Magic Link</span> <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}
          </div>

          <div className="flex items-center gap-2 justify-center text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-brand-gold" />
            <span>Secured by Supabase Auth · FCRA-compliant portal</span>
          </div>

          <p className="text-center text-sm text-slate-500">
            Not a client?{" "}
            <Link href="/" className="text-brand-gold-2 hover:underline">Apply for free</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
