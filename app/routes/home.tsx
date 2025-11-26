import type { Route } from "./+types/home";
import { useLoaderData, redirect } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";

import IntegrationsSection from "~/components/homepage/integrations";
import ContentSection from "~/components/homepage/content";
import FooterSection from "~/components/homepage/footer";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);
  const url = new URL(args.request.url);
  
  // If user is signed in and visiting the root path /, redirect to dashboard
  // If they are visiting /home, allow them to stay
  if (userId && url.pathname === "/") {
    throw redirect("/dashboard");
  }

  return {
    hero: {
      isSignedIn: Boolean(userId),
      hasActiveSubscription: false,
    },
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "XAM | AI-native assessment workspace for teachers" },
    {
      name: "description",
      content:
        "Create better assessments for your students. Design engaging exams, quizzes, and assignments with AI assistance.",
    },
  ];
}

export default function HomeRoute() {
  const { hero } = useLoaderData<typeof loader>();

  return (
    <>
      <IntegrationsSection loaderData={hero} />
      <main className="text-foreground">
        <ContentSection />
      </main>
      <FooterSection />
    </>
  );
}
