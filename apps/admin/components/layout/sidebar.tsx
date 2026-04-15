"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Users,
  HandHelping,
  Bell,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import type { UserTag } from "@/server/auth/access";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  /** Minimum tags required — empty means any tagged user can see it */
  requiredTags?: UserTag[];
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Batches", href: "/batches", icon: Layers },
  { label: "Users", href: "/users", icon: Users, requiredTags: ["admin", "mod"] },
  {
    label: "Volunteers",
    href: "/volunteers",
    icon: HandHelping,
    requiredTags: ["admin", "mod"],
  },
  { label: "Alerts", href: "/alerts", icon: Bell, requiredTags: ["admin", "mod"] },
];

type SidebarProps = {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    tags: UserTag[];
  };
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => {
    if (!item.requiredTags || item.requiredTags.length === 0) return true;
    return item.requiredTags.some((t) => user.tags.includes(t));
  });

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Logo className="text-base" />
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            admin
          </span>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {visibleItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2.5 px-1">
          {user.image ? (
            <img
              src={user.image}
              alt=""
              className="size-7 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-7 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold">
              {(user.name ?? user.email)[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">
              {user.name ?? user.email}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {user.tags.join(", ")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ redirectTo: "/login" })}
            className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
