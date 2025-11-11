"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const creditBalance = useQuery(api.billing.getMyCredits);

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <Card className="border-green-200 shadow-xl">
          <CardHeader className="text-center space-y-4 pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-3xl mb-2">Payment Successful!</CardTitle>
              <CardDescription className="text-base">
                Your credits have been added to your account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {orderId && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">Order ID</div>
                <div className="font-mono text-sm">{orderId}</div>
              </div>
            )}

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <div className="text-sm text-muted-foreground">Your New Balance</div>
              </div>
              <div className="text-5xl font-bold text-blue-600">
                {creditBalance?.credits || 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">credits</div>
            </div>

            <div className="space-y-3 text-sm text-center text-muted-foreground">
              <p>
                Thank you for your purchase! Your credits are now available and ready to use.
              </p>
              <p>
                You can start using AI features to generate questions, grade submissions, and more.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/app" className="flex-1">
                <Button className="w-full" size="lg">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/app/billing" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  View Billing History
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                A confirmation email has been sent to your email address.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
