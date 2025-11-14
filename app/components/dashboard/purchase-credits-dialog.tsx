import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Sparkles, CreditCard } from "lucide-react";
import { toast } from "sonner";

export function PurchaseCreditsDialog() {
  const [amount, setAmount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const createCheckout = useMutation(api.billing.createCreditCheckout);

  const credits = amount * 10;

  const handlePurchase = async () => {
    if (amount < 5) {
      toast.error("Minimum purchase amount is $5");
      return;
    }

    setIsLoading(true);
    try {
      const checkoutUrl = await createCheckout({ amount });
      
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

  const presetAmounts = [5, 10, 25, 50, 100];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <CreditCard className="h-4 w-4" />
          Purchase Credits
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Purchase AI Credits
          </DialogTitle>
          <DialogDescription>
            Add credits to use AI-powered features like test generation and grading
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              min={5}
              step={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(5, Number(e.target.value)))}
              placeholder="Enter amount"
            />
            <p className="text-sm text-muted-foreground">
              You will receive{" "}
              <span className="font-semibold text-foreground">
                {credits} credits
              </span>
            </p>
          </div>

          {/* Preset Amounts */}
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="grid grid-cols-5 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(preset)}
                  className="font-mono"
                >
                  ${preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Pricing Info */}
          <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Pricing</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• $1 = 10 Credits</p>
              <p>• Minimum purchase: $5 (50 credits)</p>
              <p>• Credits never expire</p>
            </div>
          </div>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            disabled={isLoading || amount < 5}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Purchase {credits} Credits for ${amount}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Polar
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

