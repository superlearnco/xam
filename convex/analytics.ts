import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Track an analytics event
 */
export const trackEvent = mutation({
  args: {
    eventType: v.string(),
    userId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("analyticsEvents", {
      eventType: args.eventType,
      userId: args.userId,
      projectId: args.projectId,
      metadata: args.metadata || {},
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get analytics events for a user
 */
export const getUserEvents = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return events;
  },
});

/**
 * Get analytics events for a project
 */
export const getProjectEvents = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(limit);

    return events;
  },
});

/**
 * Get events by type
 */
export const getEventsByType = query({
  args: {
    eventType: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_eventType", (q) => q.eq("eventType", args.eventType))
      .order("desc")
      .take(limit);

    return events;
  },
});

/**
 * Get overall analytics dashboard data
 */
export const getDashboardStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startDate = args.startDate || Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days ago
    const endDate = args.endDate || Date.now();

    // Get all users
    const totalUsers = await ctx.db.query("users").collect();
    const activeUsers = totalUsers.filter(
      (u) => u.lastLoginAt && u.lastLoginAt >= startDate
    );

    // Get all projects
    const totalProjects = await ctx.db.query("projects").collect();
    const publishedProjects = totalProjects.filter(
      (p) => p.status === "published"
    );

    // Get all submissions
    const totalSubmissions = await ctx.db.query("submissions").collect();
    const recentSubmissions = totalSubmissions.filter(
      (s) => s.createdAt >= startDate && s.createdAt <= endDate
    );

    // Get AI usage stats
    const aiGenerations = await ctx.db
      .query("aiGenerations")
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.lte(q.field("createdAt"), endDate)
        )
      )
      .collect();

    const totalCreditsUsed = aiGenerations.reduce(
      (sum, gen) => sum + gen.creditsDeducted,
      0
    );

    const aiUsageByType = aiGenerations.reduce(
      (acc, gen) => {
        acc[gen.type] = (acc[gen.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get billing stats
    const transactions = await ctx.db
      .query("billingTransactions")
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.lte(q.field("createdAt"), endDate)
        )
      )
      .collect();

    const totalRevenue = transactions
      .filter((t) => t.status === "succeeded" && t.type === "credit_purchase")
      .reduce((sum, t) => sum + t.amount, 0);

    const creditsPurchased = transactions
      .filter((t) => t.creditsAdded && t.creditsAdded > 0)
      .reduce((sum, t) => sum + (t.creditsAdded || 0), 0);

    return {
      users: {
        total: totalUsers.length,
        active: activeUsers.length,
        new: totalUsers.filter(
          (u) => u.createdAt >= startDate && u.createdAt <= endDate
        ).length,
      },
      projects: {
        total: totalProjects.length,
        published: publishedProjects.length,
        draft: totalProjects.filter((p) => p.status === "draft").length,
        archived: totalProjects.filter((p) => p.status === "archived").length,
      },
      submissions: {
        total: totalSubmissions.length,
        recent: recentSubmissions.length,
        graded: recentSubmissions.filter((s) => s.status === "graded").length,
        pending: recentSubmissions.filter((s) => s.status === "submitted")
          .length,
      },
      ai: {
        totalGenerations: aiGenerations.length,
        totalCreditsUsed,
        usageByType: aiUsageByType,
        averageCreditsPerGeneration:
          aiGenerations.length > 0
            ? totalCreditsUsed / aiGenerations.length
            : 0,
      },
      billing: {
        totalRevenue,
        creditsPurchased,
        transactionCount: transactions.filter((t) => t.status === "succeeded")
          .length,
      },
    };
  },
});

/**
 * Get user growth data (daily)
 */
export const getUserGrowth = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    const users = await ctx.db.query("users").collect();

    // Group users by day
    const growthData: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      growthData[dateStr] = 0;
    }

    users.forEach((user) => {
      const date = new Date(user.createdAt);
      const dateStr = date.toISOString().split("T")[0];
      if (growthData[dateStr] !== undefined) {
        growthData[dateStr]++;
      }
    });

    return Object.entries(growthData).map(([date, count]) => ({
      date,
      count,
    }));
  },
});

/**
 * Get project creation trends
 */
export const getProjectTrends = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();

    // Group projects by day
    const trendsData: Record<string, { total: number; published: number }> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      trendsData[dateStr] = { total: 0, published: 0 };
    }

    projects.forEach((project) => {
      const date = new Date(project.createdAt);
      const dateStr = date.toISOString().split("T")[0];
      if (trendsData[dateStr]) {
        trendsData[dateStr].total++;
        if (project.status === "published") {
          trendsData[dateStr].published++;
        }
      }
    });

    return Object.entries(trendsData).map(([date, data]) => ({
      date,
      ...data,
    }));
  },
});

/**
 * Get submission trends
 */
export const getSubmissionTrends = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    const submissions = await ctx.db
      .query("submissions")
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();

    // Group submissions by day
    const trendsData: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      trendsData[dateStr] = 0;
    }

    submissions.forEach((submission) => {
      const date = new Date(submission.createdAt);
      const dateStr = date.toISOString().split("T")[0];
      if (trendsData[dateStr] !== undefined) {
        trendsData[dateStr]++;
      }
    });

    return Object.entries(trendsData).map(([date, count]) => ({
      date,
      count,
    }));
  },
});

/**
 * Get AI credit usage trends
 */
