import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Create or update Polar customer when user signs up
 */
export const createCustomer = mutation({
  args: {
    userId: v.id("users"),
    polarCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      polarCustomerId: args.polarCustomerId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get user's current credit balance
 */
export const getCreditBalance = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    return {
      personalCredits: user.credits,
      organizationCredits: 0,
      totalCredits: user.credits,
      polarCustomerId: user.polarCustomerId,
    };
  },
});

/**
 * Handle credit purchase from Polar webhooks
 */
export const addCredits = mutation({
  args: {
    userId: v.id("users"),
    credits: v.number(),
    reason: v.string(),
    transactionId: v.optional(v.string()),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const newBalance = user.credits + args.credits;

    await ctx.db.patch(args.userId, {
      credits: newBalance,
      updatedAt: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("billingTransactions", {
      userId: args.userId,
      type: "credit_purchase",
      amount: args.amount || 0,
      currency: "USD",
      provider: "polar",
      providerTransactionId: args.transactionId,
      status: "succeeded",
      description: args.reason,
      creditsAdded: args.credits,
      metadata: { reason: args.reason },
      createdAt: Date.now(),
    });

    return { success: true, newBalance };
  },
});

/**
 * Deduct credits when AI features are used
 */
export const deductCredits = mutation({
  args: {
    userId: v.id("users"),
    credits: v.number(),
    reason: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.credits < args.credits) {
      throw new Error(
        `Insufficient credits. Required: ${args.credits}, Available: ${user.credits}`,
      );
    }

    const newBalance = user.credits - args.credits;

    await ctx.db.patch(args.userId, {
      credits: newBalance,
      updatedAt: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("billingTransactions", {
      userId: args.userId,
      type: "credit_usage",
      amount: 0,
      currency: "USD",
      provider: "polar",
      status: "succeeded",
      description: args.reason,
      creditsAdded: -args.credits,
      metadata: args.metadata || { reason: args.reason },
      createdAt: Date.now(),
    });

    return { success: true, remainingCredits: newBalance };
  },
});

/**
 * Check if user has sufficient credits
 */
export const hasSufficientCredits = query({
  args: {
    userId: v.id("users"),
    creditsRequired: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return false;
    }

    return user.credits >= args.creditsRequired;
  },
});

/**
 * Get billing history for a user
 */
export const getBillingHistory = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("billingTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);

    return transactions;
  },
});

/**
 * Get user's credit usage statistics
 */
export const getCreditUsageStats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    // Get all AI generation history for this user
    const aiHistory = await ctx.db
      .query("aiGenerations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const totalCreditsUsed = aiHistory.reduce(
      (sum, item) => sum + item.creditsDeducted,
      0,
    );

    // Get credit transactions
    const creditTransactions = await ctx.db
      .query("billingTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("creditsAdded"), undefined))
      .collect();

    const totalCreditsPurchased = creditTransactions
      .filter((t) => (t.creditsAdded || 0) > 0)
      .reduce((sum, t) => sum + (t.creditsAdded || 0), 0);

    const totalCreditsDeducted = creditTransactions
      .filter((t) => (t.creditsAdded || 0) < 0)
      .reduce((sum, t) => sum + Math.abs(t.creditsAdded || 0), 0);

    return {
      currentBalance: user.credits,
      totalUsed: totalCreditsUsed,
      totalPurchased: totalCreditsPurchased,
      totalDeducted: totalCreditsDeducted,
      usageByType: aiHistory.reduce(
        (acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + item.creditsDeducted;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  },
});

/**
 * Grant welcome bonus credits to new user
 * NOTE: Free plan users do not receive AI credits. They must purchase credits to use AI features.
 */
export const grantWelcomeBonus = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Free plan users do not receive AI credits
    // They start with 0 credits and must purchase to use AI features
    return {
      success: true,
      creditsGranted: 0,
      newBalance: user.credits,
      message: "Welcome! Purchase credits to unlock AI features."
    };
  },
});
</parameter>

/**
 * Get credit balance for current user
 */
export const getMyCredits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject as string),
      )
      .first();

    if (!user) {
      return null;
    }

    return {
      credits: user.credits,
      polarCustomerId: user.polarCustomerId,
    };
  },
});
