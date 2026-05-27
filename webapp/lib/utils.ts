import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function fmtRelative(d: string | Date) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(d);
}

export function scoreColor(score: number) {
  if (score >= 740) return "#22C55E";
  if (score >= 670) return "#3B82F6";
  if (score >= 580) return "#F59E0B";
  return "#EF4444";
}

export function scoreLabel(score: number) {
  if (score >= 800) return "Exceptional";
  if (score >= 740) return "Very Good";
  if (score >= 670) return "Good";
  if (score >= 580) return "Fair";
  return "Poor";
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  cooling_off:             { label: "Cooling Off",       cls: "badge-amber"  },
  in_progress:             { label: "In Progress",       cls: "badge-blue"   },
  letters_pending_review:  { label: "Pending Review",    cls: "badge-amber"  },
  mailed:                  { label: "Mailed",            cls: "badge-purple" },
  escalating:              { label: "Escalating",        cls: "badge-red"    },
  resolved:                { label: "Resolved",          cls: "badge-green"  },
  cancelled:               { label: "Cancelled",         cls: "badge-red"    },
};

export function statusInfo(status: string) {
  return STATUS_MAP[status] ?? { label: status, cls: "badge-gold" };
}
