import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";

type CaseStatus =
  | "cooling_off"
  | "in_progress"
  | "letters_pending_review"
  | "mailed"
  | string;

interface Case {
  id: number;
  case_id: string;
  email: string;
  status: CaseStatus;
  round: number;
  created_at: string;
  cancellation_deadline?: string | null;
}

interface DisputeLetter {
  id: number;
  case_id: string;
  bureau: string;
  round: number;
  status: string;
  created_at: string;
}

interface Notification {
  id: number;
  case_id: string;
  event_type: string;
  channel: string;
  sent_at: string;
}

function StatusBadge({ status }: { status: CaseStatus }) {
  const map: Record<string, { dot: string; text: string; label: string }> = {
    cooling_off: { dot: "bg-slate-400", text: "text-slate-700", label: "Cooling Off Period" },
    in_progress: { dot: "bg-blue-500", text: "text-blue-700", label: "In Progress" },
    letters_pending_review: { dot: "bg-yellow-400", text: "text-yellow-700", label: "Letters Pending Review" },
    mailed: { dot: "bg-green-500", text: "text-green-700", label: "Mailed" },
  };

  const style = map[status] ?? { dot: "bg-slate-300", text: "text-slate-600", label: status };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-opacity-10 ${style.text}`}>
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

function CancellationCountdown({ deadline }: { deadline: string }) {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return <p className="text-sm text-slate-500">Cancellation period has ended.</p>;
  }

  return (
    <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
      <p className="text-sm text-slate-600">
        <span className="font-semibold text-slate-800">Cancellation deadline:</span>{" "}
        {deadlineDate.toLocaleDateString()} —{" "}
        <span className="font-semibold text-indigo-600">
          {diffDays} day{diffDays !== 1 ? "s" : ""} remaining
        </span>
      </p>
    </div>
  );
}

export default async function PortalPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: cases } = await supabase
    .from("cases")
    .select("*")
    .eq("email", user.email)
    .order("created_at", { ascending: false });

  const latestCase: Case | null = cases && cases.length > 0 ? (cases[0] as Case) : null;

  let letters: DisputeLetter[] = [];
  let notifications: Notification[] = [];

  if (latestCase) {
    const [lettersRes, notificationsRes] = await Promise.all([
      supabase.from("dispute_letters").select("*").eq("case_id", latestCase.case_id).order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").eq("case_id", latestCase.case_id).order("sent_at", { ascending: false }),
    ]);

    letters = (lettersRes.data as DisputeLetter[]) ?? [];
    notifications = (notificationsRes.data as Notification[]) ?? [];
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-700 tracking-tight">Williams Equity Capital</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:block">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Sign Out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, {user.email}</p>
        </div>

        {!latestCase ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-500">No cases found for this account. If you recently applied, your case may still be processing.</p>
          </div>
        ) : (
          <>
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Case <span className="font-mono text-indigo-600">{latestCase.case_id}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Opened {new Date(latestCase.created_at).toLocaleDateString()} &bull; Round {latestCase.round ?? 1}
                  </p>
                </div>
                <StatusBadge status={latestCase.status} />
              </div>
              {latestCase.status === "cooling_off" && latestCase.cancellation_deadline && (
                <CancellationCountdown deadline={latestCase.cancellation_deadline} />
              )}
            </section>

            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Dispute Letters</h2>
              </div>
              {letters.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400">No dispute letters have been generated yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Bureau</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Round</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {letters.map((letter) => (
                        <tr key={letter.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3 text-sm text-slate-800 capitalize">{letter.bureau}</td>
                          <td className="px-6 py-3 text-sm text-slate-600">{letter.round}</td>
                          <td className="px-6 py-3 text-sm text-slate-600">{letter.status}</td>
                          <td className="px-6 py-3 text-sm text-slate-500">{new Date(letter.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Activity Timeline</h2>
              </div>
              {notifications.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400">No notifications yet.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <li key={n.id} className="px-6 py-4 flex items-start gap-4">
                      <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-indigo-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{n.event_type}</p>
                        <p className="text-xs text-slate-400 mt-0.5">via {n.channel} &bull; {new Date(n.sent_at).toLocaleString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
