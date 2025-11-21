import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";

import IntegrationsSection from "~/components/homepage/integrations";
import ContentSection from "~/components/homepage/content";
import FooterSection from "~/components/homepage/footer";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

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
      <main className="bg-background text-foreground">
        <ContentSection />
      </main>
      <FooterSection />
    </>
  );
}
