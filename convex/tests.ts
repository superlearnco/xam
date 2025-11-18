import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const listTests = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(v.union(v.literal("test"), v.literal("survey"), v.literal("essay"))),
    sortBy: v.optional(v.union(v.literal("name"), v.literal("recency"))),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    // Query all tests for this user
    const tests = await ctx.db
      .query("tests")
      .withIndex("userId", (q) => q.eq("userId", identity.subject))
      .collect();

    // Filter by search term (case-insensitive)
    let filteredTests = tests;
    if (args.search && args.search.trim() !== "") {
      const searchLower = args.search.toLowerCase();
      filteredTests = filteredTests.filter((test) =>
        test.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by type
    if (args.type) {
      filteredTests = filteredTests.filter((test) => test.type === args.type);
    }

    // Sort
    if (args.sortBy === "name") {
      filteredTests.sort((a, b) => a.name.localeCompare(b.name));
    } else if (args.sortBy === "recency") {
      filteredTests.sort((a, b) => b.createdAt - a.createdAt);
    }

    return filteredTests;
  },
});

export const getTest = query({
  args: {
    testId: v.id("tests"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const test = await ctx.db.get(args.testId);

    if (!test || test.userId !== identity.subject) {
      return null;
    }

    return test;
  },
});

export const getPublicTest = query({
  args: {
    testId: v.id("tests"),
  },
  handler: async (ctx, args) => {
    // Public query - no authentication required
    const test = await ctx.db.get(args.testId);
    
    if (!test) {
      return null;
    }

    return test;
  },
});

export const createTest = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("test"), v.literal("survey"), v.literal("essay")),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const testId = await ctx.db.insert("tests", {
      userId: identity.subject,
      name: args.name,
      type: args.type,
      description: args.description,
      fields: [],
      createdAt: Date.now(),
    });

    return testId;
  },
});

