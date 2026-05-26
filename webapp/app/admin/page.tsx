import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { approveLetters, signOut } from "@/app/actions";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "williamsequitycapital@gmail.com";

type CaseStatus = "cooling_off" | "in_progress" | "letters_pending_review" | "mailed" | string;

interface Case {
  id: number;
  case_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: CaseStatus;
  round: number;
  created_at: string;
}

interface DisputeLetter {
  id: number;
  case_id: string;
  bureau: string;
  round: number;
  status: string;
  created_at: string;
}

function StatusBadge({ status }: { status: CaseStatus }) {
  const map: Record<string, { dot: string; text: string; label: string }> = {
    cooling_off: { dot: "bg-slate-400", text: "text-slate-700", label: "Cooling Off" },
    in_progress: { dot: "bg-blue-500", text: "text-blue-700", label: "In Progress" },
    letters_pending_review: { dot: "bg-yellow-400", text: "text-yellow-700", label: "Pending Review" },
    mailed: { dot: "bg-green-500", text: "text-green-700", label: "Mailed" },
  };

  const style = map[status] ?? { dot: "bg-slate-300", text: "text-slate-600", label: status };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.text}`}>
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/login");
  }

  const { data: casesData } = await supabase.from("cases").select("*").order("created_at", { ascending: false });
  const cases: Case[] = (casesData as Case[]) ?? [];

  const pendingCaseIds = cases.filter((c) => c.status === "letters_pending_review").map((c) => c.case_id);

  let pendingLetters: DisputeLetter[] = [];
  if (pendingCaseIds.length > 0) {
    const { data: lettersData } = await supabase
      .from("dispute_letters")
      .select("*")
      .in("case_id", pendingCaseIds)
      .eq("status", "pending_review")
      .order("created_at", { ascending: false });
    pendingLetters = (lettersData as DisputeLetter[]) ?? [];
  }

  const lettersByCase: Record<string, DisputeLetter[]> = {};
  for (const letter of pendingLetters) {
    if (!lettersByCase[letter.case_id]) lettersByCase[letter.case_id] = [];
    lettersByCase[letter.case_id].push(letter);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-700 tracking-tight">
            Williams Equity Capital <span className="text-slate-400 font-normal text-sm">/ Admin</span>
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:block">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Sign Out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">{cases.length} total case{cases.length !== 1 ? "s" : ""}</p>
        </div>

        {pendingLetters.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 inline-block" />
              Letters Awaiting Approval
            </h2>
            <div className="space-y-4">
              {Object.entries(lettersByCase).map(([caseId, letters]) => {
                const caseRecord = cases.find((c) => c.case_id === caseId);
                return (
                  <div key={caseId} className="bg-white rounded-xl border border-yellow-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-sm font-semibold text-indigo-700">{caseId}</span>
                        {caseRecord && (
                          <span className="text-slate-600 text-sm ml-2">
                            — {caseRecord.first_name} {caseRecord.last_name} ({caseRecord.email})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-yellow-700 font-medium">
                        {letters.length} letter{letters.length !== 1 ? "s" : ""} pending
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Bureau</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Round</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {letters.map((letter) => (
                            <tr key={letter.id} className="hover:bg-slate-50">
                              <td className="px-6 py-3 text-sm text-slate-800 capitalize">{letter.bureau}</td>
                              <td className="px-6 py-3 text-sm text-slate-600">{letter.round}</td>
                              <td className="px-6 py-3 text-sm text-slate-500">{new Date(letter.created_at).toLocaleDateString()}</td>
                              <td className="px-6 py-3">
                                <form action={async () => { "use server"; await approveLetters([letter.id]); }}>
                                  <button type="submit"
                                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                                    Approve &amp; Dispatch
                                  </button>
                                </form>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {letters.length > 1 && (
                      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <form action={async () => { "use server"; await approveLetters(letters.map((l) => l.id)); }}>
                          <button type="submit"
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors">
                            Approve All {letters.length} Letters
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">All Cases</h2>
          </div>
          {cases.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-400">No cases yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Case ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Round</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm font-mono text-indigo-600 whitespace-nowrap">{c.case_id}</td>
                      <td className="px-6 py-3 text-sm text-slate-800 whitespace-nowrap">{c.first_name} {c.last_name}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{c.email}</td>
                      <td className="px-6 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-6 py-3 text-sm text-slate-600">{c.round ?? 1}</td>
                      <td className="px-6 py-3 text-sm text-slate-500 whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
