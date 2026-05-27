import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { approveLetters, rejectLetter, signOut } from "@/app/actions";
import { fmtDate, statusInfo } from "@/lib/utils";
import { Shield, FileText, CheckCircle2, XCircle, Users, AlertCircle } from "lucide-react";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "williamsequitycapital@gmail.com";

interface Case {
  id: number; case_id: string; first_name: string; last_name: string;
  email: string; case_status: string; current_round: number; created_at: string;
}
interface DisputeLetter {
  letter_id: number; case_id: string; bureau: string; round: number;
  letter_status: string; created_at: string; letter_body?: string;
  lint_violations?: string[];
}

const BUREAU_DOT: Record<string, string> = {
  experian: "bg-bureau-experian", transunion: "bg-bureau-transunion", equifax: "bg-bureau-equifax",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect("/login");

  const { data: casesData } = await supabase.from("cases").select("*").order("created_at", { ascending: false });
  const cases: Case[] = (casesData as Case[]) ?? [];

  const pendingCaseIds = cases.filter((c) => c.case_status === "letters_pending_review").map((c) => c.case_id);
  let pendingLetters: DisputeLetter[] = [];
  if (pendingCaseIds.length > 0) {
    const { data } = await supabase
      .from("dispute_letters").select("*")
      .in("case_id", pendingCaseIds).eq("letter_status", "pending_review")
      .order("created_at", { ascending: false });
    pendingLetters = (data as DisputeLetter[]) ?? [];
  }

  const lettersByCase: Record<string, DisputeLetter[]> = {};
  for (const l of pendingLetters) {
    (lettersByCase[l.case_id] ??= []).push(l);
  }

  const stats = {
    total: cases.length,
    active: cases.filter((c) => ["in_progress","letters_pending_review","mailed"].includes(c.case_status)).length,
    pending: pendingLetters.length,
    resolved: cases.filter((c) => c.case_status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-brand-navy">
      {/* Header */}
      <header className="bg-surface-1 border-b border-white/[0.06] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center text-brand-navy font-black text-sm">WEC</div>
            <div>
              <span className="text-white font-bold text-sm">Williams Equity Capital</span>
              <span className="text-slate-500 text-xs ml-2">/ Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Shield className="w-3.5 h-3.5 text-brand-gold" /> {user.email}
            </div>
            <form action={signOut}>
              <button type="submit" className="btn-ghost text-xs py-1.5 px-3">Sign Out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div>
          <p className="section-label mb-1">Admin Console</p>
          <h1 className="text-2xl font-bold text-white">Case Management</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Cases",    value: stats.total,   color: "text-white",          icon: Users },
            { label: "Active",         value: stats.active,  color: "text-status-dispute",  icon: CheckCircle2 },
            { label: "Pending Review", value: stats.pending, color: "text-status-pending",  icon: FileText },
            { label: "Resolved",       value: stats.resolved,color: "text-status-resolved", icon: CheckCircle2 },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="stat-card flex items-center gap-4">
              <Icon className={`w-8 h-8 ${color} opacity-80`} />
              <div>
                <div className="section-label">{label}</div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending letters section */}
        {pendingLetters.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-pending inline-block animate-pulse" />
              Letters Awaiting Approval ({pendingLetters.length})
            </h2>
            {Object.entries(lettersByCase).map(([caseId, letters]) => {
              const caseRecord = cases.find((c) => c.case_id === caseId);
              return (
                <div key={caseId} className="card overflow-hidden border-brand-gold/10">
                  <div className="px-6 py-4 bg-brand-gold/5 border-b border-brand-gold/10 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm font-semibold text-brand-gold-2">{caseId}</span>
                      {caseRecord && (
                        <span className="text-slate-400 text-sm ml-3">
                          {caseRecord.first_name} {caseRecord.last_name} · {caseRecord.email}
                        </span>
                      )}
                    </div>
                    <span className="badge-amber">{letters.length} letter{letters.length !== 1 ? "s" : ""} pending</span>
                  </div>

                  <div className="divide-y divide-white/[0.04]">
                    {letters.map((l) => (
                      <div key={l.letter_id} className="p-6 space-y-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${BUREAU_DOT[l.bureau] ?? "bg-slate-500"}`} />
                            <div>
                              <span className="text-white font-medium capitalize">{l.bureau}</span>
                              <span className="text-slate-500 text-xs ml-3">Round {l.round} · {fmtDate(l.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <form action={async () => { "use server"; await approveLetters([l.letter_id]); }}>
                              <button type="submit" className="btn-gold text-xs py-1.5 px-3">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Dispatch
                              </button>
                            </form>
                            <form action={async () => { "use server"; await rejectLetter(l.letter_id, "Flagged for rewrite by admin"); }}>
                              <button type="submit" className="btn-ghost text-xs py-1.5 px-3 text-status-cancelled border-status-cancelled/20">
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </form>
                          </div>
                        </div>

                        {l.letter_body && (
                          <details className="group">
                            <summary className="text-xs text-brand-gold-2 cursor-pointer hover:text-brand-gold select-none">Preview letter ▸</summary>
                            <pre className="mt-3 p-4 rounded-xl bg-surface-3 text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-48 overflow-y-auto border border-white/[0.04]">
                              {l.letter_body}
                            </pre>
                          </details>
                        )}

                        {l.lint_violations && (l.lint_violations as string[]).length > 0 && (
                          <div className="flex items-start gap-2 p-3 rounded-xl bg-status-cancelled/5 border border-status-cancelled/15">
                            <AlertCircle className="w-4 h-4 text-status-cancelled flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-semibold text-status-cancelled">Lint Issues</div>
                              {(l.lint_violations as string[]).map((v, i) => <div key={i} className="text-xs text-slate-400 mt-0.5">{v}</div>)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {letters.length > 1 && (
                    <div className="px-6 py-4 bg-surface-2 border-t border-white/[0.06] flex justify-end">
                      <form action={async () => { "use server"; await approveLetters(letters.map((l) => l.letter_id)); }}>
                        <button type="submit" className="btn-gold text-sm">
                          <CheckCircle2 className="w-4 h-4" /> Approve All {letters.length} Letters
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* All cases table */}
        <section className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-gold" /> All Cases
            </h2>
            <span className="text-xs text-slate-500">{cases.length} total</span>
          </div>
          {cases.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">No cases yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/[0.04]">
                <thead>
                  <tr>
                    {["Case ID","Client","Email","Status","Round","Opened"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {cases.map((c) => {
                    const sm = statusInfo(c.case_status);
                    return (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3 text-sm font-mono text-brand-gold-2 whitespace-nowrap">{c.case_id}</td>
                        <td className="px-6 py-3 text-sm text-white whitespace-nowrap">{c.first_name} {c.last_name}</td>
                        <td className="px-6 py-3 text-sm text-slate-400">{c.email}</td>
                        <td className="px-6 py-3"><span className={sm.cls}>{sm.label}</span></td>
                        <td className="px-6 py-3 text-sm text-slate-400">{c.current_round ?? 1}</td>
                        <td className="px-6 py-3 text-sm text-slate-500 whitespace-nowrap">{fmtDate(c.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
