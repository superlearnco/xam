"use client";

import { Coins, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface CreditsOverviewProps {
  currentCredits: number;
  monthlyUsage: number;
}

export function CreditsOverview({ currentCredits, monthlyUsage }: CreditsOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentCredits.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Available credits
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{monthlyUsage.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Credits used in last 30 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

