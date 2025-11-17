"use client";

import { UserButton } from "@clerk/react-router";
import { Coins, Menu, LayoutDashboard } from "lucide-react";
import { Link, NavLink } from "react-router";
import { useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { Logo } from "~/components/logo";

type TabItem = {
  label: string;
  value: string;
  onClick: () => void;
  active: boolean;
};

type DashboardNavProps = {
  tabs?: TabItem[];
};

export function DashboardNav({ tabs }: DashboardNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const userCredits = useQuery(api.credits.getUserCredits);
  const credits = userCredits?.credits ?? 0;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-semibold tracking-tight"
            prefetch="viewport"
          >
            <Logo className="h-5 w-auto" />
          </Link>
        </div>

        {tabs?.length ? (
          <div className="hidden rounded-full border bg-background/70 p-1 md:flex">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={tab.onClick}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  tab.active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/credits"
            className="hidden md:flex items-center gap-3 rounded-2xl border bg-card px-3 py-1.5 shadow-sm transition-colors hover:bg-accent"
            prefetch="viewport"
          >
            <Coins className="h-4 w-4 text-primary" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-muted-foreground">Credits</span>
              <span className="text-sm font-semibold">{credits}</span>
            </div>
          </Link>
          <Badge className="md:hidden px-2 py-1" variant="outline">
            {credits} credits
          </Badge>
          <UserButton />
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t bg-background md:hidden">
          <div className="space-y-2 px-4 py-3">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
              onClick={() => setMobileOpen(false)}
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </NavLink>
            {tabs?.length ? (
              <div className="rounded-2xl border p-2">
                <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Workspace
                </p>
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      tab.onClick();
                      setMobileOpen(false);
                    }}
                    className={cn(
                      "w-full rounded-xl px-3 py-2 text-left text-sm font-medium",
                      tab.active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            ) : null}
            <Link
              to="/dashboard/credits"
              className="flex items-center justify-between rounded-xl border bg-card px-3 py-2 text-sm font-medium"
              onClick={() => setMobileOpen(false)}
              prefetch="viewport"
            >
              <span>Credits</span>
              <span>{credits}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
