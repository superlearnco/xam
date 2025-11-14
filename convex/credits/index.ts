import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

// Token costs per 1000 tokens (in cents)
const TOKEN_COSTS = {
  INPUT_PER_1K: 0.3, // $0.003 per 1K input tokens
  OUTPUT_PER_1K: 1.5, // $0.015 per 1K output tokens
};

// Get credits for current user or organization
export const getCredits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has an organization
    if (user.organizationId) {
      const orgCredits = await ctx.db
        .query("aiCredits")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId)
        )
        .unique();

      if (orgCredits) {
        return orgCredits;
      }
    }

    // Get user's personal credits
    let userCredits = await ctx.db
      .query("aiCredits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    // Initialize credits if they don't exist (return null if not exists in query)
    if (!userCredits) {
      return {
        _id: "" as any,
        _creationTime: Date.now(),
        userId: user._id,
        balance: 0,
        plan: "free" as const,
        periodUsage: 0,
        lastUpdated: Date.now(),
      };
    }

    return userCredits;
  },
});

// Purchase credits
export const purchaseCredits = mutation({
  args: {
    amount: v.number(),
    transactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();

    // Determine if we're updating user or organization credits
    if (user.organizationId) {
      const orgCredits = await ctx.db
        .query("aiCredits")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId)
        )
        .unique();

      if (orgCredits) {
        await ctx.db.patch(orgCredits._id, {
          balance: orgCredits.balance + args.amount,
          lastUpdated: now,
        });
        return orgCredits._id;
      }
    }

    // Update user's personal credits
    let userCredits = await ctx.db
      .query("aiCredits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!userCredits) {
      const creditId = await ctx.db.insert("aiCredits", {
        userId: user._id,
        balance: args.amount,
        plan: "pay_as_you_go",
        periodUsage: 0,
        lastUpdated: now,
      });
      return creditId;
    }

    await ctx.db.patch(userCredits._id, {
      balance: userCredits.balance + args.amount,
      plan: "pay_as_you_go",
      lastUpdated: now,
    });

    return userCredits._id;
  },
});

// Deduct credits for AI usage
export const deductCredits = mutation({
  args: {
    cost: v.number(),
    feature: v.union(
      v.literal("generate_test"),
      v.literal("generate_options"),
      v.literal("grade_response"),
      v.literal("bulk_grade"),
      v.literal("suggest_feedback")
    ),
    metadata: v.optional(
      v.object({
        projectId: v.optional(v.id("projects")),
        submissionId: v.optional(v.id("submissions")),
        model: v.optional(v.string()),
        tokensInput: v.optional(v.number()),
        tokensOutput: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();

    // Determine if we're using user or organization credits
    if (user.organizationId) {
      const orgCredits = await ctx.db
        .query("aiCredits")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId)
        )
        .unique();

      if (orgCredits) {
        if (orgCredits.balance < args.cost) {
          throw new Error("Insufficient credits");
        }

        await ctx.db.patch(orgCredits._id, {
          balance: orgCredits.balance - args.cost,
          periodUsage: orgCredits.periodUsage + args.cost,
          lastUpdated: now,
        });

        // Track usage
        await ctx.db.insert("aiUsage", {
          userId: user._id,
          organizationId: user.organizationId,
          feature: args.feature,
          model: args.metadata?.model || "grok-beta",
          tokensInput: args.metadata?.tokensInput || 0,
          tokensOutput: args.metadata?.tokensOutput || 0,
          cost: args.cost,
          projectId: args.metadata?.projectId,
          submissionId: args.metadata?.submissionId,
          timestamp: now,
        });

        return {
          success: true,
          remainingBalance: orgCredits.balance - args.cost,
        };
      }
    }

    // Use user's personal credits
    let userCredits = await ctx.db
      .query("aiCredits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!userCredits) {
      throw new Error("No credits available");
    }

    if (userCredits.balance < args.cost) {
      throw new Error("Insufficient credits");
    }

    await ctx.db.patch(userCredits._id, {
      balance: userCredits.balance - args.cost,
      periodUsage: userCredits.periodUsage + args.cost,
      lastUpdated: now,
    });

    // Track usage
    await ctx.db.insert("aiUsage", {
      userId: user._id,
      organizationId: user.organizationId,
      feature: args.feature,
      model: args.metadata?.model || "grok-beta",
      tokensInput: args.metadata?.tokensInput || 0,
      tokensOutput: args.metadata?.tokensOutput || 0,
      cost: args.cost,
      projectId: args.metadata?.projectId,
      submissionId: args.metadata?.submissionId,
      timestamp: now,
    });

    return { success: true, remainingBalance: userCredits.balance - args.cost };
  },
});

// Get usage history
export const getUsageHistory = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const limit = args.limit || 50;
    const offset = args.offset || 0;

    // Get usage for user or organization
    let usage;
    if (user.organizationId) {
      usage = await ctx.db
        .query("aiUsage")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId)
        )
        .order("desc")
        .take(limit + offset);
    } else {
      usage = await ctx.db
        .query("aiUsage")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .take(limit + offset);
    }

    return usage.slice(offset).sort((a, b) => b.timestamp - a.timestamp);
  },
});

// Calculate cost based on token usage
export const calculateCost = query({
  args: {
    tokensInput: v.number(),
    tokensOutput: v.number(),
  },
  handler: async (ctx, args) => {
    const inputCost = (args.tokensInput / 1000) * TOKEN_COSTS.INPUT_PER_1K;
    const outputCost = (args.tokensOutput / 1000) * TOKEN_COSTS.OUTPUT_PER_1K;
    const totalCost = inputCost + outputCost;

    return {
      inputCost,
      outputCost,
      totalCost,
      tokensInput: args.tokensInput,
      tokensOutput: args.tokensOutput,
    };
  },
});

// Check if user has sufficient credits
export const checkSufficient = query({
  args: {
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check organization credits first
    if (user.organizationId) {
      const orgCredits = await ctx.db
        .query("aiCredits")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId)
        )
        .unique();

      if (orgCredits) {
        return {
          sufficient: orgCredits.balance >= args.amount,
          balance: orgCredits.balance,
          required: args.amount,
        };
      }
    }

    // Check user's personal credits
    const userCredits = await ctx.db
      .query("aiCredits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!userCredits) {
      return {
        sufficient: false,
        balance: 0,
        required: args.amount,
      };
    }

    return {
      sufficient: userCredits.balance >= args.amount,
      balance: userCredits.balance,
      required: args.amount,
    };
  },
});
