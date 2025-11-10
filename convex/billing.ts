import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Create or update customer when user signs up
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
 * Get user's current subscription and benefits
 */
export const getSubscription = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    return {
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      credits: user.credits,
      polarCustomerId: user.polarCustomerId,
      polarSubscriptionId: user.polarSubscriptionId,
      benefits: user.benefits || [],
    };
  },
});

/**
 * Handle subscription changes from Polar webhooks
 */
export const handleSubscriptionChange = mutation({
  args: {
    userId: v.id("users"),
    subscriptionId: v.string(),
    polarCustomerId: v.string(),
    status: v.string(),
    planName: v.string(),
    creditsToGrant: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Map plan name to tier
    let tier: "free" | "starter" | "pro" | "enterprise" = "free";
    if (args.planName === "starter") {
      tier = "starter";
    } else if (args.planName === "pro") {
      tier = "pro";
    } else if (args.planName === "enterprise") {
      tier = "enterprise";
    }

    // If upgrading and granting credits, add them
    // If downgrading or canceling, don't remove existing credits
    let newCredits = user.credits;
    if (args.creditsToGrant > 0 && args.status === "active") {
      newCredits += args.creditsToGrant;
    }

    await ctx.db.patch(args.userId, {
      subscriptionTier: tier,
      subscriptionStatus: args.status,
      polarCustomerId: args.polarCustomerId,
      polarSubscriptionId: args.subscriptionId,
      credits: newCredits,
      updatedAt: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("billingTransactions", {
      userId: args.userId,
      type: "subscription",
      amount: 0,
      currency: "USD",
      provider: "polar",
      providerTransactionId: args.subscriptionId,
      status: "succeeded",
      description: `Subscription ${args.status}: ${args.planName}`,
      creditsAdded: args.creditsToGrant,
      metadata: {
        planName: args.planName,
        subscriptionId: args.subscriptionId,
      },
      createdAt: Date.now(),
    });

    return { success: true };
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
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.credits < args.credits) {
      throw new Error("Insufficient credits");
    }

    await ctx.db.patch(args.userId, {
      credits: user.credits - args.credits,
      updatedAt: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("billingTransactions", {
      userId: args.userId,
      type: "credit_purchase",
      amount: 0,
      currency: "USD",
      provider: "polar",
      status: "succeeded",
      description: args.reason,
      creditsAdded: -args.credits,
      metadata: { reason: args.reason },
      createdAt: Date.now(),
    });

    return { success: true, remainingCredits: user.credits - args.credits };
  },
});

/**
 * Add credits when purchased or granted
 */
export const addCredits = mutation({
  args: {
    userId: v.id("users"),
    credits: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      credits: user.credits + args.credits,
      updatedAt: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("billingTransactions", {
      userId: args.userId,
      type: "credit_purchase",
      amount: 0,
      currency: "USD",
      provider: "polar",
      status: "succeeded",
      description: args.reason,
      creditsAdded: args.credits,
      metadata: { reason: args.reason },
      createdAt: Date.now(),
    });

    return { success: true, newBalance: user.credits + args.credits };
  },
});

/**
 * Check if user has access to a specific feature/benefit
 */
export const checkFeatureAccess = query({
  args: {
    userId: v.id("users"),
    feature: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return false;
    }

    // Check if user has the benefit
    const benefits = user.benefits || [];
    if (benefits.includes(args.feature)) {
      return true;
    }

    // Check tier-based access
    const tierAccess: Record<string, string[]> = {
      free: [],
      starter: ["ai_generation"],
      pro: ["ai_generation", "ai_grading", "advanced_analytics"],
      enterprise: [
        "ai_generation",
        "ai_grading",
        "advanced_analytics",
        "custom_branding",
        "team_collaboration",
        "priority_support",
        "api_access",
      ],
    };

    const userTierFeatures = tierAccess[user.subscriptionTier] || [];
    return userTierFeatures.includes(args.feature);
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
 * Grant a benefit to a user
 */
export const grantBenefit = mutation({
  args: {
    userId: v.id("users"),
    benefitId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const currentBenefits = user.benefits || [];
    if (!currentBenefits.includes(args.benefitId)) {
      await ctx.db.patch(args.userId, {
        benefits: [...currentBenefits, args.benefitId],
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Revoke a benefit from a user
 */
export const revokeBenefit = mutation({
  args: {
    userId: v.id("users"),
    benefitId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const currentBenefits = user.benefits || [];
    const newBenefits = currentBenefits.filter((b) => b !== args.benefitId);

    await ctx.db.patch(args.userId, {
      benefits: newBenefits,
      updatedAt: Date.now(),
    });

    return { success: true };
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

    return {
      currentBalance: user.credits,
      totalUsed: totalCreditsUsed,
      totalPurchased: totalCreditsPurchased,
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