export const getCreditUsageTrends = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    const aiGenerations = await ctx.db
      .query("aiGenerations")
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();

    // Group by day
    const trendsData: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      trendsData[dateStr] = 0;
    }

    aiGenerations.forEach((gen) => {
      const date = new Date(gen.createdAt);
      const dateStr = date.toISOString().split("T")[0];
      if (trendsData[dateStr] !== undefined) {
        trendsData[dateStr] += gen.creditsDeducted;
      }
    });

    return Object.entries(trendsData).map(([date, credits]) => ({
      date,
      credits,
    }));
  },
});

/**
 * Get revenue trends
 */
export const getRevenueTrends = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    const transactions = await ctx.db
      .query("billingTransactions")
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.eq(q.field("status"), "succeeded"),
          q.eq(q.field("type"), "credit_purchase")
        )
      )
      .collect();

    // Group by day
    const trendsData: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      trendsData[dateStr] = 0;
    }

    transactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt);
      const dateStr = date.toISOString().split("T")[0];
      if (trendsData[dateStr] !== undefined) {
        trendsData[dateStr] += transaction.amount;
      }
    });

    return Object.entries(trendsData).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  },
});

/**
 * Get most active users
 */
export const getMostActiveUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const users = await ctx.db.query("users").collect();

    // Get project counts for each user
    const userActivity = await Promise.all(
      users.map(async (user) => {
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .collect();

        const submissions = await ctx.db
          .query("submissions")
          .filter((q) =>
            q.eq(
              q.field("projectId"),
              projects.map((p) => p._id)[0]
            )
          )
          .collect();

        const aiGenerations = await ctx.db
          .query("aiGenerations")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .collect();

        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          projectCount: projects.length,
          submissionCount: submissions.length,
          aiGenerationCount: aiGenerations.length,
          creditsUsed: aiGenerations.reduce(
            (sum, gen) => sum + gen.creditsDeducted,
            0
          ),
          lastActive: user.lastLoginAt || user.createdAt,
        };
      })
    );

    // Sort by activity (projects + submissions + AI generations)
    return userActivity
      .sort(
        (a, b) =>
          b.projectCount +
          b.submissionCount +
          b.aiGenerationCount -
          (a.projectCount + a.submissionCount + a.aiGenerationCount)
      )
      .slice(0, limit);
  },
});

/**
 * Get feature usage statistics
 */
export const getFeatureUsage = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", startDate))
      .collect();

    // Count events by type
    const eventCounts: Record<string, number> = {};
    events.forEach((event) => {
      eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
    });

    // Get AI feature usage
    const aiGenerations = await ctx.db
      .query("aiGenerations")
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();

    const aiFeatureUsage: Record<string, number> = {};
    aiGenerations.forEach((gen) => {
      aiFeatureUsage[gen.type] = (aiFeatureUsage[gen.type] || 0) + 1;
    });

    return {
      events: eventCounts,
      aiFeatures: aiFeatureUsage,
      totalEvents: events.length,
      totalAIGenerations: aiGenerations.length,
    };
  },
});

/**
 * Get error rates and issues
 */
export const getErrorStats = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    const aiGenerations = await ctx.db
      .query("aiGenerations")
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();

    const totalGenerations = aiGenerations.length;
    const failedGenerations = aiGenerations.filter((g) => !g.success).length;

    const errorsByType: Record<string, number> = {};
    aiGenerations
      .filter((g) => !g.success && g.error)
      .forEach((gen) => {
        const errorType = gen.error || "unknown";
        errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
      });

    return {
      totalGenerations,
      failedGenerations,
      successRate:
        totalGenerations > 0
          ? ((totalGenerations - failedGenerations) / totalGenerations) * 100
          : 100,
      errorsByType,
    };
  },
});

/**
 * Get conversion funnel data
 */
export const getConversionFunnel = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    const recentUsers = await ctx.db
      .query("users")
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();

    const usersWithProjects = await Promise.all(
      recentUsers.map(async (user) => {
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .collect();
        return { user, projectCount: projects.length };
      })
    );

    const usersWithPublishedProjects = await Promise.all(
      recentUsers.map(async (user) => {
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .filter((q) => q.eq(q.field("status"), "published"))
          .collect();
        return { user, projectCount: projects.length };
      })
    );

    const usersWithAI = await Promise.all(
      recentUsers.map(async (user) => {
        const generations = await ctx.db
          .query("aiGenerations")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .collect();
        return { user, generationCount: generations.length };
      })
    );

    const totalSignups = recentUsers.length;
    const usersCreatedProject = usersWithProjects.filter(
      (u) => u.projectCount > 0
    ).length;
    const usersPublishedProject = usersWithPublishedProjects.filter(
      (u) => u.projectCount > 0
    ).length;
    const usersUsedAI = usersWithAI.filter((u) => u.generationCount > 0).length;

    return {
      signups: totalSignups,
      createdProject: usersCreatedProject,
      publishedProject: usersPublishedProject,
      usedAI: usersUsedAI,
      conversionRates: {
        signupToProject:
          totalSignups > 0 ? (usersCreatedProject / totalSignups) * 100 : 0,
        projectToPublish:
          usersCreatedProject > 0
            ? (usersPublishedProject / usersCreatedProject) * 100
            : 0,
        signupToAI: totalSignups > 0 ? (usersUsedAI / totalSignups) * 100 : 0,
      },
    };
  },
});
