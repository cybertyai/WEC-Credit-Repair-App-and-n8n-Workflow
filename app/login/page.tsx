"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
    const origin = window.location.origin;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }

    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-[#152d4a] flex flex-col">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-xl font-bold text-accent">W</span>
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">Williams Equity Capital</span>
              <p className="text-xs text-white/60 -mt-0.5">Credit Repair Specialists</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Login card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Client Portal Login</h1>
              <p className="text-muted-foreground">
                Enter the email address you used when you applied. We&apos;ll send you a secure login link.
              </p>
            </div>

            {sent ? (
              <div className="rounded-xl bg-success/10 border border-success/30 p-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-3" />
                <p className="text-foreground font-semibold mb-1">Check your email!</p>
                <p className="text-muted-foreground text-sm">
                  We sent a magic link to <span className="font-medium text-foreground">{email}</span>. Click it to log in.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-destructive text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 px-6 text-primary-foreground font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Magic Link"
                  )}
                </button>
              </form>
            )}

            {/* Security note */}
            <p className="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="h-3 w-3" />
              Secured with bank-level encryption
            </p>
          </div>

          {/* Apply CTA */}
          <p className="text-center text-white/70 mt-6">
            Not a client yet?{" "}
            <Link href="/#apply" className="text-accent hover:text-accent/80 font-semibold transition-colors">
              Apply now
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
