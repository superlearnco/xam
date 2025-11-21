import type { Route } from "./+types/claim";
import { getAuth } from "@clerk/react-router/ssr.server";
import { redirect } from "react-router";
import { useLoaderData } from "react-router";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Navbar } from "~/components/homepage/navbar";
import FooterSection from "~/components/homepage/footer";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { CheckCircle2, Gift, AlertCircle } from "lucide-react";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  // Redirect to sign-in if not authenticated
  if (!userId) {
    throw redirect("/sign-in?redirect_url=/claim");
  }

  return {
    isSignedIn: true,
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Claim Free Credits | XAM" },
    {
      name: "description",
      content: "Claim your 10 free credits to get started with XAM.",
    },
  ];
}

export default function ClaimPage() {
  const { isSignedIn } = useLoaderData<typeof loader>();
  const claimFreeCredits = useMutation(api.credits.claimFreeCredits);
  const hasClaimed = useQuery(api.credits.hasClaimedFreeCredits);
  const userCredits = useQuery(api.credits.getUserCredits);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [claimedCredits, setClaimedCredits] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const alreadyClaimed = hasClaimed?.hasClaimed ?? false;
  const currentCredits = claimedCredits ?? userCredits?.credits ?? 0;

  const handleClaim = async () => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const result = await claimFreeCredits();
      setSuccess(true);
      setClaimedCredits(result.credits);
    } catch (err: any) {
      setError(err.message || "Failed to claim credits. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar loaderData={{ isSignedIn }} />
      <section className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <Badge
              className="mx-auto w-fit bg-primary/10 text-primary"
              variant="outline"
            >
              <Gift className="mr-2 h-3 w-3" />
              Free Credits
            </Badge>
            <h1 className="text-pretty text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Claim Your Free Credits
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Get started with 10 free credits to explore all that XAM has to offer.
            </p>
          </div>

          <Card className="mx-auto w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Free Credits Offer
              </CardTitle>
              <CardDescription>
                Claim your one-time welcome bonus of 10 free credits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {success || alreadyClaimed ? (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <div className="font-semibold mb-2">
                      {alreadyClaimed && !success
                        ? "You've already claimed your free credits!"
                        : "Credits claimed successfully!"}
                    </div>
                    <div>You currently have {currentCredits.toLocaleString()} credits.</div>
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        <span className="font-medium">Free Credits</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">10</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleClaim}
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting || alreadyClaimed}
                  >
                    {isSubmitting ? "Claiming..." : "Claim Free Credits"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Already claimed?{" "}
              <a href="/dashboard" className="text-primary hover:underline">
                Go to Dashboard
              </a>
            </p>
          </div>
        </div>
      </section>
      <FooterSection />
    </>
  );
}
