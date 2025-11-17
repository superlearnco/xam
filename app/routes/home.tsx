import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";

import IntegrationsSection from "~/components/homepage/integrations";
import ContentSection from "~/components/homepage/content";
import PricingSection from "~/components/homepage/pricing";
import TeamSection from "~/components/homepage/team";
import FooterSection from "~/components/homepage/footer";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  const pricingPayload = {
    plans: {
      items: [
        {
          id: "starter",
          name: "Starter",
          description: "Launch compliant assessments with guardrails included.",
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
          description: "Custom integrations, security reviews, and SLAs.",
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
            "White-glove onboarding",
          ],
        },
      ],
    },
    subscription: userId
      ? {
          status: "inactive",
          amount: 0,
        }
      : undefined,
  };

  return {
    hero: {
      isSignedIn: Boolean(userId),
      hasActiveSubscription: false,
    },
    pricing: pricingPayload,
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "XAM | AI-native assessment workspace" },
    {
      name: "description",
      content:
        "Design, version, and publish credible assessments with collaborative tooling built for modern learning teams.",
    },
  ];
}

export default function HomeRoute() {
  const { hero, pricing } = useLoaderData<typeof loader>();

  return (
    <>
      <IntegrationsSection loaderData={hero} />
      <main className="space-y-24 bg-background text-foreground">
        <ContentSection />
        <PricingSection loaderData={pricing} />
        <TeamSection />
      </main>
      <FooterSection />
    </>
  );
}
