import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { 
  FileText, 
  Bell, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  LogOut,
  Home,
  Shield
} from "lucide-react";

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
  const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    cooling_off: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400", label: "Cooling Off Period" },
    in_progress: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "In Progress" },
    letters_pending_review: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Letters Pending Review" },
    mailed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Mailed" },
  };

  const style = map[status] ?? { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", label: status };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
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
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted border border-border">
        <CheckCircle2 className="h-5 w-5 text-success" />
        <p className="text-sm text-muted-foreground">Cancellation period has ended.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
        <Clock className="h-6 w-6 text-amber-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-amber-800">
          Cancellation deadline: {deadlineDate.toLocaleDateString()}
        </p>
        <p className="text-amber-600 text-sm">
          <span className="font-semibold">{diffDays} day{diffDays !== 1 ? "s" : ""}</span> remaining to cancel for a full refund
        </p>
      </div>
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
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-xl font-bold text-accent">W</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-primary tracking-tight">Williams Equity Capital</span>
              <p className="text-xs text-muted-foreground -mt-0.5">Client Portal</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
            <p className="text-muted-foreground">Track your credit repair progress below.</p>
          </div>
          <Link
            href="/"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {!latestCase ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No Active Cases</h2>
            <p className="text-muted-foreground mb-6">
              You don&apos;t have any credit repair cases yet. Start your journey to better credit today.
            </p>
            <Link
              href="/#apply"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Start Your Application
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Case overview card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Case ID</p>
                    <p className="text-lg font-mono font-semibold text-primary">{latestCase.case_id}</p>
                  </div>
                  <StatusBadge status={latestCase.status} />
                </div>

                {latestCase.status === "cooling_off" && latestCase.cancellation_deadline && (
                  <CancellationCountdown deadline={latestCase.cancellation_deadline} />
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{latestCase.round}</div>
                    <div className="text-sm text-muted-foreground">Current Round</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{letters.length}</div>
                    <div className="text-sm text-muted-foreground">Total Letters</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-success">
                      {letters.filter(l => l.status === "response_received").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Responses</div>
                  </div>
                </div>
              </div>

              {/* Dispute letters */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Dispute Letters</h2>
                    <p className="text-sm text-muted-foreground">{letters.length} letter{letters.length !== 1 ? "s" : ""} sent</p>
                  </div>
                </div>

                {letters.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No dispute letters yet. We&apos;ll notify you when letters are generated.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {letters.slice(0, 5).map((letter) => (
                      <div
                        key={letter.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {letter.bureau.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{letter.bureau}</p>
                            <p className="text-sm text-muted-foreground">Round {letter.round}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          letter.status === "mailed" ? "bg-emerald-100 text-emerald-700" :
                          letter.status === "pending_review" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {letter.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick stats */}
              <div className="bg-gradient-to-br from-primary to-[#152d4a] rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                  <h3 className="font-semibold">Progress Overview</h3>
                </div>
                <p className="text-white/70 text-sm mb-4">
                  Your case is being actively processed. Check back for updates.
                </p>
                <div className="flex items-center gap-2 text-accent">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">CROA Protected</span>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Recent Activity</h3>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent notifications.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-foreground">{notification.event_type.replace(/_/g, " ")}</p>
                          <p className="text-muted-foreground text-xs flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(notification.sent_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Help card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our support team is here to answer your questions.
                </p>
                <a
                  href="mailto:support@williamsequitycapital.com"
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
