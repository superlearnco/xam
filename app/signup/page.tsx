"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [isSigningUp, setIsSigningUp] = useState(false);

  const error = searchParams.get("error");
  const redirect = searchParams.get("redirect") || "/app";

  useEffect(() => {
    // If already authenticated, redirect to app
    if (isAuthenticated && !isLoading) {
      router.push(redirect);
    }
  }, [isAuthenticated, isLoading, router, redirect]);

  const handleSignup = () => {
    setIsSigningUp(true);
    // WorkOS handles both login and signup in the same flow
    window.location.href = `/api/auth/login?redirect=${encodeURIComponent(redirect)}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Xam
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            AI-Powered Test Creation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Get started with Xam and create your first test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error === "missing_code" &&
                    "Authentication code is missing. Please try again."}
                  {error === "authentication_failed" &&
                    "Authentication failed. Please try again."}
                  {!error.includes("missing_code") &&
                    !error.includes("authentication_failed") &&
                    "An error occurred during authentication."}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h3 className="mb-3 font-semibold">What you get with Xam:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>10 free AI credits to get started</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>AI-powered question generation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>Automatic grading and feedback</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>Unlimited students and submissions</span>
                  </li>
                </ul>
              </div>
            </div>

            <Button
              onClick={handleSignup}
              disabled={isSigningUp}
              className="w-full"
              size="lg"
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                "Sign up with WorkOS"
              )}
            </Button>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
              <p>
                By signing up, you agree to our{" "}
                <a href="/terms" className="underline hover:text-slate-700">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="underline hover:text-slate-700">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
