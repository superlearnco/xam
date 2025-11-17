"use client";

import { UserButton } from "@clerk/react-router";
import { Coins } from "lucide-react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "~/lib/utils";

interface DashboardNavProps {
  tabs?: {
    value: string;
    label: string;
    active: boolean;
    onClick: () => void;
  }[];
}

export function DashboardNav({ tabs }: DashboardNavProps) {
  const userCredits = useQuery(api.credits.getUserCredits);
  const credits = userCredits?.credits || 0;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center justify-between px-4">
        {/* Logo on the left */}
        <Link to="/dashboard" className="flex items-center">
          <img 
            src="/xam full.png" 
            alt="XAM Logo" 
            className="h-8 w-auto"
          />
        </Link>

        {/* Center: Tabs if provided */}
        {tabs && tabs.length > 0 && (
          <div className="flex items-center gap-1 bg-muted rounded-lg p-[3px] h-9">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={tab.onClick}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:pointer-events-none disabled:opacity-50",
                  tab.active
                    ? "bg-background text-foreground shadow"
                    : "text-muted-foreground hover:bg-background/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Right side: Credits card and UserButton */}
        <div className="flex items-center gap-3">
          {/* Credits card */}
          <Link to="/dashboard/credits" className="no-underline">
            <div 
              className={cn(
                "bg-card text-card-foreground rounded-lg border shadow-sm",
                "cursor-pointer transition-colors hover:bg-accent",
                "px-3 py-1.5 flex items-center gap-2 h-9"
              )}
            >
              <Coins className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold whitespace-nowrap">{credits}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">credits</span>
            </div>
          </Link>

          {/* Clerk UserButton */}
          <UserButton />
        </div>
      </div>
    </nav>
  );
}

