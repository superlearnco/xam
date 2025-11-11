import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CREDIT_PACKAGES,
  formatCredits,
  getOperationDisplayName,
  ESTIMATED_CREDITS,
} from "@/lib/polar/config/pricing";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          Simple, Transparent Pricing
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Pay for What You Use
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          No subscriptions, no hidden fees. Just straightforward credit-based
          pricing for AI features.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Unlimited projects
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            No expiration
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Pay only for AI features
          </div>
        </div>
      </div>

      {/* Credit Packages */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CREDIT_PACKAGES.map((pkg) => {
              const totalCredits = pkg.credits + (pkg.bonusCredits || 0);
              const savings = pkg.bonusCredits
                ? ((pkg.bonusCredits / pkg.credits) * 100).toFixed(0)
                : null;

              return (
                <Card
                  key={pkg.id}
                  className={`relative ${pkg.popular ? "border-blue-500 border-2 shadow-xl scale-105" : ""}`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <CardDescription>
                      Perfect for{" "}
                      {pkg.credits <= 100
                        ? "trying out AI features"
                        : pkg.credits <= 500
                          ? "regular users"
                          : pkg.credits <= 1000
                            ? "power users"
                            : "teams and heavy usage"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-2">
                        ${pkg.price}
                      </div>
                      <div className="text-muted-foreground">
                        ${pkg.pricePerCredit.toFixed(3)} per credit
                      </div>
                    </div>

                    {savings && (
                      <div className="text-center">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          Save {savings}% with bonus credits
                        </Badge>
                      </div>
                    )}

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-muted-foreground">
                          Base credits
                        </span>
                        <span className="font-semibold">{pkg.credits}</span>
                      </div>
                      {pkg.bonusCredits && (
                        <div className="flex items-center justify-between py-2 text-green-600 dark:text-green-400">
                          <span>Bonus credits</span>
                          <span className="font-semibold">
                            +{pkg.bonusCredits}
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex items-center justify-between py-2 text-lg">
                        <span className="font-semibold">Total credits</span>
                        <span className="font-bold">{totalCredits}</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Link href="/app/billing">
                        <Button
                          className="w-full"
                          size="lg"
                          variant={pkg.popular ? "default" : "outline"}
                        >
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* How Credits Work */}
      <div className="bg-white dark:bg-gray-950 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How Credits Work</h2>
              <p className="text-muted-foreground">
                Credits are used for AI-powered features. The exact amount
                depends on the complexity of the task.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Estimated Credit Costs
                  </CardTitle>
                  <CardDescription>
                    Average credits per AI operation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(ESTIMATED_CREDITS)
                    .slice(0, 7)
                    .map(([operation, credits]) => (
                      <div
                        key={operation}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">
                          {getOperationDisplayName(operation)}
                        </span>
                        <Badge variant="secondary">
                          {formatCredits(credits)} credits
                        </Badge>
                      </div>
                    ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Token-Based Pricing
                  </CardTitle>
                  <CardDescription>Transparent AI token costs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Input tokens
                      </span>
                      <span className="font-medium">
                        15 credits / 1M tokens
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Output tokens
                      </span>
                      <span className="font-medium">
                        60 credits / 1M tokens
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    Final credit usage is calculated based on actual token
                    consumption by the AI model (Google Gemini 1.5 Flash).
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Example Usage */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Example Usage</h2>
              <p className="text-muted-foreground">
                See how far your credits can go
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">50 Credits</CardTitle>
                  <CardDescription className="text-center">
                    Starter Pack - $5
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Generate ~833 questions</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Or grade ~1,234 answers</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Or generate ~641 feedbacks</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-500 border-2">
                <CardHeader>
                  <CardTitle className="text-center">575 Credits</CardTitle>
                  <CardDescription className="text-center">
                    Large Pack - $50 (15% bonus)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Generate ~9,583 questions</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Or grade ~14,197 answers</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Or generate ~7,372 feedbacks</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">3,125 Credits</CardTitle>
                  <CardDescription className="text-center">
                    Business Pack - $250 (25% bonus)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Generate ~52,083 questions</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Or grade ~77,160 answers</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Or generate ~40,064 feedbacks</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white dark:bg-gray-950 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    Do credits expire?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No! Credits never expire. Purchase once and use them
                    whenever you need.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    What features require credits?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Only AI-powered features consume credits: AI question
                    generation, distractor generation, explanation generation,
                    automated grading, feedback generation, and rubric creation.
                    All other features (creating projects, manual grading,
                    analytics) are completely free.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    How do I get started?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sign up for a free account. Purchase credits to unlock AI
                    features anytime from your billing dashboard.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    Can I get a refund?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We offer a 30-day money-back guarantee on all credit
                    purchases. If you're not satisfied, contact our support team
                    for a full refund.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    Do you offer team or enterprise pricing?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Not yet, but team and enterprise plans are on our roadmap.
                    Contact us if you're interested in bulk credit purchases or
                    custom pricing for your institution.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sign up now and purchase credits to experience the power of
            AI-assisted test creation.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/app/billing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
