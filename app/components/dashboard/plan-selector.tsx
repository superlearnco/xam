import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Check, CreditCard, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { PurchaseCreditsDialog } from "./purchase-credits-dialog";

export function PlanSelector() {
  const [isLoading, setIsLoading] = useState(false);
  const credits = useQuery(api.credits.index.getCredits);
  const createPayAsYouGoCheckout = useMutation(api.billing.createPayAsYouGoCheckout);

  const currentPlan = credits?.plan || "free";

  const handleSubscribePayAsYouGo = async () => {
    setIsLoading(true);
    try {
      const checkoutUrl = await createPayAsYouGoCheckout();
      
      if (checkoutUrl) {
        // Redirect to Polar checkout
        window.location.href = checkoutUrl;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Failed to create checkout session");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Billing Plans</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you want to pay for AI features
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pay-Per-Use Plan */}
        <Card className={currentPlan === "pay_as_you_go" || currentPlan === "free" ? "border-2" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pay-Per-Use
              </CardTitle>
              {(currentPlan === "pay_as_you_go" || currentPlan === "free") && (
                <Badge variant="default">Current</Badge>
              )}
            </div>
            <CardDescription>Purchase credits as you need them</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm">No monthly commitment</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm">Credits never expire</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm">$1 = 10 credits</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm">Minimum $5 purchase</p>
              </div>
            </div>

            <div className="pt-2">
              <PurchaseCreditsDialog />
            </div>
          </CardContent>
        </Card>

        {/* Pay-As-You-Go Plan */}
        <Card className={currentPlan === "pay_as_you_go_subscription" ? "border-2 border-primary" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Pay-As-You-Go
              </CardTitle>
              {currentPlan === "pay_as_you_go_subscription" && (
                <Badge variant="default">Active</Badge>
              )}
            </div>
            <CardDescription>Billed monthly based on usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm">No upfront cost</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm">Only pay for what you use</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm">$25 per million input tokens</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm">$50 per million output tokens</p>
              </div>
            </div>

            <div className="pt-2">
              {currentPlan === "pay_as_you_go_subscription" ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  onClick={handleSubscribePayAsYouGo}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Processing...
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Comparison */}
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle className="text-base">Token Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Input Tokens</span>
              <span className="font-mono">$0.003 per 1K tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Output Tokens</span>
              <span className="font-mono">$0.015 per 1K tokens</span>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Credit pricing: 1 credit = $0.10 USD
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

