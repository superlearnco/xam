"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Sparkles, FileText, BarChart3, Shield, Zap, Users, ArrowRight } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description: "Automatically generate test questions and distractor options with advanced AI assistance.",
  },
  {
    icon: FileText,
    title: "Multiple Format Support",
    description: "Create tests, essays, and surveys in one unified platform with 10+ question types.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track class performance with visual dashboards and detailed insights.",
  },
  {
    icon: Zap,
    title: "Smart Marking",
    description: "AI-assisted grading for open-ended responses saves hours of manual work.",
  },
  {
    icon: Shield,
    title: "Secure Testing",
    description: "Password protection, browser restrictions, and account verification options.",
  },
  {
    icon: Users,
    title: "Instant Feedback",
    description: "Optional immediate results for students with detailed explanations.",
  },
]

const steps = [
  {
    number: "01",
    title: "Create with AI",
    description: "Start from scratch or let AI generate your test questions based on your topic.",
  },
  {
    number: "02",
    title: "Customize",
    description: "Fine-tune questions, add media, set point values, and configure options.",
  },
  {
    number: "03",
    title: "Share",
    description: "Publish and share via link, QR code, or integrate with your LMS.",
  },
  {
    number: "04",
    title: "Grade",
    description: "Review submissions with AI-assisted marking and detailed analytics.",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/xam-favicon.png" alt="Xam" width={32} height={32} className="w-8 h-8" />
            <span className="text-xl font-bold">Xam</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/app">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-balance">
                AI-Powered Test Creation for Modern Educators
              </h1>
              <p className="text-xl text-muted-foreground mb-8 text-pretty">
                Create engaging tests, essays, and surveys in minutes with intelligent AI assistance. Grade faster, gain
                insights, and focus on what matters most—teaching.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/app">
                  <Button size="lg" className="gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              className="relative"
            >
              <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center">
                <Image
                  src="/images/xam-full.png"
                  alt="Xam Platform"
                  width={400}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make test creation and grading effortless
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From creation to grading in four simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-primary/20 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-primary/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Testing?</h2>
            <p className="text-xl mb-8 opacity-90">Join thousands of educators creating better assessments with AI</p>
            <Link href="/app">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Creating Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/images/superlearn-full.png"
                alt="Superlearn"
                width={150}
                height={30}
                className="h-6 w-auto"
              />
            </div>

            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">© 2025 Superlearn. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
