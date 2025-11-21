import type { ComponentType, SVGProps } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Zap, Layout, Users, BookOpen } from "lucide-react";

import { Navbar } from "./navbar";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

type LoaderData = {
  isSignedIn: boolean;
  hasActiveSubscription: boolean;
};

type HeroProps = {
  loaderData?: LoaderData;
};

export default function HeroSection({ loaderData }: HeroProps) {
  const primaryCta = loaderData?.isSignedIn
    ? { label: "Open Dashboard", href: "/dashboard" }
    : { label: "Start for Free", href: "/sign-up" };

  const secondaryCta = loaderData?.isSignedIn
    ? { label: "Settings", href: "/dashboard/settings" }
    : { label: "Sign In", href: "/sign-in" };

  return (
    <section id="hero" className="relative overflow-hidden bg-background">
      <Navbar loaderData={loaderData} />
      
      {/* Abstract background element */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-40" />
      
      <div className="mx-auto flex min-h-[90vh] max-w-6xl flex-col items-center justify-center px-4 py-32 text-center sm:px-6 lg:px-8">
        
        <div className="animate-fade-in-up space-y-8">
          <a 
            href="https://superlearn.com" 
            target="_blank" 
            rel="noreferrer"
            className="mx-auto inline-flex items-center gap-2 rounded-full border bg-background/50 px-3 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            Made by Superlearn
          </a>

          <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
              Create better assessments for your students
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Design engaging exams, quizzes, and assignments with AI assistance. 
              XAM helps teachers build credible assessments that truly measure student learning.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-8 text-base">
              <Link to={primaryCta.href} prefetch="viewport">
                {primaryCta.label}
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-8 text-base">
              <Link to={secondaryCta.href} prefetch="viewport">
                {secondaryCta.label}
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-24 grid w-full gap-8 sm:grid-cols-3">
          <FeatureHighlight 
            icon={Layout}
            title="Visual Builder"
            description="Create exams with an intuitive drag-and-drop interface. No technical skills required."
          />
          <FeatureHighlight 
            icon={BookOpen}
            title="Question Library"
            description="Build a reusable question bank and organize assessments by topic or unit."
          />
          <FeatureHighlight 
            icon={Zap}
            title="AI Assistance"
            description="Generate questions, create rubrics, and get suggestions to improve your assessments."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureHighlight({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card/50 p-6 text-center shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
