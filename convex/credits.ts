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
    aiModel: v.optional(v.string()),
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
      aiModel: args.aiModel,
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


// Use credits
export const useCredits = action({
  args: {
    amount: v.number(),
    description: v.optional(v.string()),
    meterId: v.optional(v.string()),
    reportToPolar: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    remainingCredits?: number;
    billingType: string;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user has enough credits
    const creditCheck = await ctx.runQuery(api.credits.checkCredits, {
      amount: args.amount,
    });

    if (!creditCheck.hasEnough) {
      throw new Error(
        `Insufficient credits. You have ${creditCheck.credits} credits, but need ${args.amount}.`
      );
    }

    // Optionally report to Polar Meter if configured (for tracking purposes)
    if (args.reportToPolar && args.meterId && process.env.POLAR_ACCESS_TOKEN) {
      try {
        const polar = new Polar({
          server:
            (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
          accessToken: process.env.POLAR_ACCESS_TOKEN,
        });

        // Find customer ID from subscriptions
        const subscription = await ctx.runQuery(
          api.subscriptions.fetchUserSubscription
        );

        if (subscription?.customerId) {
          // Log usage for tracking
          console.log(
            `Tracking meter usage: ${args.meterId}, amount: ${args.amount}, customer: ${subscription.customerId}`
          );
        }
      } catch (error) {
        console.error("Error reporting to Polar Meter (non-fatal):", error);
        // Don't throw - we still want to deduct credits even if Polar reporting fails
      }
    }

    // Deduct credits from user account
    const result: { credits: number } = await ctx.runMutation(
      api.credits.deductCredits,
      {
        userId: identity.subject,
        amount: args.amount,
        description:
          args.description ||
          `Credits used${args.meterId ? ` (meter: ${args.meterId})` : ""}`,
        meterId: args.meterId,
      }
    );

    return {
      success: true,
      remainingCredits: result.credits,
      billingType: "credits",
    };
  },
});


// Debug queries
export const debugWebhookEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("webhookEvents")
      .order("desc")
      .take(args.limit || 10);
    return events;
  },
});

export const debugCreditTransactions = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity && !args.userId) {
      throw new Error("Not authenticated");
    }

    const userId = args.userId || identity!.subject;
    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit || 20);
    return transactions;
  },
});

export const debugOrderWebhooks = query({
  handler: async (ctx) => {
    const orderEvents = await ctx.db
      .query("webhookEvents")
      .withIndex("type", (q) => q.eq("type", "order.created"))
      .order("desc")
      .take(10);
    return orderEvents;
  },
});

export const debugUserCredits = query({
  args: {
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.email) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
      return user;
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();
    return user;
  },
});
