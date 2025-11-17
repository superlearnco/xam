import type { ComponentType, SVGProps } from "react";
import { Link } from "react-router";
import { ShieldCheck, Activity, Clock3, ArrowUpRight } from "lucide-react";

import { Navbar } from "./navbar";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

type LoaderData = {
  isSignedIn: boolean;
  hasActiveSubscription: boolean;
};

type HeroProps = {
  loaderData?: LoaderData;
};

const stats = [
  { label: "Assessments launched", value: "1,200+" },
  { label: "Average build time", value: "12 min" },
  { label: "Enterprise NPS", value: "72" },
];

export default function IntegrationsSection({ loaderData }: HeroProps) {
  const primaryCta = loaderData?.isSignedIn
    ? loaderData?.hasActiveSubscription
      ? { label: "Open dashboard", href: "/dashboard" }
      : { label: "Choose a plan", href: "/pricing" }
    : { label: "Start for free", href: "/sign-up" };

  const secondaryCta = loaderData?.isSignedIn
    ? { label: "View pricing", href: "/pricing" }
    : { label: "Sign in", href: "/sign-in" };

  return (
    <section id="hero" className="relative">
      <Navbar loaderData={loaderData} />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-12 px-4 py-32 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <Badge
              className="w-fit bg-primary/10 text-primary"
              variant="outline"
            >
              AI-native assessment workspace
            </Badge>
            <div className="space-y-4">
              <h1 className="text-pretty text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Build polished exams, surveys, and reports in minutes.
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                XAM unifies question design, scoring logic, and delivery into a
                single, dependable workspace. Collaborate with your team,
                automate versioning, and ship assessments that people actually
                understand.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link to={primaryCta.href} prefetch="viewport">
                  {primaryCta.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={secondaryCta.href} prefetch="viewport">
                  {secondaryCta.label}
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <dl
                  key={item.label}
                  className="rounded-xl border bg-card px-4 py-3 text-center shadow-sm"
                >
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="text-2xl font-semibold text-foreground">
                    {item.value}
                  </dd>
                </dl>
              ))}
            </div>
          </div>

          <aside className="w-full max-w-md flex-1 rounded-2xl border bg-card p-6 shadow-lg">
            <div className="space-y-5">
              <FeatureRow
                icon={ShieldCheck}
                title="Role & permissions aware"
                description="Fine-grained controls let admins, reviewers, and graders focus only on the workflows they own."
              />
              <FeatureRow
                icon={Activity}
                title="Real-time collaboration"
                description="See edits as they happen, comment inline, and restore any version instantly."
              />
              <FeatureRow
                icon={Clock3}
                title="Automated compliance"
                description="Generate accessibility summaries, shareable audit trails, and PDF exports from a single source."
              />
            </div>
            <div className="mt-8 rounded-xl border bg-background px-5 py-4">
              <p className="text-sm font-medium text-foreground">
                “We replaced four internal tools with XAM. Question banks stay
                organized, approvals are faster, and results look on-brand.”
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Alex Rivera · Director of Learning Innovation, NovaU
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

type FeatureRowProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

function FeatureRow({ icon: Icon, title, description }: FeatureRowProps) {
  return (
    <div className="flex gap-4 rounded-xl border px-4 py-3">
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-lg border bg-background text-primary"
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
