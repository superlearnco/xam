"use client";
import { useAuth } from "@clerk/react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { Loader2, Coins, Zap } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "../../../convex/_generated/api";

export function PurchaseCredits() {
  const { isSignedIn } = useAuth();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [creditProducts, setCreditProducts] = useState<any>(null);
  const [payAsYouGoPlans, setPayAsYouGoPlans] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const userCredits = useQuery(api.credits.getUserCredits);
  const userSubscription = useQuery(api.subscriptions.fetchUserSubscription);
  const payAsYouGoCheck = useQuery(api.credits.hasPayAsYouGoSubscription);
  const getCreditProducts = useAction(api.subscriptions.getCreditProducts);
  const getPayAsYouGoPlans = useAction(api.subscriptions.getPayAsYouGoPlans);
  const createCheckout = useAction(api.subscriptions.createCheckoutSession);
  const upsertUser = useMutation(api.users.upsertUser);

  // Sync user when signed in
  React.useEffect(() => {
    if (isSignedIn) {
      upsertUser().catch(console.error);
    }
  }, [isSignedIn, upsertUser]);

  // Load credit products and pay-as-you-go plans on component mount
  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        const [creditsResult, payAsYouGoResult] = await Promise.all([
          getCreditProducts(),
          getPayAsYouGoPlans(),
        ]);
        setCreditProducts(creditsResult);
        setPayAsYouGoPlans(payAsYouGoResult);
      } catch (error) {
        console.error("Failed to load products:", error);
        setError("Failed to load products. Please try again.");
      }
    };
    if (isSignedIn) {
      loadProducts();
    }
  }, [getCreditProducts, getPayAsYouGoPlans, isSignedIn]);

  const handlePurchase = async (priceId: string) => {
    if (!isSignedIn) {
      setError("Please sign in to purchase credits");
      return;
    }

    setLoadingPriceId(priceId);
    setError(null);

    try {
      const checkoutUrl = await createCheckout({ priceId });
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Failed to create checkout:", error);
      setError("Failed to create checkout session. Please try again.");
      setLoadingPriceId(null);
    }
  };

  if (!isSignedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purchase Credits</CardTitle>
          <CardDescription>
            Sign in to purchase credits for usage-based features.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const credits = userCredits?.credits || 0;
  const hasPayAsYouGo = payAsYouGoCheck?.hasPayAsYouGo || false;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Your Credits
              </CardTitle>
              <CardDescription>
                {hasPayAsYouGo ? (
                  <span>You have a pay-as-you-go subscription. Credits are optional.</span>
                ) : (
                  <>Current balance: <span className="font-semibold text-lg">{credits}</span> credits</>
                )}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{credits}</div>
              <div className="text-sm text-muted-foreground">Credits</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {hasPayAsYouGo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Pay-as-You-Go Active
            </CardTitle>
            <CardDescription>
              You're currently on a pay-as-you-go plan. Usage will be billed automatically.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Purchase Options</CardTitle>
          <CardDescription>
            Choose between purchasing credits or subscribing to a pay-as-you-go plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

          <Tabs defaultValue="credits" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credits">
                <Coins className="mr-2 h-4 w-4" />
                Purchase Credits
              </TabsTrigger>
              <TabsTrigger value="pay-as-you-go">
                <Zap className="mr-2 h-4 w-4" />
                Pay-as-You-Go
              </TabsTrigger>
            </TabsList>

            <TabsContent value="credits" className="mt-6">
              {!creditProducts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : creditProducts.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No credit packages available. Please contact support.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {creditProducts.items.map((product: any) =>
                    product.prices.map((price: any) => (
                      <Card key={price.id} className="relative">
                        <CardHeader>
                          <CardTitle>{product.name}</CardTitle>
                          <CardDescription>{product.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-3xl font-bold">
                              ${(price.amount / 100).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {price.credits} Credits
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full"
                            onClick={() => handlePurchase(price.id)}
                            disabled={loadingPriceId === price.id}
                          >
                            {loadingPriceId === price.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Purchase"
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pay-as-you-go" className="mt-6">
              {!payAsYouGoPlans ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : payAsYouGoPlans.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pay-as-you-go plans available. Please contact support.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {payAsYouGoPlans.items
                    .filter((plan: any) => plan.isMetered)
                    .map((plan: any) =>
                      plan.prices.map((price: any) => (
                        <Card key={price.id} className="relative">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              {plan.name}
                              {userSubscription?.polarPriceId === price.id && (
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                  Active
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="text-3xl font-bold">
                                ${(price.amount / 100).toFixed(2)}
                                <span className="text-sm font-normal text-muted-foreground">
                                  /{price.interval || "month"}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Pay only for what you use
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button
                              className="w-full"
                              onClick={() => handlePurchase(price.id)}
                              disabled={loadingPriceId === price.id || userSubscription?.polarPriceId === price.id}
                              variant={userSubscription?.polarPriceId === price.id ? "secondary" : "default"}
                            >
                              {loadingPriceId === price.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : userSubscription?.polarPriceId === price.id ? (
                                "Current Plan"
                              ) : (
                                "Subscribe"
                              )}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

