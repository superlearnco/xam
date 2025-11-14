"use client";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export default function CTASection({
  loaderData,
}: {
  loaderData?: { isSignedIn: boolean; hasActiveSubscription: boolean };
}) {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 px-8 py-16 md:px-16 md:py-24 text-center"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to Transform Your Testing?
            </h2>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of teachers already using xam to create better tests
              and save time on grading
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-lg px-8 py-6"
              >
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
            </div>

            {/* Trust indicator */}
            <p className="text-sm text-white/80 pt-4">
              No credit card required • Start creating tests in minutes
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </motion.div>
      </div>
    </section>
  );
}

