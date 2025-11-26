import { motion } from "motion/react";
import {
  Wand2,
  LayoutTemplate,
  GraduationCap,
  Share2,
  BarChart3,
  PenTool,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { DragDropBuilderPreview } from "./feature-previews/drag-drop-builder-preview";
import { AIGenerationPreview } from "./feature-previews/ai-generation-preview";
import { GradingAnalysisPreview } from "./feature-previews/grading-analysis-preview";
import { SecureDeliveryPreview } from "./feature-previews/secure-delivery-preview";

const FEATURES = [
  {
    title: "Drag-and-Drop Test Builder",
    description:
      "Build assessments visually with 8 question types including multiple choice, short answer, long answer, checkboxes, dropdowns, image choices, and more. Drag, drop, and customize with an intuitive interface designed for teachers.",
    icon: LayoutTemplate,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    imageColor: "bg-blue-50 dark:bg-blue-950/30",
    benefits: [
      "8 different question types to choose from",
      "LaTeX support for math equations",
      "Real-time preview as you build",
      "Easy drag-and-drop reordering",
    ],
  },
  {
    title: "AI Test Generation",
    description:
      "Describe your test in plain English and watch AI generate the entire assessment structure, questions, and answer keys in seconds. Specify grade level, subject, and difficulty to get perfectly tailored content.",
    icon: Wand2,
    color:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    imageColor: "bg-purple-50 dark:bg-purple-950/30",
    benefits: [
      "Generate complete tests from a simple prompt",
      "Automatic question and answer key creation",
      "Grade-level and subject-specific content",
      "Adjustable difficulty levels",
    ],
  },
  {
    title: "Smart Grading & Analysis",
    description:
      "Auto-grade multiple choice questions instantly, then manually review and mark open-ended responses. Get detailed analytics on student performance, question difficulty, and class-wide insights.",
    icon: BarChart3,
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    imageColor: "bg-pink-50 dark:bg-pink-950/30",
    benefits: [
      "Automatic grading for objective questions",
      "AI-powered marking for subjective answers",
      "Performance analytics per question",
      "Export results and insights",
    ],
  },
  {
    title: "Secure Test Delivery",
    description:
      "Share tests via secure links with password protection, time limits, and anti-cheating features. Control access with full-screen mode, tab-switching detection, and copy-paste blocking.",
    icon: Share2,
    color:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    imageColor: "bg-amber-50 dark:bg-amber-950/30",
    benefits: [
      "Password-protected test links",
      "Time limits and attempt restrictions",
      "Anti-cheating security features",
      "One-page or multi-page viewing options",
    ],
  },
];

export default function ContentSection() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Stats / Trust Section */}
      <section className="border-y bg-slate-50/50 py-12 dark:bg-slate-900/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 text-center md:gap-12">
            {[
              { label: "Question Types", value: "8+" },
              { label: "Test Settings", value: "15+" },
              { label: "Time Saved", value: "10 Hours/Week" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col gap-1"
              >
                <dt className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {stat.value}
                </dt>
                <dd className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {stat.label}
                </dd>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features - Alternating Layout */}
      <section
        id="features"
        className="mx-auto flex max-w-6xl flex-col gap-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge
            variant="outline"
            className="border-purple-200 bg-purple-50 text-purple-700 px-4 py-1 text-sm rounded-full"
          >
            Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">
            Everything you need to assess with confidence
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            XAM combines powerful design tools with intelligent automation to
            streamline your entire assessment workflow.
          </p>
        </div>

        <div className="flex flex-col gap-20">
          {FEATURES.map((feature, index) => {
            const isEven = index % 2 === 0;
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className={`flex flex-col gap-8 lg:items-center ${
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Text Side */}
                <div className="flex-1 space-y-6">
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color}`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                  <ul className="space-y-3 pt-2">
                    {feature.benefits?.map((benefit, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-slate-700 dark:text-slate-300"
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual Side */}
                <div className="flex-1">
                  <div
                    className={`relative aspect-square w-full overflow-hidden rounded-3xl ${feature.imageColor} p-4 sm:p-6 lg:p-8 shadow-sm transition-transform hover:scale-[1.02] duration-500`}
                  >
                    {feature.title === "Drag-and-Drop Test Builder" && (
                      <DragDropBuilderPreview />
                    )}
                    {feature.title === "AI Test Generation" && (
                      <AIGenerationPreview />
                    )}
                    {feature.title === "Smart Grading & Analysis" && (
                      <GradingAnalysisPreview />
                    )}
                    {feature.title === "Secure Test Delivery" && (
                      <SecureDeliveryPreview />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-6 py-20 text-center text-white shadow-2xl dark:bg-slate-800 md:px-16 md:py-24"
        >
          <div className="absolute top-0 left-0 -z-10 h-full w-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-500/30 via-transparent to-transparent" />
          <div className="absolute bottom-0 right-0 -z-10 h-full w-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/30 via-transparent to-transparent" />

          <h2 className="mx-auto mb-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Ready to transform your assessments?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-slate-300">
            Join teachers who are saving time and creating better learning
            experiences with XAM.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-full bg-white px-8 text-lg font-semibold text-slate-900 hover:bg-slate-100"
            >
              <Link to="/sign-up">Get Started Free</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 rounded-full border-slate-700 bg-transparent px-8 text-lg font-semibold text-white hover:bg-slate-800 hover:text-white"
            >
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
