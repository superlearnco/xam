import { ClipboardList, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

const FEATURES = [
  {
    title: "Visual test builder",
    description:
      "Drag, reorder, and fine-tune every question type without touching configuration files.",
    icon: Layers3,
  },
  {
    title: "AI-assisted authoring",
    description:
      "Generate drafts, validate rubric coverage, and standardize tone across every section.",
    icon: Sparkles,
  },
  {
    title: "Adaptive scoring",
    description:
      "Blend auto-grading with manual overrides, rubric templates, and reviewer routing.",
    icon: ClipboardList,
  },
  {
    title: "Enterprise safeguards",
    description:
      "Row-level permissions, full audit history, and export-ready compliance packets.",
    icon: ShieldCheck,
  },
];

export default function ContentSection() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 text-center md:text-left">
          <Badge variant="outline" className="bg-primary/5 text-primary">
            Why teams ship with XAM
          </Badge>
          <div className="space-y-4">
            <h2 className="text-pretty text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything you need to design credible assessments.
            </h2>
            <p className="text-lg text-muted-foreground">
              Ship question banks, rubrics, and delivery embeds from a single,
              auditable workspace. No custom scripts, no brittle spreadsheets,
              just clean collaboration.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/sign-up" prefetch="viewport">
                Create free workspace
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/pricing" prefetch="viewport">
                Compare plans
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border bg-background text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
