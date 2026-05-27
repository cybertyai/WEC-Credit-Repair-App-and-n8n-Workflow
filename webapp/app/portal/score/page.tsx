import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fmtDate, scoreLabel, scoreColor } from "@/lib/utils";
import { TrendingUp, Info } from "lucide-react";

const MILESTONES = [
  { score: 580, label: "Basic Approval",     desc: "Qualify for secured cards and some auto loans" },
  { score: 620, label: "FHA Mortgage",       desc: "Minimum FICO for FHA home loan eligibility" },
  { score: 670, label: "Good Credit",        desc: "Most mainstream credit cards and loans available" },
  { score: 700, label: "Better Rates",       desc: "Significantly lower interest rates across products" },
  { score: 740, label: "Prime Rates",        desc: "Best rates available on mortgages and auto loans" },
  { score: 800, label: "Exceptional",        desc: "Elite status — top-tier offers and lowest rates" },
];

export default async function ScorePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: casesData } = await supabase
    .from("cases").select("case_id").eq("email", user.email)
    .order("created_at", { ascending: false }).limit(1);
  const caseId = casesData?.[0]?.case_id;

  const { data: history } = caseId
    ? await supabase.from("score_history").select("*").eq("case_id", caseId).order("pulled_at", { ascending: false })
    : { data: [] };

  const latestByBureau: Record<string, { score: number; pulled_at: string; score_model: string }> = {};
  for (const row of (history ?? [])) {
    if (!latestByBureau[row.bureau]) {
      latestByBureau[row.bureau] = { score: row.score, pulled_at: row.pulled_at, score_model: row.score_model };
    }
  }

  const bureaus = ["experian", "transunion", "equifax"] as const;
  const hasScores = Object.keys(latestByBureau).length > 0;

  return (
    <div className="p-8 space-y-6">
      <div>
        <p className="section-label mb-1">Progress Tracking</p>
        <h1 className="text-2xl font-bold text-white">Credit Score Tracker</h1>
        <p className="text-slate-400 text-sm mt-1">3-bureau FICO scores updated each time your report is pulled</p>
      </div>

      {!hasScores ? (
        <div className="card p-10 text-center">
          <TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No score data yet.</p>
          <p className="text-slate-500 text-xs mt-1">Scores will appear after your first credit report pull.</p>
        </div>
      ) : (
        <>
          {/* Score gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bureaus.map((bureau) => {
              const data = latestByBureau[bureau];
              if (!data) return (
                <div key={bureau} className="stat-card items-center justify-center text-center">
                  <div className="section-label capitalize">{bureau}</div>
                  <div className="text-slate-500 text-sm mt-2">Not yet pulled</div>
                </div>
              );
              const { score, pulled_at, score_model } = data;
              const color = scoreColor(score);
              const label = scoreLabel(score);
              const pct = Math.round(((score - 300) / 550) * 100);
              const BUREAU_DOT: Record<string, string> = {
                experian: "bg-bureau-experian",
                transunion: "bg-bureau-transunion",
                equifax: "bg-bureau-equifax",
              };
              return (
                <div key={bureau} className="card p-6 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${BUREAU_DOT[bureau]}`} />
                    <span className="section-label capitalize">{bureau}</span>
                  </div>
                  <div className="relative w-24 h-24 mx-auto">
                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="6"
                        strokeDasharray={`${pct * 2.01} 201`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white">{score}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color }}>{label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{score_model} · {fmtDate(pulled_at)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Score history table */}
          {history && history.length > 3 && (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h2 className="font-semibold text-white">Score History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/[0.04]">
                  <thead>
                    <tr>
                      {["Date","Bureau","Score","Model"].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {history.map((row) => (
                      <tr key={row.history_id} className="hover:bg-white/[0.02]">
                        <td className="px-6 py-3 text-sm text-slate-400">{fmtDate(row.pulled_at)}</td>
                        <td className="px-6 py-3 text-sm text-white capitalize">{row.bureau}</td>
                        <td className="px-6 py-3 text-sm font-bold" style={{ color: scoreColor(row.score) }}>{row.score}</td>
                        <td className="px-6 py-3 text-sm text-slate-500">{row.score_model}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Milestones */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-gold" />
          <h2 className="font-semibold text-white">Score Milestones</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {MILESTONES.map(({ score, label, desc }) => {
            const lowestScore = Math.min(...Object.values(latestByBureau).map((d) => d.score).filter(Boolean), 850);
            const reached = hasScores && lowestScore >= score;
            return (
              <div key={score} className="px-6 py-4 flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  reached ? "bg-status-resolved/20 text-status-resolved" : "bg-surface-3 text-slate-500"
                }`}>
                  {reached ? "✓" : score}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${reached ? "text-status-resolved" : "text-white"}`}>{label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                </div>
                <div className="text-xs text-slate-600 font-mono">{score}+</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
