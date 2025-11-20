"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CreditsOverview } from "~/components/credits/credits-overview";
import { CreditsAnalytics } from "~/components/credits/credits-analytics";
import { CreditsPlans } from "~/components/credits/credits-plans";
import { CreditsHistory } from "~/components/credits/credits-history";
import { Separator } from "~/components/ui/separator";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@clerk/react-router";

export default function CreditsPage() {
  const { isSignedIn } = useAuth();
  const userCredits = useQuery(api.credits.getUserCredits);
  const usageAnalytics = useQuery(api.credits.getUsageAnalytics, { days: 30 });
  const transactions = useQuery(api.credits.getCreditTransactions, { limit: 20 });
  const upsertUser = useMutation(api.users.upsertUser);
  const getCreditProducts = useAction(api.subscriptions.getCreditProducts);
  
  const [products, setProducts] = useState<any>(null);

  // Sync user when signed in
  useEffect(() => {
    if (isSignedIn) {
      upsertUser().catch(console.error);
      getCreditProducts().then(setProducts).catch(console.error);
    }
  }, [isSignedIn, upsertUser, getCreditProducts]);

  const currentCredits = userCredits?.credits || 0;
  
  // Calculate monthly usage from analytics
  const monthlyUsage = useMemo(() => {
    return usageAnalytics?.dailyUsage.reduce((acc, day) => acc + day.amount, 0) || 0;
  }, [usageAnalytics]);

  return (
    <div className="flex flex-1 flex-col space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Credits & Usage</h2>
            <p className="text-muted-foreground">Manage your credits and view usage analytics.</p>
        </div>
      </div>
      
      <CreditsPlans products={products} />
      
      <Separator />
      
      <CreditsOverview 
        currentCredits={currentCredits} 
        monthlyUsage={monthlyUsage} 
      />
      
      <CreditsAnalytics 
        dailyUsage={usageAnalytics?.dailyUsage || []} 
        modelUsage={usageAnalytics?.modelUsage || []} 
      />
      
      <Separator />
      
      <CreditsHistory transactions={transactions} />
    </div>
  );
}