export const updateTest = mutation({
  args: {
    testId: v.id("tests"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    fields: v.optional(
      v.array(
        v.object({
          id: v.string(),
          type: v.union(
            v.literal("shortInput"),
            v.literal("longInput"),
            v.literal("multipleChoice"),
            v.literal("checkboxes"),
            v.literal("dropdown"),
            v.literal("imageChoice"),
            v.literal("pageBreak"),
            v.literal("infoBlock")
          ),
          label: v.string(),
          required: v.optional(v.boolean()),
          options: v.optional(v.array(v.string())),
          order: v.number(),
          correctAnswers: v.optional(v.array(v.number())),
          marks: v.optional(v.number()),
          placeholder: v.optional(v.string()),
          helpText: v.optional(v.string()),
          minLength: v.optional(v.number()),
          maxLength: v.optional(v.number()),
          pattern: v.optional(v.string()),
          width: v.optional(v.string()),
        })
      )
    ),
    maxAttempts: v.optional(v.number()),
    estimatedDuration: v.optional(v.number()),
    requireAuth: v.optional(v.boolean()),
    password: v.optional(v.string()),
    disableCopyPaste: v.optional(v.boolean()),
    requireFullScreen: v.optional(v.boolean()),
    blockTabSwitching: v.optional(v.boolean()),
    allowBackNavigation: v.optional(v.boolean()),
    passingGrade: v.optional(v.number()),
    instantFeedback: v.optional(v.boolean()),
    showAnswerKey: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const test = await ctx.db.get(args.testId);

    if (!test || test.userId !== identity.subject) {
      throw new Error("Test not found or unauthorized");
    }

    const updates: {
      name?: string;
      description?: string;
      fields?: Array<{
        id: string;
        type: "shortInput" | "longInput" | "multipleChoice" | "checkboxes" | "dropdown" | "imageChoice" | "pageBreak" | "infoBlock";
        label: string;
        required?: boolean;
        options?: string[];
        order: number;
        correctAnswers?: number[];
        marks?: number;
        placeholder?: string;
        helpText?: string;
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        width?: string;
      }>;
      maxAttempts?: number;
      estimatedDuration?: number;
      requireAuth?: boolean;
      password?: string;
      disableCopyPaste?: boolean;
      requireFullScreen?: boolean;
      blockTabSwitching?: boolean;
      allowBackNavigation?: boolean;
      passingGrade?: number;
      instantFeedback?: boolean;
      showAnswerKey?: boolean;
    } = {};

    if (args.name !== undefined) {
      updates.name = args.name;
    }
    if (args.description !== undefined) {
      updates.description = args.description;
    }
    if (args.fields !== undefined) {
      updates.fields = args.fields;
    }
    if (args.maxAttempts !== undefined) {
      updates.maxAttempts = args.maxAttempts;
    }
    if (args.estimatedDuration !== undefined) {
      updates.estimatedDuration = args.estimatedDuration;
    }
    if (args.requireAuth !== undefined) {
      updates.requireAuth = args.requireAuth;
    }
    if (args.password !== undefined) {
      updates.password = args.password;
    }
    if (args.disableCopyPaste !== undefined) {
      updates.disableCopyPaste = args.disableCopyPaste;
    }
    if (args.requireFullScreen !== undefined) {
      updates.requireFullScreen = args.requireFullScreen;
    }
    if (args.blockTabSwitching !== undefined) {
      updates.blockTabSwitching = args.blockTabSwitching;
    }
    if (args.allowBackNavigation !== undefined) {
      updates.allowBackNavigation = args.allowBackNavigation;
    }
    if (args.passingGrade !== undefined) {
      updates.passingGrade = args.passingGrade;
    }
    if (args.instantFeedback !== undefined) {
      updates.instantFeedback = args.instantFeedback;
    }
    if (args.showAnswerKey !== undefined) {
      updates.showAnswerKey = args.showAnswerKey;
    }

    await ctx.db.patch(args.testId, updates);

    return await ctx.db.get(args.testId);
  },
});

export const deleteTest = mutation({
  args: {
    testId: v.id("tests"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const test = await ctx.db.get(args.testId);

    if (!test || test.userId !== identity.subject) {
      throw new Error("Test not found or unauthorized");
    }

    await ctx.db.delete(args.testId);
  },
});

export const submitTest = mutation({
  args: {
    testId: v.id("tests"),
    responses: v.any(),
    respondentName: v.optional(v.string()),
    respondentEmail: v.optional(v.string()),
    startedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Get the test
    const test = await ctx.db.get(args.testId);

    if (!test) {
      throw new Error("Test not found");
    }

    let score: number | undefined;
    let maxScore: number | undefined;
    let percentage: number | undefined;

    // Calculate score if instant feedback is enabled
    if (test.instantFeedback && test.fields) {
      let earnedMarks = 0;
      let totalMarks = 0;

      for (const field of test.fields) {
        // Only calculate score for fields with correctAnswers defined
        if (field.correctAnswers && field.correctAnswers.length > 0 && field.marks) {
          totalMarks += field.marks;
          const userResponse = args.responses[field.id];

          if (userResponse !== undefined && userResponse !== null && userResponse !== "") {
            let isCorrect = false;

            // Handle different field types
            if (field.type === "multipleChoice" || field.type === "dropdown") {
              // Single answer - check if response matches any correct answer
              const responseIndex = typeof userResponse === "string" ? parseInt(userResponse, 10) : userResponse;
              isCorrect = field.correctAnswers.includes(responseIndex);
            } else if (field.type === "checkboxes" || field.type === "imageChoice") {
              // Multiple answers - check if all correct answers are selected
              const selectedIndices = Array.isArray(userResponse)
                ? userResponse.map((v) => (typeof v === "string" ? parseInt(v, 10) : v))
                : [typeof userResponse === "string" ? parseInt(userResponse, 10) : userResponse];
              
              // Check if all correct answers are selected and no incorrect ones
              const correctSet = new Set(field.correctAnswers);
              const selectedSet = new Set(selectedIndices);
              
              // All correct answers must be selected
              const allCorrectSelected = field.correctAnswers.every((idx) => selectedSet.has(idx));
              // No extra incorrect answers
              const noExtraAnswers = selectedIndices.every((idx) => correctSet.has(idx));
              
              isCorrect = allCorrectSelected && noExtraAnswers;
            } else if (field.type === "shortInput" || field.type === "longInput") {
              // Text input - compare with correct answers (assuming correctAnswers contains indices to options array)
              // For text inputs, we might need to compare text directly
              // For now, if correctAnswers is defined, we'll check if response matches any option at those indices
              if (field.options && field.options.length > 0) {
                const responseText = String(userResponse).toLowerCase().trim();
                isCorrect = field.correctAnswers.some((idx) => {
                  const correctOption = field.options?.[idx];
                  return correctOption && correctOption.toLowerCase().trim() === responseText;
                });
              }
            }

            if (isCorrect) {
              earnedMarks += field.marks;
            }
          }
        }
      }

      score = earnedMarks;
      maxScore = totalMarks;
      percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
    }

    // Create submission
    const submissionId = await ctx.db.insert("testSubmissions", {
      testId: args.testId,
      respondentName: args.respondentName,
      respondentEmail: args.respondentEmail,
      responses: args.responses,
      score,
      maxScore,
      percentage,
      submittedAt: Date.now(),
      startedAt: args.startedAt,
    });

    return {
      submissionId,
      score,
      maxScore,
      percentage,
    };
  },
});

export const getTestSubmissions = query({
  args: {
    testId: v.id("tests"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify test ownership
    const test = await ctx.db.get(args.testId);
    if (!test || test.userId !== identity.subject) {
      throw new Error("Test not found or unauthorized");
    }

    // Get all submissions for this test
    const submissions = await ctx.db
      .query("testSubmissions")
      .withIndex("testId", (q) => q.eq("testId", args.testId))
      .collect();

    // Calculate statistics
    const total = submissions.length;
    const marked = submissions.filter((s) => s.isMarked === true).length;
    const unmarked = total - marked;

    // Calculate mean percentage for marked submissions only
    const markedSubmissions = submissions.filter((s) => s.isMarked === true && s.percentage !== undefined);
    const meanPercentage = markedSubmissions.length > 0
      ? Math.round(
          markedSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / markedSubmissions.length
        )
      : 0;

    return {
      submissions: submissions.map((s) => ({
        _id: s._id,
        respondentName: s.respondentName,
        respondentEmail: s.respondentEmail,
        score: s.score,
        maxScore: s.maxScore,
        percentage: s.percentage,
        submittedAt: s.submittedAt,
        isMarked: s.isMarked || false,
      })),
      statistics: {
        total,
        marked,
        unmarked,
        meanPercentage,
      },
    };
  },
});

export const getSubmissionForMarking = query({
  args: {
    submissionId: v.id("testSubmissions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get submission
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    // Get test and verify ownership
    const test = await ctx.db.get(submission.testId);
    if (!test || test.userId !== identity.subject) {
      throw new Error("Test not found or unauthorized");
    }

    return {
      submission: {
        _id: submission._id,
        respondentName: submission.respondentName,
        respondentEmail: submission.respondentEmail,
        responses: submission.responses,
        score: submission.score,
        maxScore: submission.maxScore,
        percentage: submission.percentage,
        submittedAt: submission.submittedAt,
        isMarked: submission.isMarked || false,
        fieldMarks: submission.fieldMarks || {},
      },
      test: {
        _id: test._id,
        name: test.name,
        description: test.description,
        fields: test.fields || [],
      },
    };
  },
});

export const updateSubmissionMarks = mutation({
  args: {
    submissionId: v.id("testSubmissions"),
    fieldMarks: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get submission
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    // Get test and verify ownership
    const test = await ctx.db.get(submission.testId);
    if (!test || test.userId !== identity.subject) {
      throw new Error("Test not found or unauthorized");
    }

    // Validate and calculate marks
    const fields = test.fields || [];
    let totalScore = 0;
    let maxScore = 0;
    const fieldMarksObj = args.fieldMarks as Record<string, number>;

    for (const field of fields) {
      if (field.marks && field.marks > 0) {
        maxScore += field.marks;
        const mark = fieldMarksObj[field.id];
        if (mark !== undefined && mark !== null) {
          // Validate mark doesn't exceed max marks
          const validMark = Math.max(0, Math.min(mark, field.marks));
          totalScore += validMark;
        }
      }
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Update submission
    await ctx.db.patch(args.submissionId, {
      isMarked: true,
      score: totalScore,
      maxScore: maxScore,
      percentage: percentage,
      fieldMarks: fieldMarksObj,
    });

    return {
      score: totalScore,
      maxScore: maxScore,
      percentage: percentage,
    };
  },
});

