import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { approveLetters, signOut } from "@/app/actions";
import {
  Users,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  LogOut,
  Home,
  Eye,
  Check,
  LayoutDashboard,
} from "lucide-react";

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
  const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    cooling_off: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400", label: "Cooling Off" },
    in_progress: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "In Progress" },
    letters_pending_review: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Pending Review" },
    mailed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Mailed" },
  };

  const style = map[status] ?? { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", label: status };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
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

  // Stats
  const totalCases = cases.length;
  const activeCases = cases.filter(c => c.status === "in_progress").length;
  const pendingReview = cases.filter(c => c.status === "letters_pending_review").length;
  const completed = cases.filter(c => c.status === "mailed").length;

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-primary text-white border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-xl font-bold text-accent">W</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">Williams Equity Capital</span>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <LayoutDashboard className="h-3 w-3" />
                Admin Dashboard
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70 hidden sm:block">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage cases and approve dispute letters.</p>
          </div>
          <Link
            href="/"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Site
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{totalCases}</div>
            <div className="text-sm text-muted-foreground">Total Cases</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{activeCases}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{pendingReview}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{completed}</div>
            <div className="text-sm text-muted-foreground">Mailed</div>
          </div>
        </div>

        {/* Pending approvals */}
        {pendingLetters.length > 0 && (
          <div className="bg-card rounded-xl border border-amber-200 overflow-hidden">
            <div className="bg-amber-50 px-6 py-4 border-b border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Letters Awaiting Approval</h2>
                  <p className="text-sm text-muted-foreground">{pendingLetters.length} letter{pendingLetters.length !== 1 ? "s" : ""} need your review</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-border">
              {Object.entries(lettersByCase).map(([caseId, caseLetters]) => {
                const caseInfo = cases.find(c => c.case_id === caseId);
                return (
                  <div key={caseId} className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="font-semibold text-foreground">
                          {caseInfo?.first_name} {caseInfo?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">{caseId}</p>
                      </div>
                      <form action={async () => {
                        "use server";
                        const ids = caseLetters.map(l => l.id);
                        await approveLetters(ids);
                      }}>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          Approve All ({caseLetters.length})
                        </button>
                      </form>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {caseLetters.map(letter => (
                        <span
                          key={letter.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {letter.bureau} (Round {letter.round})
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All cases table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">All Cases</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Case ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Round</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No cases found.
                    </td>
                  </tr>
                ) : (
                  cases.map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {caseItem.first_name} {caseItem.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{caseItem.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-primary">{caseItem.case_id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={caseItem.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {caseItem.round}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(caseItem.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
