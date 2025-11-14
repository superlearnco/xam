import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

// List submissions for a project
export const list = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(
      v.union(
        v.literal("in_progress"),
        v.literal("submitted"),
        v.literal("marked"),
        v.literal("returned")
      )
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

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user has access
    const hasAccess =
      project.userId === user._id ||
      (user.organizationId && project.organizationId === user.organizationId);

    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    let submissions;
    if (args.status !== undefined) {
      submissions = await ctx.db
        .query("submissions")
        .withIndex("by_project_status", (q) =>
          q.eq("projectId", args.projectId).eq("status", args.status!)
        )
        .collect();
    } else {
      submissions = await ctx.db
        .query("submissions")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect();
    }

    return submissions.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get a single submission
export const get = query({
  args: {
    submissionId: v.id("submissions"),
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

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    const project = await ctx.db.get(submission.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user has access (owner or respondent)
    const hasAccess =
      project.userId === user._id ||
      (user.organizationId && project.organizationId === user.organizationId) ||
      submission.respondentUserId === user._id;

    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    return submission;
  },
});

// Create a new submission
export const create = mutation({
  args: {
    projectId: v.id("projects"),
    respondentName: v.optional(v.string()),
    respondentEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    let respondentUserId: Doc<"users">["_id"] | undefined;

    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) =>
          q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .unique();

      if (user) {
        respondentUserId = user._id;
      }
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.status !== "published") {
      throw new Error("Project is not published");
    }

    const now = Date.now();
    const submissionId = await ctx.db.insert("submissions", {
      projectId: args.projectId,
      respondentName: args.respondentName,
      respondentEmail: args.respondentEmail,
      respondentUserId,
      status: "in_progress",
      aiMarked: false,
      createdAt: now,
      updatedAt: now,
    });

    return submissionId;
  },
});

// Update marks for a submission
export const updateMarks = mutation({
  args: {
    submissionId: v.id("submissions"),
    earnedMarks: v.number(),
    totalMarks: v.number(),
    grade: v.optional(v.string()),
    status: v.optional(v.union(v.literal("marked"), v.literal("returned"))),
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

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    const project = await ctx.db.get(submission.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user has access
    const hasAccess =
      project.userId === user._id ||
      (user.organizationId && project.organizationId === user.organizationId);

    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    const percentage =
      args.totalMarks > 0 ? (args.earnedMarks / args.totalMarks) * 100 : 0;

    await ctx.db.patch(args.submissionId, {
      earnedMarks: args.earnedMarks,
      totalMarks: args.totalMarks,
      percentage,
      grade: args.grade,
      status: args.status || "marked",
      markedBy: user._id,
      markedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.submissionId;
  },
});

// Get statistics for a project
export const getStatistics = query({
  args: {
    projectId: v.id("projects"),
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

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user has access
    const hasAccess =
      project.userId === user._id ||
      (user.organizationId && project.organizationId === user.organizationId);

    if (!hasAccess) {
      throw new Error("Unauthorized");
    }

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const total = submissions.length;
    const submitted = submissions.filter(
      (s) =>
        s.status === "submitted" ||
        s.status === "marked" ||
        s.status === "returned"
    ).length;
    const marked = submissions.filter(
      (s) => s.status === "marked" || s.status === "returned"
    ).length;
    const inProgress = submissions.filter(
      (s) => s.status === "in_progress"
    ).length;

    const markedSubmissions = submissions.filter(
      (s) => s.percentage !== undefined
    );
    const averageScore =
      markedSubmissions.length > 0
        ? markedSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0) /
          markedSubmissions.length
        : 0;

    // Calculate grade distribution
    const gradeDistribution: Record<string, number> = {};
    markedSubmissions.forEach((s) => {
      if (s.grade) {
        gradeDistribution[s.grade] = (gradeDistribution[s.grade] || 0) + 1;
      }
    });

    return {
      total,
      submitted,
      marked,
      inProgress,
      averageScore,
      gradeDistribution,
    };
  },
});

// Submit a submission (change status from in_progress to submitted)
export const submit = mutation({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    if (submission.status !== "in_progress") {
      throw new Error("Submission already submitted");
    }

    await ctx.db.patch(args.submissionId, {
      status: "submitted",
      submittedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.submissionId;
  },
});
