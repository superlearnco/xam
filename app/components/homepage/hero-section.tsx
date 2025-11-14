"use client";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export default function HeroSection({
  loaderData,
}: {
  loaderData?: { isSignedIn: boolean; hasActiveSubscription: boolean };
}) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 md:py-32 text-center">
        {/* Animated headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            AI-Powered Test Creation
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          
          {/* Animated subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto"
          >
            Create, distribute, and grade tests in minutes with the power of AI.
            Perfect for teachers, trainers, and educators.
          </motion.p>

          {/* Animated CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link
                to={
                  loaderData?.isSignedIn
                    ? "/dashboard"
                    : "/sign-up"
                }
                prefetch="viewport"
              >
                Get Started Free
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <Link to="#features">
                See How It Works
              </Link>
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="pt-8 text-sm text-muted-foreground"
          >
            No credit card required • Free forever for basic features
          </motion.div>
        </motion.div>

        {/* Animated mockup placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 relative"
        >
          <div className="relative mx-auto max-w-5xl">
            <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center">
                <p className="text-muted-foreground text-lg">
                  Product Demo Preview
                </p>
              </div>
            </div>
            
            {/* Floating animation effect */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 -z-10"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 blur-3xl rounded-full" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

