import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/utils";
import { ListChecks, Clock, CheckCircle2, XCircle, AlertCircle, Mail } from "lucide-react";

const ROUND_LABELS: Record<number, string> = { 1: "Round 1", 2: "Round 2", 3: "Round 3 — Escalation" };

function statusIcon(status: string) {
  switch (status) {
    case "sent":        return <Mail className="w-4 h-4 text-blue-400" aria-label="Sent" />;
    case "approved":    return <CheckCircle2 className="w-4 h-4 text-status-active" aria-label="Approved" />;
    case "delivered":   return <CheckCircle2 className="w-4 h-4 text-status-active" aria-label="Delivered" />;
    case "resolved":    return <CheckCircle2 className="w-4 h-4 text-status-active" aria-label="Resolved" />;
    case "rejected":    return <XCircle className="w-4 h-4 text-status-cancelled" aria-label="Rejected" />;
    case "needs_rewrite": return <AlertCircle className="w-4 h-4 text-brand-gold" aria-label="Needs rewrite" />;
    default:            return <Clock className="w-4 h-4 text-slate-500" aria-label="Pending" />;
  }
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default async function DisputesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: casesData } = await supabase
    .from("cases").select("*").eq("email", user.email).order("created_at", { ascending: false }).limit(1);
  const latestCase = casesData?.[0] ?? null;

  let letters: Record<string, unknown>[] = [];
  let negItems: Record<string, unknown>[] = [];

  if (latestCase) {
    const [lr, nir] = await Promise.all([
      supabase.from("dispute_letters").select("*").eq("case_id", latestCase.case_id).order("created_at", { ascending: false }),
      supabase.from("negative_items").select("*").eq("case_id", latestCase.case_id),
    ]);
    letters  = (lr.data  as Record<string, unknown>[]) ?? [];
    negItems = (nir.data as Record<string, unknown>[]) ?? [];
  }

  const byRound: Record<number, Record<string, unknown>[]> = {};
  for (const l of letters) {
    const r = (l.round as number) ?? 1;
    if (!byRound[r]) byRound[r] = [];
    byRound[r].push(l);
  }
  const rounds = Object.keys(byRound).map(Number).sort();

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <p className="section-label mb-1">Dispute Management</p>
        <h1 className="text-2xl font-bold text-white">Dispute Tracker</h1>
        <p className="text-slate-400 text-sm mt-1">Timeline of all dispute letters by round</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Letters",  value: letters.length },
          { label: "Negative Items", value: negItems.length },
          { label: "Disputable",     value: negItems.filter(i => i.analysis_status === "disputable").length },
          { label: "Rounds Active",  value: rounds.length },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card">
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {letters.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-center">
          <ListChecks className="w-10 h-10 text-slate-600" />
          <p className="text-slate-400 text-sm">No dispute letters yet. Letters appear here once your case is processed.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {rounds.map((round) => (
            <section key={round} aria-label={`${ROUND_LABELS[round] ?? `Round ${round}`} disputes`}>
              <div className="gold-bar mb-4">
                <h2 className="text-sm font-semibold text-white">{ROUND_LABELS[round] ?? `Round ${round}`}</h2>
                <span className="text-xs text-slate-500">{byRound[round].length} letter{byRound[round].length !== 1 ? "s" : ""}</span>
              </div>

              <ol className="relative border-l border-white/[0.08] ml-3 space-y-6" aria-label={`Round ${round} letter timeline`}>
                {byRound[round].map((letter) => (
                  <li key={String(letter.letter_id)} className="ml-6">
                    <span className="absolute -left-2 flex items-center justify-center w-4 h-4">
                      {statusIcon(String(letter.status ?? "pending"))}
                    </span>
                    <div className="card p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {String(letter.bureau ?? "Bureau")} — {String(letter.dispute_type ?? "Dispute")}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{fmtDate(String(letter.created_at))}</p>
                        </div>
                        <span className={`badge-${letter.status === "approved" || letter.status === "resolved" ? "green" : letter.status === "rejected" ? "red" : "blue"} text-xs`}>
                          {statusLabel(String(letter.status ?? "pending"))}
                        </span>
                      </div>
                      {letter.tracking_number != null && (
                        <p className="text-xs text-slate-500">
                          Tracking: <span className="font-mono text-slate-400">{String(letter.tracking_number)}</span>
                        </p>
                      )}
                      {letter.admin_note != null && (
                        <p className="text-xs text-slate-400 italic">Note: {String(letter.admin_note)}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
