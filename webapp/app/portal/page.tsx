import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fmtDate, fmtRelative, statusInfo } from "@/lib/utils";
import {
  FileText, Bell, TrendingUp, Scale, AlertCircle,
  CheckCircle2, Clock, ChevronRight, ArrowRight, Gavel,
} from "lucide-react";

export default async function PortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: casesData } = await supabase
    .from("cases").select("*").eq("email", user.email).order("created_at", { ascending: false });

  const latestCase = casesData?.[0] ?? null;

  let letters: Record<string, unknown>[]       = [];
  let notifications: Record<string, unknown>[] = [];
  let negItems: Record<string, unknown>[]      = [];
  let scoreHistory: Record<string, unknown>[]  = [];

  if (latestCase) {
    const [lr, nr, nir, sr] = await Promise.all([
      supabase.from("dispute_letters").select("*").eq("case_id", latestCase.case_id).order("created_at", { ascending: false }).limit(5),
      supabase.from("notifications").select("*").eq("case_id", latestCase.case_id).order("sent_at", { ascending: false }).limit(5),
      supabase.from("negative_items").select("*").eq("case_id", latestCase.case_id),
      supabase.from("score_history").select("*").eq("case_id", latestCase.case_id).order("pulled_at", { ascending: false }).limit(3),
    ]);
    letters       = (lr.data  as Record<string, unknown>[]) ?? [];
    notifications = (nr.data  as Record<string, unknown>[]) ?? [];
    negItems      = (nir.data as Record<string, unknown>[]) ?? [];
    scoreHistory  = (sr.data  as Record<string, unknown>[]) ?? [];
  }

  const disputable   = negItems.filter((i) => i.analysis_status === "disputable").length;
  const doNotDispute = negItems.filter((i) => i.analysis_status === "do_not_dispute").length;
  const pendingItems = negItems.filter((i) => i.analysis_status === "pending").length;
  const statusMeta   = latestCase ? statusInfo(latestCase.case_status as string) : null;

  const latestScores: Record<string, number> = {};
  for (const s of scoreHistory) {
    const b = s.bureau as string;
    if (!latestScores[b]) latestScores[b] = s.score as number;
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label mb-1">Client Dashboard</p>
          <h1 className="text-2xl font-bold text-white">Good morning 👋</h1>
          <p className="text-slate-400 text-sm mt-1">{user.email}</p>
        </div>
        {latestCase && (
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-1">Case ID</div>
            <div className="font-mono text-brand-gold-2 font-semibold text-sm">{latestCase.case_id as string}</div>
            <div className="mt-1.5">
              {statusMeta && <span className={statusMeta.cls}>{statusMeta.label}</span>}
            </div>
          </div>
        )}
      </div>

      {!latestCase ? (
        <div className="card p-10 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400">No active case found. If you recently applied, your case may still be processing.</p>
          <Link href="/" className="btn-gold">Start a Free Evaluation</Link>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Negative Items",  value: negItems.length,         sub: "Found on report",          color: "text-status-cancelled" },
              { label: "Disputable",      value: disputable,              sub: `${doNotDispute} excluded`,  color: "text-brand-gold-2" },
              { label: "Dispute Round",   value: latestCase.current_round ?? 1, sub: "Current round",      color: "text-status-dispute" },
              { label: "Letters Drafted", value: letters.length,          sub: "This round",               color: "text-status-mailed" },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="stat-card">
                <div className="section-label">{label}</div>
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-slate-500">{sub}</div>
              </div>
            ))}
          </div>

          {/* CROA cooling-off banner */}
          {latestCase.case_status === "cooling_off" && latestCase.cancellation_deadline && (
            <div className="card p-4 border border-status-pending/20 bg-status-pending/5 flex items-start gap-3">
              <Clock className="w-5 h-5 text-status-pending flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-white">CROA 3-Day Cancellation Window Active</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  You may cancel without charge before{" "}
                  <span className="text-status-pending font-medium">{fmtDate(latestCase.cancellation_deadline as string)}</span>.
                </div>
              </div>
            </div>
          )}

          {/* Letters pending review alert */}
          {latestCase.case_status === "letters_pending_review" && (
            <div className="card p-4 border border-brand-gold/20 bg-brand-gold/5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-white">Letters Ready for Review</div>
                  <div className="text-xs text-slate-400 mt-0.5">Your dispute letters are drafted and awaiting approval before certified mail dispatch.</div>
                </div>
              </div>
              <span className="badge badge-gold whitespace-nowrap">In Review</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: letters + activity */}
            <div className="lg:col-span-2 space-y-6">

              {/* Dispute letters */}
              <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-gold" /> Dispute Letters
                  </h2>
                  <Link href="/portal/letters" className="text-xs text-brand-gold-2 hover:underline flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                {letters.length === 0 ? (
                  <div className="px-6 py-8 text-center text-sm text-slate-500">
                    {pendingItems > 0 ? "Your credit report is being analyzed — letters will appear shortly." : "No dispute letters yet."}
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {letters.map((l) => {
                      const cls: Record<string, string> = {
                        pending_review: "badge-amber",
                        approved: "badge-green",
                        mailed: "badge-purple",
                        needs_rewrite: "badge-red",
                      };
                      const bureauDot: Record<string, string> = {
                        experian: "bg-bureau-experian",
                        transunion: "bg-bureau-transunion",
                        equifax: "bg-bureau-equifax",
                      };
                      return (
                        <div key={l.letter_id as number} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${bureauDot[l.bureau as string] ?? "bg-slate-500"}`} />
                            <div>
                              <div className="text-sm font-medium text-white capitalize">{l.bureau as string}</div>
                              <div className="text-xs text-slate-500">Round {l.round as number} · {fmtDate(l.created_at as string)}</div>
                            </div>
                          </div>
                          <span className={cls[l.letter_status as string] ?? "badge-gold"}>
                            {(l.letter_status as string).replace(/_/g, " ")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Activity timeline */}
              <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-brand-gold" /> Recent Activity
                  </h2>
                  <Link href="/portal/notifications" className="text-xs text-brand-gold-2 hover:underline flex items-center gap-1">
                    All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                {notifications.length === 0 ? (
                  <div className="px-6 py-8 text-center text-sm text-slate-500">No activity yet.</div>
                ) : (
                  <ul className="divide-y divide-white/[0.04]">
                    {notifications.map((n) => (
                      <li key={n.notification_id as number} className="px-6 py-4 flex items-start gap-4">
                        <CheckCircle2 className="w-4 h-4 text-status-resolved flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white capitalize">{(n.event_type as string).replace(/_/g, " ")}</p>
                          <p className="text-xs text-slate-500 mt-0.5">via {n.channel as string} · {fmtRelative(n.sent_at as string)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Right: scores + quick actions */}
            <div className="space-y-5">
              {/* Score snapshot */}
              <div className="card p-5 space-y-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-gold" /> Credit Scores
                </h2>
                {Object.keys(latestScores).length === 0 ? (
                  <p className="text-xs text-slate-500">Scores will appear after your first credit report pull.</p>
                ) : (
                  <div className="space-y-3">
                    {(["experian","transunion","equifax"] as const).map((b) => {
                      const score = latestScores[b];
                      if (!score) return null;
                      const pct = Math.round(((score - 300) / 550) * 100);
                      const c = score >= 740 ? "#22C55E" : score >= 670 ? "#3B82F6" : score >= 580 ? "#F59E0B" : "#EF4444";
                      return (
                        <div key={b}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-400 capitalize">{b}</span>
                            <span className="text-sm font-bold" style={{ color: c }}>{score}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Link href="/portal/score" className="text-xs text-brand-gold-2 hover:underline flex items-center gap-1">
                  Full score tracker <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Quick links */}
              <div className="card p-5 space-y-1.5">
                <h2 className="font-semibold text-white mb-3">Quick Actions</h2>
                {[
                  { href: "/portal/letters",      icon: FileText,    label: "View Dispute Letters" },
                  { href: "/portal/legal",         icon: Scale,       label: "Legal Letter Generator" },
                  { href: "/portal/score",         icon: TrendingUp,  label: "Score Tracker" },
                  { href: "/portal/notifications", icon: Bell,        label: "All Notifications" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all group">
                    <Icon className="w-4 h-4 text-brand-gold flex-shrink-0" />
                    <span className="text-sm text-slate-300 group-hover:text-white flex-1">{label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                  </Link>
                ))}
              </div>

              {/* Legal tools CTA */}
              <div className="card p-5 border-brand-gold/10 bg-gradient-to-br from-surface-2 to-surface-1">
                <div className="flex items-start gap-3 mb-3">
                  <Gavel className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-white">Sue for Violations</div>
                    <div className="text-xs text-slate-400 mt-0.5">FDCPA &amp; FCRA demand letters with real statute citations and landmark case law.</div>
                  </div>
                </div>
                <Link href="/portal/legal" className="btn-gold w-full justify-center text-xs py-2">
                  Open Legal Letter Generator
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
