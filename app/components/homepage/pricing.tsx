import { useMemo } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";

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

type EmbeddedPrice = {
  id: string;
  amount: number;
  currency: string;
  interval?: string;
};

type EmbeddedPlan = {
  id: string;
  name: string;
  description: string;
  isRecurring?: boolean;
  prices: EmbeddedPrice[];
  features?: string[];
};

type EmbeddedPlansPayload = {
  items: EmbeddedPlan[];
};

type PricingLoaderData = {
  plans?: EmbeddedPlansPayload;
  subscription?: {
    status?: string;
    amount?: number;
  };
};

type PricingSectionProps = {
  loaderData?: PricingLoaderData;
};

type NormalizedPlan = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  currencyLabel: string;
  badge?: string;
  features: string[];
  buttonLabel: string;
  intervalLabel?: string;
  isPopular: boolean;
  isCurrent: boolean;
};

const FALLBACK_PLANS: EmbeddedPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Launch your first assessments with guided templates.",
    isRecurring: true,
    prices: [
      {
        id: "starter-monthly",
        amount: 2900,
        currency: "usd",
        interval: "month",
      },
    ],
    features: [
      "Unlimited drafts",
      "Library of question types",
      "Automatic scoring rules",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    description: "Advanced workflows for cross-functional teams.",
    isRecurring: true,
    prices: [
      {
        id: "scale-monthly",
        amount: 7900,
        currency: "usd",
        interval: "month",
      },
    ],
    features: [
      "Collaboration spaces",
      "API + webhooks",
      "Adaptive scoring engine",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom governance, controls, and onboarding.",
    isRecurring: true,
    prices: [
      {
        id: "enterprise-yearly",
        amount: 24900,
        currency: "usd",
        interval: "month",
      },
    ],
    features: [
      "Dedicated CSM",
      "Security reviews & SLAs",
      "Custom data retention",
      "SSO & provisioning",
    ],
  },
];

export default function PricingSection({ loaderData }: PricingSectionProps) {
  const normalizedPlans = useMemo<NormalizedPlan[]>(() => {
    const sourcePlans = loaderData?.plans?.items?.length
      ? loaderData.plans.items
      : FALLBACK_PLANS;

    const currentAmount = loaderData?.subscription?.amount ?? 0;
    const activeStatus = loaderData?.subscription?.status;

    return sourcePlans.map((plan, index) => {
      const price = plan.prices[0];
      const amount = price?.amount ?? 0;
      const currency = (price?.currency ?? "USD").toUpperCase();
      const interval = price?.interval ?? (plan.isRecurring ? "month" : "");
      const priceLabel =
        amount > 0 ? `$${(amount / 100).toFixed(0)}` : "Custom";

      const badge =
        amount === 0
          ? "Free forever"
          : index === 1
          ? "Most popular"
          : undefined;

      const isCurrent =
        Boolean(currentAmount) &&
        amount > 0 &&
        amount === currentAmount &&
        activeStatus === "active";

      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        priceLabel,
        currencyLabel: currency,
        badge,
        features: plan.features ?? [],
        buttonLabel: isCurrent ? "Current plan" : "Choose plan",
        intervalLabel: interval ? `/${interval}` : undefined,
        isPopular: badge === "Most popular",
        isCurrent,
      };
    });
  }, [loaderData]);

  const isLoading = !loaderData?.plans && loaderData !== undefined;

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <header className="space-y-4 text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Pricing
          </p>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Transparent plans built for assessment teams.
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, add collaboration when you need it, and scale to
              enterprise governance without migrating tools.
            </p>
          </div>
        </header>

        {isLoading && (
          <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading live plans…
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {normalizedPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col ${
                plan.isPopular ? "border-primary" : ""
              } ${plan.isCurrent ? "border-green-500 bg-green-50/40" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.badge && (
                    <Badge variant="outline" className="text-primary">
                      {plan.badge}
                    </Badge>
                  )}
                  {plan.isCurrent && (
                    <Badge variant="outline" className="text-green-600">
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold">
                    {plan.priceLabel}
                  </span>
                  {plan.intervalLabel && (
                    <span className="text-sm text-muted-foreground">
                      {plan.intervalLabel}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {plan.currencyLabel}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {plan.features.length === 0 && (
                  <p>Includes everything in the previous plan plus:</p>
                )}
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto flex flex-col gap-2">
                <Button
                  asChild
                  variant={plan.isCurrent ? "secondary" : "default"}
                  className="w-full"
                >
                  <Link to="/pricing" prefetch="viewport" className="gap-1.5">
                    {plan.buttonLabel}
                    {!plan.isCurrent && (
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    )}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full text-muted-foreground"
                >
                  <Link to="/contact" prefetch="viewport">
                    Talk to sales
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
