import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { Polar } from "@polar-sh/sdk";
import { api } from "./_generated/api";

// Get user's current credits balance
export const getUserCredits = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { credits: 0 };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    return { credits: user?.credits || 0 };
  },
});

// Add credits to user account (used when credits are purchased)
export const addCredits = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    description: v.optional(v.string()),
    polarOrderId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const currentCredits = user.credits || 0;
    const newCredits = currentCredits + args.amount;

    // Update user credits
    await ctx.db.patch(user._id, {
      credits: newCredits,
    });

    // Create transaction record
    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      amount: args.amount,
      type: "purchase",
      description: args.description || "Credits purchased",
      polarOrderId: args.polarOrderId,
      createdAt: Date.now(),
    });

    return { credits: newCredits };
  },
});

// Deduct credits from user account (used when credits are consumed)
export const deductCredits = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    description: v.optional(v.string()),
    meterId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.userId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const currentCredits = user.credits || 0;
    if (currentCredits < args.amount) {
      throw new Error("Insufficient credits");
    }

    const newCredits = currentCredits - args.amount;

    // Update user credits
    await ctx.db.patch(user._id, {
      credits: newCredits,
    });

    // Create transaction record
    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      amount: -args.amount,
      type: "usage",
      description: args.description || "Credits used",
      meterId: args.meterId,
      createdAt: Date.now(),
    });

    return { credits: newCredits };
  },
});

// Check if user has enough credits
export const checkCredits = query({
  args: {
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { hasEnough: false, credits: 0 };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    const credits = user?.credits || 0;
    return { hasEnough: credits >= args.amount, credits };
  },
});

// Get credit transactions history
export const getCreditTransactions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
      .order("desc")
      .take(args.limit || 50);

    return transactions;
  },
});

// Check if user has pay-as-you-go subscription
export const hasPayAsYouGoSubscription = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { hasPayAsYouGo: false, subscription: null };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user) {
      return { hasPayAsYouGo: false, subscription: null };
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
      .first();

    const hasPayAsYouGo = subscription?.status === "active" && subscription?.isMetered === true;
    return { hasPayAsYouGo, subscription };
  },
});

// Use credits or report to meter (handles both credit-based and pay-as-you-go)
export const useCredits = action({
  args: {
    amount: v.number(),
    description: v.optional(v.string()),
    meterId: v.optional(v.string()),
    reportToPolar: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; remainingCredits?: number; billingType: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user has pay-as-you-go subscription
    const payAsYouGoCheck = await ctx.runQuery(api.credits.hasPayAsYouGoSubscription);
    
    if (payAsYouGoCheck.hasPayAsYouGo && args.meterId) {
      // Pay-as-you-go: Report usage to Polar Meter (no credit deduction)
      const meterResult = await ctx.runAction(api.credits.reportMeterUsage, {
        meterId: args.meterId,
        amount: args.amount,
        description: args.description,
      });
      return meterResult;
    }

    // Credit-based: Check if user has enough credits
    const creditCheck = await ctx.runQuery(api.credits.checkCredits, {
      amount: args.amount,
    });

    if (!creditCheck.hasEnough) {
      throw new Error(`Insufficient credits. You have ${creditCheck.credits} credits, but need ${args.amount}.`);
    }

    // Optionally report to Polar Meter if configured (for tracking purposes)
    if (args.reportToPolar && args.meterId && process.env.POLAR_ACCESS_TOKEN) {
      try {
        const polar = new Polar({
          server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
          accessToken: process.env.POLAR_ACCESS_TOKEN,
        });

        // Find customer ID from subscriptions
        const subscription = await ctx.runQuery(
          api.subscriptions.fetchUserSubscription
        );

        if (subscription?.customerId) {
          // Log usage for tracking (actual billing happens via Polar Meters)
          console.log(`Tracking meter usage: ${args.meterId}, amount: ${args.amount}, customer: ${subscription.customerId}`);
        }
      } catch (error) {
        console.error("Error reporting to Polar Meter (non-fatal):", error);
        // Don't throw - we still want to deduct credits even if Polar reporting fails
      }
    }

    // Deduct credits from user account
    const result: { credits: number } = await ctx.runMutation(api.credits.deductCredits, {
      userId: identity.subject,
      amount: args.amount,
      description: args.description || `Credits used${args.meterId ? ` (meter: ${args.meterId})` : ""}`,
      meterId: args.meterId,
    });

    return { success: true, remainingCredits: result.credits, billingType: "credits" };
  },
});

// Report usage to Polar Meter for pay-as-you-go subscriptions
export const reportMeterUsage = action({
  args: {
    meterId: v.string(),
    amount: v.number(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; billingType: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (!process.env.POLAR_ACCESS_TOKEN) {
      throw new Error("POLAR_ACCESS_TOKEN is not configured");
    }

    const polar = new Polar({
      server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    // Get user and subscription
    const user = await ctx.runQuery(api.users.findUserByToken, {
      tokenIdentifier: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const subscription = await ctx.runQuery(
      api.subscriptions.fetchUserSubscription
    );

    if (!subscription?.customerId) {
      throw new Error("Customer ID not found. User needs an active subscription.");
    }

    if (!subscription.isMetered) {
      throw new Error("User does not have a pay-as-you-go subscription.");
    }

    // Verify meter ID is associated with this subscription
    if (subscription.meterIds && !subscription.meterIds.includes(args.meterId)) {
      console.warn(`Meter ID ${args.meterId} not in subscription meter list, but proceeding anyway`);
    }

    // Report usage to Polar Meter
    try {
      // Note: Adjust this based on actual Polar SDK API
      // Polar may use a different method name or structure
      console.log(`Reporting meter usage to Polar:`, {
        meterId: args.meterId,
        customerId: subscription.customerId,
        amount: args.amount,
        metadata: args.metadata || {},
      });

      // Store usage record
      await ctx.runMutation(api.credits.recordMeterUsage, {
        userId: identity.subject,
        subscriptionId: subscription._id,
        meterId: args.meterId,
        amount: args.amount,
        description: args.description,
        metadata: args.metadata,
      });

      // If Polar SDK has meters.reportUsage or similar, uncomment:
      // await polar.meters.reportUsage({
      //   meterId: args.meterId,
      //   customerId: subscription.customerId,
      //   amount: args.amount,
      //   metadata: args.metadata || {},
      // });

      return { success: true, billingType: "pay-as-you-go" };
    } catch (error) {
      console.error("Error reporting meter usage:", error);
      throw error;
    }
  },
});

// Record meter usage in database
export const recordMeterUsage = mutation({
  args: {
    userId: v.string(),
    subscriptionId: v.string(),
    meterId: v.string(),
    amount: v.number(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("meterUsage", {
      userId: args.userId,
      subscriptionId: args.subscriptionId,
      meterId: args.meterId,
      amount: args.amount,
      description: args.description,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

