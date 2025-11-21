import { ClipboardList, Layers3, Sparkles, BookOpen, GraduationCap, FileCheck } from "lucide-react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

const FEATURES = [
  {
    title: "Visual Test Builder",
    description:
      "Design exams and quizzes with an intuitive interface. Add questions, set point values, and organize content visually.",
    icon: Layers3,
  },
  {
    title: "AI-Assisted Question Creation",
    description:
      "Generate high-quality questions aligned to your curriculum. Get suggestions for rubrics and answer keys.",
    icon: Sparkles,
  },
  {
    title: "Flexible Grading",
    description:
      "Mix auto-grading with manual review. Create custom rubrics and provide detailed feedback to students.",
    icon: ClipboardList,
  },
  {
    title: "Student-Friendly Delivery",
    description:
      "Share assessments with students through secure links. Track completion and view results in one place.",
    icon: FileCheck,
  },
];

export default function ContentSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 text-center">
          <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
            Built for Educators
          </Badge>
          <div className="mx-auto max-w-3xl space-y-4">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything you need to create meaningful assessments
            </h2>
            <p className="text-lg text-muted-foreground text-balance">
              Build question banks, create rubrics, and deliver assessments that help you understand what your students know. 
              All in one simple, powerful platform designed for teachers.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row pt-4">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/sign-up" prefetch="viewport">
                Get Started Free
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="rounded-full px-8">
              <Link to="/sign-in" prefetch="viewport">
                Sign In
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="group flex flex-col gap-4 rounded-2xl border bg-card/50 p-8 shadow-sm transition-all hover:bg-card hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
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
