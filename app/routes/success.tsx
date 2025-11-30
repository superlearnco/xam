"use client";
import type { Route } from "./+types/success";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/react-router";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { CheckCircle, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "~/lib/databuddy";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Success | XAM" },
  ];
}

export default function Success() {
  const { isSignedIn, userId } = useAuth();
  // Get the latest purchase to show details
  const lastPurchase = useQuery(api.users.getLastPurchase);
  const upsertUser = useMutation(api.users.upsertUser);
  const purchaseTrackedRef = useRef(false);
  const [isWaitingForWebhook, setIsWaitingForWebhook] = useState(true);

  // Ensure user is created/updated when they land on success page
  useEffect(() => {
    if (isSignedIn) {
      upsertUser();
    }
  }, [isSignedIn, upsertUser]);

  // Check if we have a recent purchase
  const recentPurchase = lastPurchase && (Date.now() - lastPurchase.createdAt < 5 * 60 * 1000) ? lastPurchase : null;

  useEffect(() => {
    // If we found a recent purchase, stop waiting
    if (recentPurchase) {
      setIsWaitingForWebhook(false);
    }
    
    // Stop waiting after 10 seconds anyway to avoid infinite loading feeling
    const timer = setTimeout(() => {
      setIsWaitingForWebhook(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [recentPurchase]);

  // Track Purchase event when transaction is found
  useEffect(() => {
    if (
      recentPurchase &&
      userId &&
      !purchaseTrackedRef.current
    ) {
      trackEvent("Purchase", {
        user_id: userId,
        transaction_id: recentPurchase.polarOrderId || recentPurchase._id,
        amount: recentPurchase.amount, // Credits amount
        type: "credit_purchase",
      });
      purchaseTrackedRef.current = true;
    }
  }, [recentPurchase, userId]);

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="max-w-md w-full text-center border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
            <CardDescription>
              Please sign in to view your purchase details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg">
              <Link to="/sign-in">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // While loading initial data or waiting for webhook
  if (lastPurchase === undefined || (isWaitingForWebhook && !recentPurchase)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">Processing Payment</h3>
            <p className="text-muted-foreground">Please wait while we confirm your transaction...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-4">
      <Card className="max-w-lg w-full border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        
        <CardHeader className="pb-2 text-center pt-12">
          <div className="mx-auto mb-6 bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-fit shadow-inner">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-lg mt-2 text-slate-600 dark:text-slate-400">
             {recentPurchase 
               ? "Your credits have been instantly added to your account."
               : "Your payment was received and credits will be added shortly."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {/* Purchase Details Card */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Total Credits</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                {recentPurchase ? recentPurchase.amount : "Updating..."}
              </span>
            </div>
            
            <div className="h-px bg-slate-200 dark:bg-slate-700" />
            
            <div className="flex items-center justify-between">
               <span className="text-slate-500 dark:text-slate-400 font-medium">Transaction Date</span>
               <span className="text-slate-900 dark:text-slate-100 font-medium">
                 {recentPurchase 
                   ? new Date(recentPurchase.createdAt).toLocaleDateString(undefined, { 
                       year: 'numeric', 
                       month: 'long', 
                       day: 'numeric' 
                     }) 
                   : new Date().toLocaleDateString(undefined, { 
                       year: 'numeric', 
                       month: 'long', 
                       day: 'numeric' 
                     })}
               </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button asChild className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 transition-all duration-300">
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full h-12 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Link to="/">
                Return Home
              </Link>
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              A receipt has been sent to your email address. 
              <br />
              If you have any questions, please contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
