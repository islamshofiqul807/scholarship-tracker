"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
  ChevronLeft,
  Sparkles,
  Bell,
} from "lucide-react";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/services/auth.actions";
import { getInitials } from "@/utils";
import { APP_NAME } from "@/lib/constants";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Scholarships",
    href: "/scholarships",
    icon: GraduationCap,
  },
  {
    label: "Applications",
    href: "/applications",
    icon: FileText,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FolderOpen,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  user: {
    name: string;
    email: string;
    plan: "free" | "premium";
    avatar_url?: string | null;
  };
  pendingReminders?: number;
}

export function Sidebar({ user, pendingReminders = 0 }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg tracking-tight">{APP_NAME}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
              {item.label === "Dashboard" && pendingReminders > 0 && (
                <Badge className="ml-auto h-5 w-5 justify-center p-0 text-[10px]">
                  {pendingReminders}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Banner (free plan) */}
      {user.plan === "free" && (
        <div className="mx-3 mb-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">Go Premium</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Unlimited applications & more
          </p>
          <Link href="/settings?tab=billing">
            <Button size="sm" className="w-full h-7 text-xs">
              Upgrade Now
            </Button>
          </Link>
        </div>
      )}

      {/* User Profile */}
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-md p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <form action={logoutAction}>
            <Button
              variant="ghost"
              size="icon"
              type="submit"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}

export function MobileSidebar({ user, pendingReminders = 0 }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-card md:hidden">
      {navItems.slice(0, 4).map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
