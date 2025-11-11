"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, ArrowLeft, RefreshCw, Mail } from "lucide-react";
import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-red-950 dark:to-gray-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <Card className="border-red-200 shadow-xl">
          <CardHeader className="text-center space-y-4 pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-3xl mb-2">Purchase Cancelled</CardTitle>
              <CardDescription className="text-base">
                Your payment was not processed
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                Don't worry, you haven't been charged. Your checkout session was cancelled
                and no payment was made.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">Why did this happen?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>You clicked the back button or cancelled the payment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>Your payment method was declined</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>The checkout session expired</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>There was a technical issue</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 text-sm text-center text-muted-foreground">
              <p>
                If you experienced an error or need assistance, please contact our support team.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/app/billing" className="flex-1">
                <Button className="w-full" size="lg">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </Link>
              <Link href="/app" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Need help? We're here to assist you.
              </p>
              <Button variant="ghost" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
