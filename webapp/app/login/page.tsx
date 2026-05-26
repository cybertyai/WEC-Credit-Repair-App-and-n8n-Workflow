"use client";

import { useState } from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <Link href="/" className="text-xl font-bold text-indigo-700 tracking-tight">
            Williams Equity Capital
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Client Portal Login</h1>
            <p className="text-sm text-slate-500 mb-6">
              Enter the email address you used when you applied. We&apos;ll send you a secure login link.
            </p>

            {sent ? (
              <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
                <p className="text-green-800 font-semibold mb-1">Check your email!</p>
                <p className="text-green-700 text-sm">
                  We sent a magic link to <span className="font-medium">{email}</span>. Click it to log in.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">{error}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full rounded-lg bg-indigo-600 py-2.5 px-6 text-white font-semibold text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                  {submitting ? "Sending..." : "Send Magic Link"}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            Not a client yet?{" "}
            <Link href="/" className="text-indigo-600 hover:underline">Apply now</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
