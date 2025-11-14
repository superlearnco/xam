import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Track AI usage
export const trackUsage = mutation({
  args: {
    feature: v.union(
      v.literal("generate_test"),
      v.literal("generate_options"),
      v.literal("grade_response"),
      v.literal("bulk_grade"),
      v.literal("suggest_feedback")
    ),
    model: v.string(),
    tokensInput: v.number(),
    tokensOutput: v.number(),
    cost: v.number(),
    projectId: v.optional(v.id("projects")),
    submissionId: v.optional(v.id("submissions")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();

    const usageId = await ctx.db.insert("aiUsage", {
      userId: user._id,
      organizationId: user.organizationId,
      feature: args.feature,
      model: args.model,
      tokensInput: args.tokensInput,
      tokensOutput: args.tokensOutput,
      cost: args.cost,
      projectId: args.projectId,
      submissionId: args.submissionId,
      timestamp: now,
    });

    return usageId;
  },
});

// Get usage statistics
export const getUsageStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get all usage records for user or organization
    let allUsage;
    if (user.organizationId) {
      allUsage = await ctx.db
        .query("aiUsage")
        .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
        .collect();
    } else {
      allUsage = await ctx.db
        .query("aiUsage")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
    }

    // Filter by date range if provided
    const startDate = args.startDate || 0;
    const endDate = args.endDate || Date.now();

    const filteredUsage = allUsage.filter(
      (usage) => usage.timestamp >= startDate && usage.timestamp <= endDate
    );

    // Calculate statistics
    const totalCost = filteredUsage.reduce((sum, usage) => sum + usage.cost, 0);
    const totalInputTokens = filteredUsage.reduce((sum, usage) => sum + usage.tokensInput, 0);
    const totalOutputTokens = filteredUsage.reduce((sum, usage) => sum + usage.tokensOutput, 0);

    // Group by feature
    const byFeature: Record<string, { count: number; cost: number; tokens: number }> = {};
    filteredUsage.forEach((usage) => {
      if (!byFeature[usage.feature]) {
        byFeature[usage.feature] = { count: 0, cost: 0, tokens: 0 };
      }
      byFeature[usage.feature].count++;
      byFeature[usage.feature].cost += usage.cost;
      byFeature[usage.feature].tokens += usage.tokensInput + usage.tokensOutput;
    });

    // Group by model
    const byModel: Record<string, { count: number; cost: number; tokens: number }> = {};
    filteredUsage.forEach((usage) => {
      if (!byModel[usage.model]) {
        byModel[usage.model] = { count: 0, cost: 0, tokens: 0 };
      }
      byModel[usage.model].count++;
      byModel[usage.model].cost += usage.cost;
      byModel[usage.model].tokens += usage.tokensInput + usage.tokensOutput;
    });

    // Group by day for time series
    const byDay: Record<string, { cost: number; tokens: number; count: number }> = {};
    filteredUsage.forEach((usage) => {
      const date = new Date(usage.timestamp);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      if (!byDay[dayKey]) {
        byDay[dayKey] = { cost: 0, tokens: 0, count: 0 };
      }
      byDay[dayKey].cost += usage.cost;
      byDay[dayKey].tokens += usage.tokensInput + usage.tokensOutput;
      byDay[dayKey].count++;
    });

    return {
      totalCost,
      totalInputTokens,
      totalOutputTokens,
      totalRequests: filteredUsage.length,
      byFeature,
      byModel,
      byDay,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  },
});

// Get recent usage
export const getRecentUsage = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const limit = args.limit || 20;

    // Get recent usage for user or organization
    let usage;
    if (user.organizationId) {
      usage = await ctx.db
        .query("aiUsage")
        .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
        .order("desc")
        .take(limit);
    } else {
      usage = await ctx.db
        .query("aiUsage")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .take(limit);
    }

    return usage.sort((a, b) => b.timestamp - a.timestamp);
  },
});
