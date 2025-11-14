import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

// Create a new response
export const create = mutation({
  args: {
    submissionId: v.id("submissions"),
    fieldId: v.id("fields"),
    value: v.optional(
      v.union(
        v.string(),
        v.array(v.string()),
        v.number(),
        v.boolean(),
        v.null()
      )
    ),
    fileUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    const field = await ctx.db.get(args.fieldId);
    if (!field) {
      throw new Error("Field not found");
    }

    // Check if response already exists
    const existingResponse = await ctx.db
      .query("responses")
      .withIndex("by_submission", (q) =>
        q.eq("submissionId", args.submissionId)
      )
      .filter((q) => q.eq(q.field("fieldId"), args.fieldId))
      .unique();

    const now = Date.now();

    if (existingResponse) {
      // Update existing response
      await ctx.db.patch(existingResponse._id, {
        value: args.value,
        fileUrl: args.fileUrl,
      });
      return existingResponse._id;
    }

    // Create new response
    const responseId = await ctx.db.insert("responses", {
      submissionId: args.submissionId,
      fieldId: args.fieldId,
      projectId: submission.projectId,
      value: args.value,
      fileUrl: args.fileUrl,
      createdAt: now,
    });

    // Update submission's updatedAt
    await ctx.db.patch(args.submissionId, {
      updatedAt: now,
    });

    return responseId;
  },
});

// Update a response
export const update = mutation({
  args: {
    responseId: v.id("responses"),
    value: v.optional(
      v.union(
        v.string(),
        v.array(v.string()),
        v.number(),
        v.boolean(),
        v.null()
      )
    ),
    fileUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const response = await ctx.db.get(args.responseId);
    if (!response) {
      throw new Error("Response not found");
    }

    const updateData: Partial<Doc<"responses">> = {};

    if (args.value !== undefined) updateData.value = args.value;
    if (args.fileUrl !== undefined) updateData.fileUrl = args.fileUrl;

    await ctx.db.patch(args.responseId, updateData);

    // Update submission's updatedAt
    await ctx.db.patch(response.submissionId, {
      updatedAt: Date.now(),
    });

    return args.responseId;
  },
});

// Mark a response
export const mark = mutation({
  args: {
    responseId: v.id("responses"),
    marksAwarded: v.number(),
    maxMarks: v.number(),
    feedback: v.optional(v.string()),
    isCorrect: v.optional(v.boolean()),
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

    const response = await ctx.db.get(args.responseId);
    if (!response) {
      throw new Error("Response not found");
    }

    const submission = await ctx.db.get(response.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    const project = await ctx.db.get(response.projectId);
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

    await ctx.db.patch(args.responseId, {
      marksAwarded: args.marksAwarded,
      maxMarks: args.maxMarks,
      feedback: args.feedback,
      isCorrect: args.isCorrect,
      markedAt: Date.now(),
    });

    // Update submission's updatedAt
    await ctx.db.patch(response.submissionId, {
      updatedAt: Date.now(),
    });

    return args.responseId;
  },
});

// Bulk mark responses
export const bulkMark = mutation({
  args: {
    marks: v.array(
      v.object({
        responseId: v.id("responses"),
        marksAwarded: v.number(),
        maxMarks: v.number(),
        feedback: v.optional(v.string()),
        isCorrect: v.optional(v.boolean()),
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
    const updatedSubmissionIds = new Set<string>();

    for (const mark of args.marks) {
      const response = await ctx.db.get(mark.responseId);
      if (!response) {
        continue;
      }

      const project = await ctx.db.get(response.projectId);
      if (!project) {
        continue;
      }

      // Check if user has access
      const hasAccess =
        project.userId === user._id ||
        (user.organizationId && project.organizationId === user.organizationId);

      if (!hasAccess) {
        continue;
      }

      await ctx.db.patch(mark.responseId, {
        marksAwarded: mark.marksAwarded,
        maxMarks: mark.maxMarks,
        feedback: mark.feedback,
        isCorrect: mark.isCorrect,
        markedAt: now,
      });

      updatedSubmissionIds.add(response.submissionId);
    }

    // Update all affected submissions
    for (const submissionId of updatedSubmissionIds) {
      await ctx.db.patch(submissionId as Doc<"submissions">["_id"], {
        updatedAt: now,
      });
    }

    return { success: true, count: args.marks.length };
  },
});

// List responses for a submission
export const listBySubmission = query({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("responses")
      .withIndex("by_submission", (q) =>
        q.eq("submissionId", args.submissionId)
      )
      .collect();

    return responses;
  },
});

// Alias for consistency with other list functions
export const list = query({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("responses")
      .withIndex("by_submission", (q) =>
        q.eq("submissionId", args.submissionId)
      )
      .collect();

    return responses;
  },
});

// Get a single response
export const get = query({
  args: {
    responseId: v.id("responses"),
  },
  handler: async (ctx, args) => {
    const response = await ctx.db.get(args.responseId);
    if (!response) {
      throw new Error("Response not found");
    }
    return response;
  },
});

// Auto-grade a response (for multiple choice, checkbox, etc.)
export const autoGrade = mutation({
  args: {
    responseId: v.id("responses"),
  },
  handler: async (ctx, args) => {
    const response = await ctx.db.get(args.responseId);
    if (!response) {
      throw new Error("Response not found");
    }

    const field = await ctx.db.get(response.fieldId);
    if (!field) {
      throw new Error("Field not found");
    }

    // Only auto-grade if field has correct answer
    if (!field.correctAnswer) {
      return { graded: false };
    }

    const maxMarks = field.marks || 1;
    let isCorrect = false;
    let marksAwarded = 0;

    // Check based on field type
    if (field.type === "multiple_choice" || field.type === "dropdown") {
      // Single answer
      isCorrect = response.value === field.correctAnswer;
      marksAwarded = isCorrect ? maxMarks : 0;
    } else if (field.type === "checkbox") {
      // Multiple answers
      const correctAnswers = Array.isArray(field.correctAnswer)
        ? field.correctAnswer
        : [field.correctAnswer];
      const userAnswers = Array.isArray(response.value)
        ? response.value
        : [response.value];

      // Check if arrays match (order doesn't matter)
      const sortedCorrect = [...correctAnswers].sort();
      const sortedUser = [...userAnswers].sort();
      isCorrect =
        sortedCorrect.length === sortedUser.length &&
        sortedCorrect.every((val, idx) => val === sortedUser[idx]);
      marksAwarded = isCorrect ? maxMarks : 0;
    }

    await ctx.db.patch(args.responseId, {
      isCorrect,
      marksAwarded,
      maxMarks,
      markedAt: Date.now(),
    });

    return { graded: true, isCorrect, marksAwarded, maxMarks };
  },
});
