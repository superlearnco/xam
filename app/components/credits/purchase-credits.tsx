"use client";
import { useAuth } from "@clerk/react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { Loader2, Coins, ExternalLink } from "lucide-react";
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
import { api } from "../../../convex/_generated/api";

export function PurchaseCredits() {
  const { isSignedIn } = useAuth();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [creditProducts, setCreditProducts] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const userCredits = useQuery(api.credits.getUserCredits);
  const subscription = useQuery(api.subscriptions.fetchUserSubscription);
  const getCreditProducts = useAction(api.subscriptions.getCreditProducts);
  const createCheckout = useAction(api.subscriptions.createCheckoutSession);
  const createPortalUrl = useAction(api.subscriptions.createCustomerPortalUrl);
  const upsertUser = useMutation(api.users.upsertUser);

  // Sync user when signed in
  React.useEffect(() => {
    if (isSignedIn) {
      upsertUser().catch(console.error);
    }
  }, [isSignedIn, upsertUser]);

  // Load credit products on component mount
  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        const creditsResult = await getCreditProducts();
        setCreditProducts(creditsResult);
      } catch (error) {
        console.error("Failed to load products:", error);
        setError("Failed to load products. Please try again.");
      }
    };
    if (isSignedIn) {
      loadProducts();
    }
  }, [getCreditProducts, isSignedIn]);

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

  const handleOpenBillingPortal = async () => {
    if (!subscription?.customerId) {
      setError("No billing information available. Please make a purchase first.");
      return;
    }

    setLoadingPortal(true);
    setError(null);

    try {
      const result = await createPortalUrl({
        customerId: subscription.customerId,
      });
      window.open(result.url, "_blank");
    } catch (error) {
      console.error("Failed to open customer portal:", error);
      setError("Failed to open billing portal. Please try again.");
    } finally {
      setLoadingPortal(false);
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
                Current balance: <span className="font-semibold text-lg">{credits}</span> credits
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{credits}</div>
              <div className="text-sm text-muted-foreground">Credits</div>
            </div>
          </div>
        </CardHeader>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleOpenBillingPortal}
            disabled={loadingPortal || !subscription?.customerId}
          >
            {loadingPortal ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                View Transactions
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Credits</CardTitle>
          <CardDescription>
            Purchase credits to use premium features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

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
        </CardContent>
      </Card>
    </div>
  );
}

