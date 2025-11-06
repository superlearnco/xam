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
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const error = searchParams.get("error");
  const redirect = searchParams.get("redirect") || "/app";

  useEffect(() => {
    // If already authenticated, redirect to app
    if (isAuthenticated && !isLoading) {
      router.push(redirect);
    }
  }, [isAuthenticated, isLoading, router, redirect]);

  const handleLogin = () => {
    setIsLoggingIn(true);
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
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
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

            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                "Sign in with WorkOS"
              )}
            </Button>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
              <p>
                By signing in, you agree to our{" "}
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
            New to Xam?{" "}
            <a
              href="/"
              className="font-medium text-primary hover:underline"
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
