"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { useAuth } from "@clerk/react-router";
import { Check, Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

type CreditProduct = {
  id: string;
  name: string;
  description: string;
  prices: Array<{
    id: string;
    amount: number;
    currency: string;
    credits: number;
  }>;
};

type PricingSectionProps = {
  products: { items: CreditProduct[] } | null;
  loading: boolean;
};

export default function PricingSection({ products, loading }: PricingSectionProps) {
  const { isSignedIn } = useAuth();
  const createCheckout = useAction(api.subscriptions.createCheckoutSession);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const creditProducts = products?.items || [];

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <header className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Pricing
          </p>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Flexible credit packages for AI-powered test generation
            </h2>
            <p className="text-lg text-muted-foreground">
              Purchase credits to power your AI test generation. Credits never expire and can be used anytime.
            </p>
          </div>
        </header>

        {error && (
          <div className="mx-auto max-w-2xl rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-xl border bg-card px-4 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading credit packages…
          </div>
        )}

        {!loading && creditProducts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No credit packages available at this time.
          </div>
        )}

        {!loading && creditProducts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {creditProducts.map((product) =>
              product.prices.map((price, priceIndex) => {
                const isPopular = priceIndex === Math.floor(product.prices.length / 2);
                const credits = price.credits || Math.floor((price.amount / 100) * 10);
                
                return (
                  <Card
                    key={price.id}
                    className={`flex flex-col relative overflow-hidden ${
                      isPopular ? "border-primary shadow-lg" : "border-primary/10"
                    } hover:shadow-md transition-shadow`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <div className="h-24 w-24 rounded-full bg-primary blur-3xl" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{product.name}</CardTitle>
                        {isPopular && (
                          <Badge variant="outline" className="text-primary">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{product.description}</CardDescription>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-4xl font-semibold">
                          ${(price.amount / 100).toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          one-time
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="font-semibold">
                          {credits.toLocaleString()} Credits
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        <p className="text-xs">
                          ${((price.amount / 100) / credits).toFixed(3)} per credit
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="mt-auto">
                      <Button
                        className="w-full"
                        onClick={() => handlePurchase(price.id)}
                        disabled={loadingPriceId === price.id || !isSignedIn}
                      >
                        {loadingPriceId === price.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : !isSignedIn ? (
                          "Sign in to purchase"
                        ) : (
                          "Purchase Now"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </section>
  );
}
