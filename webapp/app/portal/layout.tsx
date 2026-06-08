"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, TrendingUp, Scale,
  Bell, Settings, LogOut, ChevronRight, Shield,
  Upload, ListChecks, BookOpen,
} from "lucide-react";

const NAV = [
  { href: "/portal",               label: "Overview",       icon: LayoutDashboard },
  { href: "/portal/letters",       label: "Dispute Letters",icon: FileText },
  { href: "/portal/disputes",      label: "Dispute Tracker",icon: ListChecks },
  { href: "/portal/upload",        label: "Upload Report",  icon: Upload },
  { href: "/portal/score",         label: "Score Tracker",  icon: TrendingUp },
  { href: "/portal/legal",         label: "Legal Letters",  icon: Scale },
  { href: "/portal/learn",         label: "Learn",          icon: BookOpen },
  { href: "/portal/notifications", label: "Notifications",  icon: Bell },
  { href: "/portal/settings",      label: "Settings",       icon: Settings },
];

function NavItem({ href, label, icon: Icon, exact = false }: {
  href: string; label: string; icon: React.ElementType; exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : (pathname === href || (href !== "/portal" && pathname.startsWith(href)));
  return (
    <Link href={href} className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
      active
        ? "bg-brand-gold/10 text-brand-gold-2 border border-brand-gold/20"
        : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
    )}>
      <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-brand-gold" : "text-slate-500")} />
      {label}
      {active && <ChevronRight className="ml-auto w-3.5 h-3.5 text-brand-gold/50" />}
    </Link>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-brand-navy">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0 bg-surface-1 border-r border-white/[0.06] flex-col fixed h-full z-10">
        {/* Brand */}
        <div className="p-5 border-b border-white/[0.06]">
          <Link href="/portal" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center text-brand-navy font-black text-sm">
              WEC
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">Williams Equity</div>
              <div className="text-slate-500 text-[10px]">Credit Repair Portal</div>
            </div>
          </Link>
        </div>

        {/* Security badge */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <Shield className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
            <span className="text-[11px] text-slate-400">FCRA Protected Portal</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => <NavItem key={item.href} {...item} />)}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-status-cancelled hover:bg-status-cancelled/10 transition-all">
              <LogOut className="w-4 h-4 flex-shrink-0" /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile nav bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-surface-1 border-t border-white/[0.06] flex items-center justify-around px-2 py-2">
        {NAV.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-2 py-1 text-slate-400 hover:text-brand-gold transition-colors">
            <Icon className="w-5 h-5" />
            <span className="text-[9px]">{label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>

      {/* Main */}
      <main className="flex-1 md:ml-60 min-h-screen animate-fade-in pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
