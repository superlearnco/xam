import type { ComponentType, SVGProps } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Zap, Layout, Users, BookOpen, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

import { Navbar } from "./navbar";
import { Button } from "~/components/ui/button";

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
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-purple-50 via-white to-white dark:from-slate-950 dark:via-background dark:to-background">
      <Navbar loaderData={loaderData} />

      {/* Abstract background blobs */}
      <div className="absolute -top-24 -left-24 -z-10 h-96 w-96 rounded-full bg-purple-200/50 blur-3xl filter dark:bg-purple-900/20" />
      <div className="absolute top-1/4 -right-24 -z-10 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl filter dark:bg-blue-900/20" />

      <div className="mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          
          {/* Left Column: Text */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-6 inline-flex items-center self-center lg:self-start gap-2 rounded-full border bg-white/80 px-4 py-1.5 text-sm font-medium text-purple-700 shadow-sm backdrop-blur-sm dark:bg-slate-900/80 dark:text-purple-300"
            >
              <Sparkles className="h-4 w-4" />
              <span>The AI-native assessment workspace</span>
            </motion.div>

            <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">
              Inspiring teachers, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">engaging students</span>
            </h1>
            
            <p className="mb-8 text-xl text-slate-600 text-balance dark:text-slate-300">
              Build complete assessments in minutes with AI. Generate tests from simple prompts, use drag-and-drop editing, and deliver secure exams with smart grading and analytics.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full bg-purple-600 px-8 text-lg font-medium hover:bg-purple-700 shadow-lg shadow-purple-200 dark:shadow-none transition-transform hover:scale-105"
              >
                <Link to={primaryCta.href} prefetch="viewport">
                  {primaryCta.label}
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 rounded-full border-2 px-8 text-lg font-medium hover:bg-slate-50 transition-transform hover:scale-105"
              >
                <Link to={secondaryCta.href} prefetch="viewport">
                  {secondaryCta.label}
                </Link>
              </Button>
            </div>
            
            <div className="mt-10 flex items-center justify-center gap-6 text-sm text-slate-500 lg:justify-start dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Free for teachers</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Image/Visuals */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mx-auto w-full max-w-[600px] lg:max-w-none"
          >
            <div className="relative aspect-[4/3] w-full rounded-3xl bg-gradient-to-br from-purple-100 to-blue-100 p-4 shadow-2xl dark:from-slate-800 dark:to-slate-900">
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl bg-white shadow-inner dark:bg-slate-950">
                 <img 
                   src="/hero image.png" 
                   alt="XAM Dashboard Interface" 
                   className="h-full w-full object-cover object-top opacity-95 transition-opacity hover:opacity-100"
                 />
              </div>
              
              {/* Floating Elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -left-8 top-12 hidden md:flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">AI Generated</p>
                  <p className="text-xs text-slate-500">Full test in seconds</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute -right-6 bottom-20 hidden md:flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Smart Grading</p>
                  <p className="text-xs text-slate-500">Auto & manual marking</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
