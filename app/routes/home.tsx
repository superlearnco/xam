import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchAction, fetchQuery } from "convex/nextjs";
import { Navbar } from "~/components/homepage/navbar";
import HeroSection from "~/components/homepage/hero-section";
import FeaturesSection from "~/components/homepage/features-section";
import CTASection from "~/components/homepage/cta-section";
import Footer from "~/components/homepage/footer";
import Pricing from "~/components/homepage/pricing";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  const title = "xam - AI-Powered Test Creation Made Simple";
  const description =
    "Create, distribute, and grade tests in minutes with the power of AI. Perfect for teachers, trainers, and educators.";
  const keywords = "AI, Test Creation, Auto-Grading, Education, Teachers, Quiz, Assessment, Online Testing";
  const siteUrl = "https://www.xam.app/";
  const imageUrl = "/xam full.png";

  return [
    { title },
    {
      name: "description",
      content: description,
    },

    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:url", content: siteUrl },
    { property: "og:site_name", content: "xam by superlearn" },
    { property: "og:image", content: imageUrl },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    {
      name: "twitter:description",
      content: description,
    },
    { name: "twitter:image", content: imageUrl },
    {
      name: "keywords",
      content: keywords,
    },
    { name: "author", content: "superlearn" },
    { name: "favicon", content: "/xam favicon.png" },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  // Parallel data fetching to reduce waterfall
  const [subscriptionData, plans] = await Promise.all([
    userId
      ? fetchQuery(api.subscriptions.checkUserSubscriptionStatus, {
          userId,
        }).catch((error) => {
          console.error("Failed to fetch subscription data:", error);
          return null;
        })
      : Promise.resolve(null),
    fetchAction(api.subscriptions.getAvailablePlans),
  ]);

  return {
    isSignedIn: !!userId,
    hasActiveSubscription: subscriptionData?.hasActiveSubscription || false,
    plans,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Navbar loaderData={loaderData} />
      <HeroSection loaderData={loaderData} />
      <FeaturesSection />
      <Pricing loaderData={loaderData} />
      <CTASection loaderData={loaderData} />
      <Footer />
    </>
  );
}
