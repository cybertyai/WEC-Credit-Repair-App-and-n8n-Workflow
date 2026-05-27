import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fmtRelative } from "@/lib/utils";
import { Bell, Mail, MessageSquare, CheckCircle2 } from "lucide-react";

const EVENT_LABELS: Record<string, { label: string; cls: string }> = {
  case_created:            { label: "Case Created",            cls: "badge-green"  },
  letters_ready:           { label: "Letters Ready",           cls: "badge-amber"  },
  letters_approved:        { label: "Letters Approved",        cls: "badge-green"  },
  letters_mailed:          { label: "Letters Mailed",          cls: "badge-purple" },
  bureau_response_received:{ label: "Bureau Response",         cls: "badge-blue"   },
  escalated_round_2:       { label: "Escalated Round 2",       cls: "badge-amber"  },
  escalated_round_3:       { label: "Escalated Round 3",       cls: "badge-red"    },
  case_resolved:           { label: "Case Resolved",           cls: "badge-green"  },
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: casesData } = await supabase
    .from("cases").select("case_id").eq("email", user.email)
    .order("created_at", { ascending: false }).limit(1);
  const caseId = casesData?.[0]?.case_id;

  const { data: notifications } = caseId
    ? await supabase.from("notifications").select("*").eq("case_id", caseId).order("sent_at", { ascending: false })
    : { data: [] };

  return (
    <div className="p-8 space-y-6">
      <div>
        <p className="section-label mb-1">Notifications</p>
        <h1 className="text-2xl font-bold text-white">Activity Feed</h1>
        <p className="text-slate-400 text-sm mt-1">All case updates, letter dispatches, and bureau responses</p>
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="card p-10 text-center">
          <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-white/[0.04]">
            {notifications.map((n) => {
              const meta = EVENT_LABELS[n.event_type] ?? { label: n.event_type.replace(/_/g, " "), cls: "badge-gold" };
              return (
                <li key={n.notification_id} className="px-6 py-5 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                    {n.channel === "email"
                      ? <Mail className="w-4 h-4 text-brand-gold" />
                      : n.channel === "sms"
                      ? <MessageSquare className="w-4 h-4 text-brand-gold" />
                      : <CheckCircle2 className="w-4 h-4 text-brand-gold" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={meta.cls}>{meta.label}</span>
                      <span className="text-xs text-slate-500">via {n.channel}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{fmtRelative(n.sent_at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
