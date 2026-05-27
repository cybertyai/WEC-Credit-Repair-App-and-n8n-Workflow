import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/utils";
import { FileText, Mail, Clock, AlertTriangle } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  pending_review: { label: "Pending Review", cls: "badge-amber",  icon: Clock },
  approved:       { label: "Approved",       cls: "badge-green",  icon: FileText },
  mailed:         { label: "Mailed",         cls: "badge-purple", icon: Mail },
  needs_rewrite:  { label: "Needs Rewrite",  cls: "badge-red",    icon: AlertTriangle },
};

const BUREAU_COLOR: Record<string, string> = {
  experian:   "bg-bureau-experian",
  transunion: "bg-bureau-transunion",
  equifax:    "bg-bureau-equifax",
};

export default async function LettersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: casesData } = await supabase
    .from("cases").select("case_id,current_round").eq("email", user.email)
    .order("created_at", { ascending: false }).limit(1);

  const caseId = casesData?.[0]?.case_id;

  const { data: letters } = caseId
    ? await supabase.from("dispute_letters").select("*").eq("case_id", caseId).order("created_at", { ascending: false })
    : { data: [] };

  const rounds = [...new Set((letters ?? []).map((l) => l.round as number))].sort((a, b) => b - a);

  return (
    <div className="p-8 space-y-6">
      <div>
        <p className="section-label mb-1">Dispute Letters</p>
        <h1 className="text-2xl font-bold text-white">Your Letters</h1>
        <p className="text-slate-400 text-sm mt-1">All FCRA dispute letters generated on your behalf</p>
      </div>

      {!letters || letters.length === 0 ? (
        <div className="card p-10 text-center">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No dispute letters have been generated yet.</p>
          <p className="text-slate-500 text-xs mt-1">Letters will appear here after your credit report is analyzed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rounds.map((round) => {
            const roundLetters = letters.filter((l) => l.round === round);
            return (
              <div key={round} className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <h2 className="font-semibold text-white">Round {round} Letters</h2>
                  <span className="text-xs text-slate-500">{roundLetters.length} letter{roundLetters.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {roundLetters.map((l) => {
                    const sc = STATUS_CONFIG[l.letter_status] ?? { label: l.letter_status, cls: "badge-gold", icon: FileText };
                    const StatusIcon = sc.icon;
                    return (
                      <div key={l.letter_id} className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${BUREAU_COLOR[l.bureau] ?? "bg-slate-500"}`} />
                            <div>
                              <div className="text-white font-semibold capitalize">{l.bureau}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{fmtDate(l.created_at)}</div>
                            </div>
                          </div>
                          <span className={sc.cls}>
                            <StatusIcon className="w-3 h-3" /> {sc.label}
                          </span>
                        </div>

                        {l.tracking_number && (
                          <div className="flex items-center gap-2 text-xs text-slate-400 bg-surface-2 rounded-lg px-3 py-2">
                            <Mail className="w-3.5 h-3.5 text-status-mailed" />
                            Tracking: <span className="font-mono text-white">{l.tracking_number}</span>
                            {l.mailed_at && <span className="ml-1">· Mailed {fmtDate(l.mailed_at)}</span>}
                          </div>
                        )}

                        {l.fcra_response_due && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-status-pending" />
                            Bureau response due: <span className="text-status-pending font-medium">{fmtDate(l.fcra_response_due)}</span>
                          </div>
                        )}

                        {l.letter_body && (
                          <details className="group">
                            <summary className="text-xs text-brand-gold-2 cursor-pointer hover:text-brand-gold transition-colors select-none">
                              View letter content ▸
                            </summary>
                            <pre className="mt-3 p-4 rounded-xl bg-surface-3 text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-64 overflow-y-auto border border-white/[0.04]">
                              {l.letter_body}
                            </pre>
                          </details>
                        )}

                        {l.lint_violations && (l.lint_violations as string[]).length > 0 && (
                          <div className="flex items-start gap-2 p-3 rounded-xl bg-status-cancelled/5 border border-status-cancelled/15">
                            <AlertTriangle className="w-4 h-4 text-status-cancelled flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-semibold text-status-cancelled">Compliance Issues</div>
                              {(l.lint_violations as string[]).map((v, i) => (
                                <div key={i} className="text-xs text-slate-400 mt-0.5">{v}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
