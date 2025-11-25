"use client";

import { UserButton } from "@clerk/react-router";
import { Coins, Menu, LayoutDashboard, Bug, Settings } from "lucide-react";
import { Link, NavLink } from "react-router";
import { useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { Logo } from "~/components/logo";
import { BugReportDialog } from "./bug-report-dialog";

type TabItem = {
  label: string;
  value: string;
  onClick: () => void;
  active: boolean;
  dataOnboarding?: string;
};

type DashboardNavProps = {
  tabs?: TabItem[];
};

export function DashboardNav({ tabs }: DashboardNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bugDialogOpen, setBugDialogOpen] = useState(false);
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
          <div className="hidden rounded-full border bg-background/70 p-1 md:flex" data-onboarding="editor-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={tab.onClick}
                data-onboarding={tab.dataOnboarding}
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
          <NavLink
            to="/dashboard/settings"
            data-onboarding="nav-settings"
            className={({ isActive }) =>
              cn(
                "hidden md:flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )
            }
            prefetch="viewport"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </NavLink>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setBugDialogOpen(true)}
            aria-label="Report a bug or suggest a feature"
          >
            <Bug className="h-4 w-4" />
          </Button>
          <Link
            to="/dashboard/credits"
            data-onboarding="nav-credits"
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
            <NavLink
              to="/dashboard/settings"
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
              <Settings className="h-4 w-4" />
              Settings
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
            <Button
              variant="ghost"
              className="w-full justify-start rounded-xl px-3 py-2 text-sm font-medium"
              onClick={() => {
                setMobileOpen(false);
                setBugDialogOpen(true);
              }}
            >
              <Bug className="mr-2 h-4 w-4" />
              Report Bug / Feature
            </Button>
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
      <BugReportDialog open={bugDialogOpen} onOpenChange={setBugDialogOpen} />
    </header>
  );
}
