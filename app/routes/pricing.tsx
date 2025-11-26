"use client";

import type { Route } from "./+types/pricing";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAction } from "convex/react";
import { useAuth } from "@clerk/react-router";
import { api } from "../../convex/_generated/api";

import { Navbar } from "~/components/homepage/navbar";
import PricingSection from "~/components/homepage/pricing";
import FooterSection from "~/components/homepage/footer";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Pricing | XAM" },
    {
      name: "description",
      content:
        "Purchase credits to power your AI-powered test generation. Flexible credit packages to suit your needs.",
    },
  ];
}

export default function PricingRoute() {
  const { isSignedIn } = useAuth();
  const getCreditProducts = useAction(api.subscriptions.getCreditProducts);
  const [products, setProducts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCreditProducts()
      .then((result) => {
        setProducts(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch credit products:", error);
        setLoading(false);
      });
  }, [getCreditProducts]);

  return (
    <>
      <Hero isSignedIn={isSignedIn} />
      <PricingSection products={products} loading={loading} />
      <FooterSection />
    </>
  );
}

function Hero({ isSignedIn }: { isSignedIn: boolean }) {
  const primaryCta = isSignedIn ? "/dashboard/credits" : "/sign-up";
  const secondaryCta = isSignedIn ? "/dashboard" : "/sign-up";

  return (
    <>
      <Navbar loaderData={{ isSignedIn }} />
      <section className="border-b bg-card/40">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
          <Badge
            className="mx-auto w-fit bg-primary/10 text-primary"
            variant="outline"
          >
            Pricing
          </Badge>
          <div className="space-y-4">
            <h1 className="text-pretty text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Purchase credits to power your AI test generation
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Buy credits to generate AI-powered tests. Credits never expire and can be used anytime for test generation and analysis.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to={primaryCta} prefetch="viewport">
                {isSignedIn ? "View Credits" : "Get Started"}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to={secondaryCta} prefetch="viewport">
                {isSignedIn ? "Go to Dashboard" : "Sign Up Free"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
