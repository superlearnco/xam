import type { Route } from "./+types/pricing";
import { useLoaderData, Link } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";

import { Navbar } from "~/components/homepage/navbar";
import PricingSection from "~/components/homepage/pricing";
import FooterSection from "~/components/homepage/footer";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

const MARKETING_PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "Launch compliant assessments with built-in guardrails.",
    isRecurring: true,
    prices: [
      {
        id: "starter-monthly",
        amount: 2900,
        currency: "usd",
        interval: "month",
      },
    ],
    features: ["Unlimited drafts", "Live preview", "Standard exports"],
  },
  {
    id: "scale",
    name: "Scale",
    description: "Everything teams need to collaborate with reviewers.",
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
      "Audit history",
      "Priority support",
      "AI authoring seats",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom integrations, governance, and white-glove onboarding.",
    isRecurring: true,
    prices: [
      {
        id: "enterprise-monthly",
        amount: 24900,
        currency: "usd",
        interval: "month",
      },
    ],
    features: [
      "Dedicated CSM",
      "SSO & SCIM",
      "Custom data retention",
      "Security reviews & SLAs",
    ],
  },
] as const;

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  return {
    isSignedIn: Boolean(userId),
    pricing: {
      plans: {
        items: MARKETING_PLANS,
      },
      subscription: userId
        ? {
            status: "inactive",
            amount: 0,
          }
        : undefined,
    },
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Pricing | XAM" },
    {
      name: "description",
      content:
        "Predictable pricing tiers for assessment teams of every size. Start free and scale to enterprise governance when you’re ready.",
    },
  ];
}

export default function PricingRoute() {
  const { isSignedIn, pricing } = useLoaderData<typeof loader>();

  return (
    <>
      <Hero isSignedIn={isSignedIn} />
      <PricingSection loaderData={pricing} />
      <FooterSection />
    </>
  );
}

function Hero({ isSignedIn }: { isSignedIn: boolean }) {
  const primaryCta = isSignedIn ? "/dashboard" : "/sign-up";
  const secondaryCta = isSignedIn ? "/contact" : "/pricing#faq";

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
              Flexible plans for modern assessment teams
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Start building with collaborative tooling, add reviewer seats when
              you need them, and scale to enterprise governance without
              switching platforms.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to={primaryCta} prefetch="viewport">
                {isSignedIn ? "Open dashboard" : "Start for free"}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to={secondaryCta} prefetch="viewport">
                {isSignedIn ? "Talk to sales" : "View FAQs"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
