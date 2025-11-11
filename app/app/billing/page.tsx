"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CREDIT_PACKAGES, formatCredits, getOperationDisplayName, ESTIMATED_CREDITS } from "@/lib/polar/config/pricing";
import { CheckCircle2, AlertCircle, ArrowUpRight, Sparkles, TrendingUp, CreditCard, History, Zap } from "lucide-react";
import { useState } from "react";

export default function BillingPage() {
  const { user, isLoaded } = useUser();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const creditBalance = useQuery(api.billing.getMyCredits);
  const creditStats = useQuery(api.billing.getCreditUsageStats,
    user ? { userId: user.id as any } : "skip"
  );
  const billingHistory = useQuery(api.billing.getBillingHistory,
    user ? { userId: user.id as any } : "skip"
  );

  const handlePurchaseCredits = async (packageId: string) => {
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (!pkg || !pkg.productPriceId) {
      alert("This package is not available yet");
      return;
    }

    setIsCreatingCheckout(true);
    setSelectedPackage(packageId);

    try {
      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productPriceId: pkg.productPriceId,
          successUrl: `${window.location.origin}/app/billing/success`,
          cancelUrl: `${window.location.origin}/app/billing/cancel`,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Failed to create checkout session");
    } finally {
      setIsCreatingCheckout(false);
      setSelectedPackage(null);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentCredits = creditBalance?.credits || 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Credits</h1>
          <p className="text-muted-foreground mt-2">
            Manage your AI credits and view your usage history
          </p>
        </div>

        {/* Credit Balance Card */}
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Your Credit Balance
                </CardTitle>
                <CardDescription>Available AI credits for question generation and grading</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600">{formatCredits(currentCredits)}</div>
                <div className="text-sm text-muted-foreground">credits</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Total Purchased
                </div>
                <div className="text-2xl font-semibold mt-1">
                  {formatCredits(creditStats?.totalPurchased || 0)}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  Total Used
                </div>
                <div className="text-2xl font-semibold mt-1">
                  {formatCredits(creditStats?.totalUsed || 0)}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  Value
                </div>
                <div className="text-2xl font-semibold mt-1">
                  ${(currentCredits * 0.1).toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Balance Warning */}
        {currentCredits < 10 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your credit balance is low. Purchase more credits below to continue using AI features.
            </AlertDescription>
          </Alert>
        )}

        {/* Credit Packages */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Purchase Credits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CREDIT_PACKAGES.map((pkg) => {
              const totalCredits = pkg.credits + (pkg.bonusCredits || 0);
              const savings = pkg.bonusCredits ? ((pkg.bonusCredits / pkg.credits) * 100).toFixed(0) : null;

              return (
                <Card
                  key={pkg.id}
                  className={`relative ${pkg.popular ? 'border-blue-500 border-2 shadow-lg' : ''}`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {pkg.name}
                      {savings && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          +{savings}% Bonus
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {pkg.credits} credits {pkg.bonusCredits && `+ ${pkg.bonusCredits} bonus`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold">${pkg.price}</div>
                      <div className="text-sm text-muted-foreground">
                        ${pkg.pricePerCredit.toFixed(3)} per credit
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Base credits:</span>
                        <span className="font-medium">{pkg.credits}</span>
                      </div>
                      {pkg.bonusCredits && (
                        <div className="flex items-center justify-between text-green-600">
                          <span>Bonus credits:</span>
                          <span className="font-medium">+{pkg.bonusCredits}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex items-center justify-between font-semibold">
                        <span>Total credits:</span>
                        <span>{totalCredits}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handlePurchaseCredits(pkg.id)}
                      disabled={isCreatingCheckout || !pkg.productPriceId}
                    >
                      {isCreatingCheckout && selectedPackage === pkg.id ? (
                        "Processing..."
                      ) : !pkg.productPriceId ? (
                        "Coming Soon"
                      ) : (
                        <>
                          Purchase
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle>How Credits Work</CardTitle>
            <CardDescription>Transparent token-based pricing for AI features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Estimated Credit Costs</h3>
                <div className="space-y-1 text-sm">
                  {Object.entries(ESTIMATED_CREDITS).map(([operation, credits]) => (
                    <div key={operation} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{getOperationDisplayName(operation)}</span>
                      <span className="font-medium">{formatCredits(credits)} credits</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Token Pricing</h3>
                <div className="text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Input tokens:</span>
                    <span className="font-medium">15 credits per 1M tokens</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Output tokens:</span>
                    <span className="font-medium">60 credits per 1M tokens</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="text-muted-foreground text-xs">
                    Final credit usage depends on actual token consumption by the AI model.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>Recent credit purchases and usage</CardDescription>
          </CardHeader>
          <CardContent>
            {!billingHistory || billingHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transaction history yet
              </div>
            ) : (
              <div className="space-y-2">
                {billingHistory.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'credit_purchase'
                          ? 'bg-green-100 dark:bg-green-900'
                          : 'bg-blue-100 dark:bg-blue-900'
                      }`}>
                        {transaction.type === 'credit_purchase' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Zap className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()} at{' '}
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        (transaction.creditsAdded || 0) > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {(transaction.creditsAdded || 0) > 0 ? '+' : ''}
                        {formatCredits(transaction.creditsAdded || 0)}
                      </div>
                      {transaction.amount > 0 && (
                        <div className="text-xs text-muted-foreground">
                          ${transaction.amount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Breakdown by Type */}
        {creditStats && Object.keys(creditStats.usageByType || {}).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Usage Breakdown</CardTitle>
              <CardDescription>Credits used by operation type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(creditStats.usageByType).map(([type, credits]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{getOperationDisplayName(type)}</span>
                      <span className="text-muted-foreground">{formatCredits(credits as number)} credits</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(((credits as number) / (creditStats.totalUsed || 1)) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
