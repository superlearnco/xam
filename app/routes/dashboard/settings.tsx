"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/settings";
import { api } from "convex/_generated/api";
import SubscriptionStatus from "~/components/subscription-status";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { RotateCcw, HelpCircle } from "lucide-react";
import { resetEditorOnboarding } from "~/components/dashboard/editor-onboarding-flow";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings | XAM" },
  ];
}

export default function Page() {
  const navigate = useNavigate();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const onboardingStatus = useQuery(api.users.getOnboardingStatus);
  const resetOnboarding = useMutation(api.users.resetOnboarding);

  const handleRestartOnboarding = async () => {
    setIsResetting(true);
    try {
      await resetOnboarding();
      // Also reset the editor onboarding tour
      resetEditorOnboarding();
      setConfirmDialogOpen(false);
      // Navigate to dashboard to show onboarding
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to reset onboarding:", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
              <p className="text-muted-foreground">
                Manage your account settings and preferences.
              </p>
            </div>

            <SubscriptionStatus />

            {/* Onboarding Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Help & Onboarding
                </CardTitle>
                <CardDescription>
                  Need a refresher on how to use XAM? Restart the onboarding tour to learn about all the features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Onboarding Tour</p>
                    <p className="text-xs text-muted-foreground">
                      {onboardingStatus?.hasCompletedOnboarding 
                        ? "You have completed the onboarding tour." 
                        : "The onboarding tour is still in progress."}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setConfirmDialogOpen(true)}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restart Tour
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Restart Onboarding Tour?</DialogTitle>
            <DialogDescription>
              This will reset your onboarding progress and show the feature tour again when you visit the dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRestartOnboarding}
              disabled={isResetting}
            >
              {isResetting ? "Restarting..." : "Restart Tour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
