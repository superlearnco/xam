"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { Loader2, Check } from "lucide-react";
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
import { useAuth } from "@clerk/react-router";

interface CreditsPlansProps {
  products: any;
}

export function CreditsPlans({ products }: CreditsPlansProps) {
  const { isSignedIn } = useAuth();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createCheckout = useAction(api.subscriptions.createCheckoutSession);

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
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Purchase Credits</h2>
      </div>
      
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {!products ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : products.items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No credit packages available.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.items.map((product: any) =>
            product.prices.map((price: any) => (
              <Card key={price.id} className="flex flex-col relative overflow-hidden border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <div className="h-24 w-24 rounded-full bg-primary blur-3xl" />
                </div>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold">${(price.amount / 100).toFixed(2)}</span>
                    <span className="text-muted-foreground">/ one-time</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{price.credits.toLocaleString()} Credits</span>
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
                      "Purchase Now"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
