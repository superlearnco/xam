"use client";

import { UserButton } from "@clerk/react-router";
import { Coins } from "lucide-react";
import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "~/lib/utils";

export function DashboardNav() {
  const userCredits = useQuery(api.credits.getUserCredits);
  const credits = userCredits?.credits || 0;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo on the left */}
        <Link to="/dashboard" className="flex items-center">
          <img 
            src="/xam full.png" 
            alt="XAM Logo" 
            className="h-8 w-auto"
          />
        </Link>

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

