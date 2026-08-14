"use client";

import {
  BookOpen,
  ClipboardCheck,
  Gauge,
  LogOut,
  Megaphone,
  Menu,
  UserRound,
  UsersRound,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/app/actions/auth";
import { BrandMark } from "@/components/shared/BrandMark";
import { cn, initials, roleLabel, skillLabels, trackLabels } from "@/lib/utils";

export const studentLinks = [
  { href: "/dashboard", label: "Overview", icon: Gauge },
  { href: "/dashboard/tasks", label: "Tasks", icon: BookOpen },
  { href: "/dashboard/submissions", label: "Submissions", icon: ClipboardCheck },
  { href: "/dashboard/attendance", label: "Attendance", icon: UsersRound },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound }
];

export const adminLinks = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/students", label: "Students", icon: UsersRound },
  { href: "/admin/tasks", label: "Tasks", icon: BookOpen },
  { href: "/admin/submissions", label: "Reviews", icon: ClipboardCheck },
  { href: "/admin/attendance", label: "Attendance", icon: UsersRound },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone }
];

type NavUser = {
  role: "student" | "admin";
  name: string;
  track?: string | null;
  skill?: string | null;
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function UserChip({ user }: { user: NavUser }) {
  // Display role comes from the canonical profile role (passed from the
  // server shell). Track/skill are only shown for students when actually
  // stored — null values are never silently converted into defaults, and
  // an admin is never labeled "Student".
  const track = user.track ? (trackLabels[user.track] ?? user.track) : null;
  const skill = user.skill ? (skillLabels[user.skill] ?? user.skill) : null;
  const subtitle =
    user.role === "admin"
      ? roleLabel(user.role)
      : [roleLabel(user.role), track, skill].filter(Boolean).join(" · ") || roleLabel(user.role);

  // Containment: `min-w-0` on every flex/grid level lets the card shrink to
  // the sidebar's real width instead of growing to its text's min-content
  // width. The subtitle wraps naturally (no nowrap/truncate) so role, track
  // and skill stay fully visible inside the card at any screen width.
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/6 p-2.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-bright to-brand text-xs font-bold text-white ring-2 ring-white/20">
        {initials(user.name)}
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
        <p className="break-words text-[11px] leading-snug text-white/55">{subtitle}</p>
      </div>
    </div>
  );
}

export function AppNav({ role, name, track, skill }: NavUser) {
  const pathname = usePathname();
  const links = role === "admin" ? adminLinks : studentLinks;

  return (
    <aside className="hidden md:block">
      <div className="glass sticky top-6 rounded-2xl p-4">
        <BrandMark className="px-1.5 pt-1" />
        <nav className="mt-6 grid gap-1">
          {links.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("nav-link", active && "nav-link-active")}
              >
                <item.icon size={17} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      <div className="mt-6 grid min-w-0 gap-3 border-t border-white/10 pt-4">
        <UserChip user={{ role, name, track, skill }} />
        <form action={signOutAction}>
            <button className="nav-link w-full text-white/60 hover:text-red-200 hover:bg-red-400/10">
              <LogOut size={17} aria-hidden />
              Logout
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav({ role, name, track, skill }: NavUser) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = role === "admin" ? adminLinks : studentLinks;
  const current = links.find((item) => isActive(pathname, item.href));

  return (
    <header className="sticky top-0 z-40 md:hidden">
      <div className="glass-strong flex items-center justify-between rounded-none border-x-0 border-t-0 px-4 py-3">
        <BrandMark size="sm" />
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-brand-light/30 bg-brand-bright/15 px-3 py-1 text-xs font-semibold text-brand-light">
            {current?.label ?? "Menu"}
          </span>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/8 text-white transition hover:bg-white/15"
          >
            {open ? <X size={19} aria-hidden /> : <Menu size={19} aria-hidden />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav-panel" className="glass-strong border-x-0 rounded-none border-t-0 px-4 pb-5 pt-2 shadow-[0_24px_60px_rgba(2,10,38,0.6)]">
          <nav className="grid gap-1">
            {links.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn("nav-link", active && "nav-link-active")}
                >
                  <item.icon size={17} aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 grid min-w-0 gap-3 border-t border-white/10 pt-4">
            <UserChip user={{ role, name, track, skill }} />
            <form action={signOutAction}>
              <button className="nav-link w-full text-white/60 hover:text-red-200 hover:bg-red-400/10">
                <LogOut size={17} aria-hidden />
                Logout
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </header>
  );
}
