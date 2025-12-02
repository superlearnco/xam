import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { generateText } from "ai";
import { api } from "./_generated/api";

export const listTests = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(v.literal("test")),
    sortBy: v.optional(
      v.union(v.literal("name"), v.literal("recency"), v.literal("lastEdited"))
    ), // Supports name, recency, or lastEdited
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    // Determine the index and sort order based on sortBy
    let tests;
    const baseQuery = ctx.db.query("tests");

    if (args.sortBy === "name") {
      tests = await baseQuery
        .withIndex("by_user_name", (q) => q.eq("userId", identity.subject))
        .collect();
    } else if (args.sortBy === "recency") {
      tests = await baseQuery
        .withIndex("by_user_created", (q) => q.eq("userId", identity.subject))
        .order("desc")
        .collect();
    } else if (args.sortBy === "lastEdited") {
      // Use userId index and sort in-memory to handle optional lastEdited field
      tests = await baseQuery
        .withIndex("userId", (q) => q.eq("userId", identity.subject))
        .collect();
      tests.sort((a, b) => {
        const aLastEdited = a.lastEdited ?? a.createdAt;
        const bLastEdited = b.lastEdited ?? b.createdAt;
        return bLastEdited - aLastEdited;
      });
    } else {
      tests = await baseQuery
        .withIndex("userId", (q) => q.eq("userId", identity.subject))
        .collect();
    }

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
    type: v.literal("test"),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const testId = await ctx.db.insert("tests", {
      userId: identity.subject,
      name: args.name,
      type: args.type,
      description: args.description,
      fields: [],
      createdAt: now,
      lastEdited: now,
    });

    return testId;
  },
});

export const generateAndCreateTest = mutation({
  args: {
    name: v.string(),
    type: v.literal("test"),
    description: v.optional(v.string()),
    maxAttempts: v.optional(v.number()),
    estimatedDuration: v.optional(v.number()),
    timeLimitMinutes: v.optional(v.number()),
    passingGrade: v.optional(v.number()),
    instantFeedback: v.optional(v.boolean()),
    showAnswerKey: v.optional(v.boolean()),
    randomizeQuestions: v.optional(v.boolean()),
    shuffleOptions: v.optional(v.boolean()),
    viewType: v.optional(
      v.union(v.literal("singlePage"), v.literal("oneQuestionPerPage"))
    ),
    enableCalculator: v.optional(v.boolean()),
    calculatorType: v.optional(
      v.union(v.literal("basic"), v.literal("scientific"))
    ),
    fields: v.array(
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
        correctAnswers: v.optional(v.array(v.union(v.number(), v.string()))),
        marks: v.optional(v.number()),
        placeholder: v.optional(v.string()),
        helpText: v.optional(v.string()),
        minLength: v.optional(v.number()),
        maxLength: v.optional(v.number()),
        pattern: v.optional(v.string()),
        width: v.optional(v.string()),
        fileUrl: v.optional(v.string()),
        latexContent: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    // Sanitize correctAnswers: convert strings to numbers
    const sanitizedFields = args.fields.map((field) => ({
      ...field,
      correctAnswers: field.correctAnswers
        ? field.correctAnswers
            .map((ans: string | number) => {
              if (typeof ans === "string") {
                const num = Number(ans);
                return isNaN(num) ? null : num;
              }
              return typeof ans === "number" ? ans : null;
            })
            .filter(
              (ans): ans is number => ans !== null && typeof ans === "number"
            )
        : field.correctAnswers,
    }));

    const testId = await ctx.db.insert("tests", {
      userId: identity.subject,
      name: args.name,
      type: args.type,
      description: args.description,
      fields: sanitizedFields,
      maxAttempts: args.maxAttempts,
      estimatedDuration: args.estimatedDuration,
      timeLimitMinutes: args.timeLimitMinutes,
      passingGrade: args.passingGrade,
      instantFeedback: args.instantFeedback,
      showAnswerKey: args.showAnswerKey,
      randomizeQuestions: args.randomizeQuestions,
      shuffleOptions: args.shuffleOptions,
      viewType: args.viewType,
      enableCalculator: args.enableCalculator,
      calculatorType: args.calculatorType,
      createdAt: now,
      lastEdited: now,
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
          correctAnswers: v.optional(v.array(v.union(v.number(), v.string()))),
          marks: v.optional(v.number()),
          placeholder: v.optional(v.string()),
          helpText: v.optional(v.string()),
          minLength: v.optional(v.number()),
          maxLength: v.optional(v.number()),
          pattern: v.optional(v.string()),
          width: v.optional(v.string()),
          fileUrl: v.optional(v.string()),
          latexContent: v.optional(v.string()),
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
    timeLimitMinutes: v.optional(v.number()),
    randomizeQuestions: v.optional(v.boolean()),
    shuffleOptions: v.optional(v.boolean()),
    viewType: v.optional(
      v.union(v.literal("singlePage"), v.literal("oneQuestionPerPage"))
    ),
    enableCalculator: v.optional(v.boolean()),
    calculatorType: v.optional(
      v.union(v.literal("basic"), v.literal("scientific"))
    ),
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
        type:
          | "shortInput"
          | "longInput"
          | "multipleChoice"
          | "checkboxes"
          | "dropdown"
          | "imageChoice"
          | "pageBreak"
          | "infoBlock";
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
        fileUrl?: string;
        latexContent?: string;
      }>;
      lastEdited?: number;
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
      timeLimitMinutes?: number;
      randomizeQuestions?: boolean;
      shuffleOptions?: boolean;
      viewType?: "singlePage" | "oneQuestionPerPage";
      enableCalculator?: boolean;
      calculatorType?: "basic" | "scientific";
    } = {};

    if (args.name !== undefined) {
      updates.name = args.name;
    }
    if (args.description !== undefined) {
      updates.description = args.description;
    }
    if (args.fields !== undefined) {
      // Sanitize correctAnswers: convert strings to numbers
      updates.fields = args.fields.map((field) => ({
        ...field,
        correctAnswers: field.correctAnswers
          ? field.correctAnswers
              .map((ans: string | number) => {
                if (typeof ans === "string") {
                  const num = Number(ans);
                  return isNaN(num) ? null : num;
                }
                return typeof ans === "number" ? ans : null;
              })
              .filter(
                (ans): ans is number => ans !== null && typeof ans === "number"
              )
          : field.correctAnswers,
      }));
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
    if (args.timeLimitMinutes !== undefined) {
      updates.timeLimitMinutes = args.timeLimitMinutes;
    }
    if (args.randomizeQuestions !== undefined) {
      updates.randomizeQuestions = args.randomizeQuestions;
    }
    if (args.shuffleOptions !== undefined) {
      updates.shuffleOptions = args.shuffleOptions;
    }
    if (args.viewType !== undefined) {
      updates.viewType = args.viewType;
    }
    if (args.enableCalculator !== undefined) {
      updates.enableCalculator = args.enableCalculator;
    }
    if (args.calculatorType !== undefined) {
      updates.calculatorType = args.calculatorType;
    }

    // Always update lastEdited when any field is updated
    updates.lastEdited = Date.now();

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
    tabSwitchCount: v.optional(v.number()),
    copyPasteCount: v.optional(v.number()),
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
    let fieldMarks: Record<string, number> | undefined;
    let isMarked: boolean | undefined;

    // Check if test has any text input fields (shortInput or longInput)
    const hasTextInputFields =
      test.fields?.some(
        (f) => f.type === "shortInput" || f.type === "longInput"
      ) || false;

    // Calculate marks if instant feedback is enabled OR if there are no text input fields (auto-mark)
    if ((test.instantFeedback || !hasTextInputFields) && test.fields) {
      let earnedMarks = 0;
      let totalMarks = 0;
      const calculatedFieldMarks: Record<string, number> = {};

      // Only count fields that are actually markable (exclude pageBreak and infoBlock)
      const markableFields = test.fields.filter(
        (f) => f.type !== "pageBreak" && f.type !== "infoBlock"
      );

      for (const field of markableFields) {
        // Only process fields with marks
        if (field.marks && field.marks > 0) {
          totalMarks += field.marks;
          const userResponse = args.responses[field.id];
          let mark = 0;

          // Only calculate score for fields with correctAnswers defined
          if (field.correctAnswers && field.correctAnswers.length > 0) {
            if (
              userResponse !== undefined &&
              userResponse !== null &&
              userResponse !== ""
            ) {
              let isCorrect = false;

              // Handle different field types
              if (
                field.type === "multipleChoice" ||
                field.type === "dropdown"
              ) {
                // Single answer - check if response matches any correct answer
                const responseIndex =
                  typeof userResponse === "string"
                    ? parseInt(userResponse, 10)
                    : userResponse;
                isCorrect = field.correctAnswers.includes(responseIndex);
              } else if (
                field.type === "checkboxes" ||
                field.type === "imageChoice"
              ) {
                // Multiple answers - check if all correct answers are selected
                const selectedIndices = Array.isArray(userResponse)
                  ? userResponse.map((v) =>
                      typeof v === "string" ? parseInt(v, 10) : v
                    )
                  : [
                      typeof userResponse === "string"
                        ? parseInt(userResponse, 10)
                        : userResponse,
                    ];

                // Check if all correct answers are selected and no incorrect ones
                const correctSet = new Set(field.correctAnswers);
                const selectedSet = new Set(selectedIndices);

                // All correct answers must be selected
                const allCorrectSelected = field.correctAnswers.every((idx) =>
                  selectedSet.has(idx)
                );
                // No extra incorrect answers
                const noExtraAnswers = selectedIndices.every((idx) =>
                  correctSet.has(idx)
                );

                isCorrect = allCorrectSelected && noExtraAnswers;
              } else if (
                field.type === "shortInput" ||
                field.type === "longInput"
              ) {
                // Text input - compare with correct answers (assuming correctAnswers contains indices to options array)
                // For text inputs, we might need to compare text directly
                // For now, if correctAnswers is defined, we'll check if response matches any option at those indices
                if (field.options && field.options.length > 0) {
                  const responseText = String(userResponse)
                    .toLowerCase()
                    .trim();
                  isCorrect = field.correctAnswers.some((idx) => {
                    const correctOption = field.options?.[idx];
                    return (
                      correctOption &&
                      correctOption.toLowerCase().trim() === responseText
                    );
                  });
                }
              }

              if (isCorrect) {
                mark = field.marks;
                earnedMarks += field.marks;
              }
            }
          }
          // If field has marks but no correctAnswers, mark stays at 0 (requires manual marking)

          // Store the mark for this field
          calculatedFieldMarks[field.id] = mark;
        }
      }

      score = earnedMarks;
      maxScore = totalMarks;
      percentage =
        totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;

      // If there are no text input fields, automatically mark the submission
      if (!hasTextInputFields) {
        fieldMarks = calculatedFieldMarks;
        isMarked = true;
      } else if (test.instantFeedback) {
        // If instant feedback is enabled, store field marks for reference but don't mark as complete
        fieldMarks = calculatedFieldMarks;
      }
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
      fieldMarks,
      isMarked,
      submittedAt: Date.now(),
      startedAt: args.startedAt,
      tabSwitchCount: args.tabSwitchCount,
      copyPasteCount: args.copyPasteCount,
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
      .withIndex("by_test_submitted", (q) => q.eq("testId", args.testId))
      .order("desc")
      .collect();

    // Calculate statistics
    const total = submissions.length;
    const marked = submissions.filter((s) => s.isMarked === true).length;
    const unmarked = total - marked;

    // Calculate mean percentage for marked submissions only
    const markedSubmissions = submissions.filter(
      (s) => s.isMarked === true && s.percentage !== undefined
    );
    const meanPercentage =
      markedSubmissions.length > 0
        ? Math.round(
            markedSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0) /
              markedSubmissions.length
          )
        : 0;

    // Calculate question-level stats
    const questionStats: Record<
      string,
      {
        totalScore: number;
        maxScore: number;
        count: number;
      }
    > = {};

    const fields = test.fields || [];
    // Filter for markable fields
    const markableFields = fields.filter(
      (f) =>
        f.type !== "pageBreak" &&
        f.type !== "infoBlock" &&
        f.marks &&
        f.marks > 0
    );

    // Initialize stats for all markable fields
    for (const field of markableFields) {
      questionStats[field.id] = {
        totalScore: 0,
        maxScore: field.marks || 0,
        count: 0,
      };
    }

    for (const submission of markedSubmissions) {
      const fieldMarks = submission.fieldMarks as
        | Record<string, number>
        | undefined;
      if (fieldMarks) {
        for (const field of markableFields) {
          const mark = fieldMarks[field.id];
          if (mark !== undefined) {
            if (questionStats[field.id]) {
              questionStats[field.id].totalScore += mark;
              questionStats[field.id].count += 1;
            }
          }
        }
      }
    }

    // Format for return
    const questionAnalytics = markableFields
      .map((field) => {
        const stats = questionStats[field.id];
        const averageScore =
          stats.count > 0 ? stats.totalScore / stats.count : 0;
        const averagePercentage =
          stats.maxScore > 0
            ? Math.round((averageScore / stats.maxScore) * 100)
            : 0;

        return {
          fieldId: field.id,
          label: field.label,
          averageScore,
          maxScore: stats.maxScore,
          averagePercentage,
          count: stats.count,
        };
      })
      .sort((a, b) => a.averagePercentage - b.averagePercentage); // Sort by most missed (lowest percentage) first

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
        fieldMarks: s.fieldMarks,
        tabSwitchCount: s.tabSwitchCount,
        copyPasteCount: s.copyPasteCount,
      })),
      statistics: {
        total,
        marked,
        unmarked,
        meanPercentage,
      },
      questionAnalytics,
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
        tabSwitchCount: submission.tabSwitchCount,
        copyPasteCount: submission.copyPasteCount,
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
    // Only count fields that are actually markable (exclude pageBreak and infoBlock)
    const markableFields = fields.filter(
      (f) => f.type !== "pageBreak" && f.type !== "infoBlock"
    );
    let totalScore = 0;
    let maxScore = 0;
    const fieldMarksObj = args.fieldMarks as Record<string, number>;

    for (const field of markableFields) {
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

    const percentage =
      maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

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

export const deleteSubmission = mutation({
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

    await ctx.db.delete(args.submissionId);
  },
});

export const deleteSubmissionsByStudent = mutation({
  args: {
    testId: v.id("tests"),
    respondentEmail: v.optional(v.string()),
    respondentName: v.optional(v.string()),
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

    // Require at least one identifier
    if (!args.respondentEmail && !args.respondentName) {
      throw new Error("Must provide either respondentEmail or respondentName");
    }

    // Get all submissions for this test
    const allSubmissions = await ctx.db
      .query("testSubmissions")
      .withIndex("by_test_submitted", (q) => q.eq("testId", args.testId))
      .collect();

    // Filter submissions by student identifier
    const submissionsToDelete = allSubmissions.filter((submission) => {
      if (args.respondentEmail) {
        return submission.respondentEmail === args.respondentEmail;
      }
      if (args.respondentName) {
        return submission.respondentName === args.respondentName;
      }
      return false;
    });

    // Delete all matching submissions
    for (const submission of submissionsToDelete) {
      await ctx.db.delete(submission._id);
    }

    return { deletedCount: submissionsToDelete.length };
  },
});

const INPUT_CREDITS_PER_TOKEN = 0.00005;
const OUTPUT_CREDITS_PER_TOKEN = 0.00015;

/**
 * Fixes common LaTeX errors in AI-generated content.
 * Replaces common mistakes like "imes" with "\times" and ensures proper LaTeX syntax.
 */
function fixLatexContent(content: string): string {
  if (!content || typeof content !== "string") {
    return content;
  }

  // Fix common LaTeX command mistakes (missing backslashes)
  // These patterns match common AI mistakes where backslashes were lost
  const fixes: Array<[RegExp, string]> = [
    // Multiplication
    [/\bimes\b/g, "\\times"],
    // Division
    [/\bdiv(?![i])\b/g, "\\div"], // Avoid matching "divide", "divisible" etc
    // Plus/minus
    [/\bpm(?![a-z])\b/g, "\\pm"], // Avoid matching "pm" in words like "simple"
    [/\bmp(?![a-z])\b/g, "\\mp"],
    // Fractions
    [/\bfrac\{/g, "\\frac{"],
    // Square root
    [/\bsqrt\{/g, "\\sqrt{"],
    [/\bsqrt\[/g, "\\sqrt["],
    // Operators
    [/\bsum(?![a-z])\b/g, "\\sum"], // Avoid matching "summary", etc
    [/\bprod(?![a-z])\b/g, "\\prod"], // Avoid matching "product", etc
    [/\bint(?![a-z])\b/g, "\\int"], // Avoid matching "integer", "integral", etc
    // Relations
    [/\bleq(?![a-z])\b/g, "\\leq"], // Avoid matching "lequation", etc
    [/\bgeq(?![a-z])\b/g, "\\geq"],
    [/\bneq(?![a-z])\b/g, "\\neq"],
    [/\bapprox(?![a-z])\b/g, "\\approx"],
    // Greek letters (common ones)
    [/\balpha(?![a-z])\b/g, "\\alpha"],
    [/\bbeta(?![a-z])\b/g, "\\beta"],
    [/\bgamma(?![a-z])\b/g, "\\gamma"],
    [/\bdelta(?![a-z])\b/g, "\\delta"],
    [/\bepsilon(?![a-z])\b/g, "\\epsilon"],
    [/\btheta(?![a-z])\b/g, "\\theta"],
    [/\blambda(?![a-z])\b/g, "\\lambda"],
    [/\bmu(?![a-z])\b/g, "\\mu"],
    [/\bpi(?![a-z])\b/g, "\\pi"],
    [/\bsigma(?![a-z])\b/g, "\\sigma"],
    [/\bomega(?![a-z])\b/g, "\\omega"],
    // Sets
    [/\bin(?![a-z])\b(?=\s*\{)/g, "\\in"], // Only when followed by { (like "in {1,2}")
    [/\bsubset(?![a-z])\b/g, "\\subset"],
    [/\bsupset(?![a-z])\b/g, "\\supset"],
    // Arrows
    [/\brightarrow(?![a-z])\b/g, "\\rightarrow"],
    [/\bleftarrow(?![a-z])\b/g, "\\leftarrow"],
    [/\bleftrightarrow(?![a-z])\b/g, "\\leftrightarrow"],
  ];

  let fixed = content;
  for (const [pattern, replacement] of fixes) {
    fixed = fixed.replace(pattern, replacement);
  }

  return fixed;
}

/**
 * Removes $$ delimiters from labels and moves display math to latexContent
 */
function cleanLabelAndMoveLatex(field: any): any {
  if (!field || typeof field !== "object") {
    return field;
  }

  const cleaned = { ...field };

  // Handle label field - remove $$ delimiters and extract display math
  if (cleaned.label && typeof cleaned.label === "string") {
    let label = cleaned.label;

    // Find all $$...$$ patterns
    const displayMathPattern = /\$\$([^$]+?)\$\$/g;
    const displayMathBlocks: string[] = [];
    let match;

    // Extract all $$...$$ blocks
    while ((match = displayMathPattern.exec(label)) !== null) {
      displayMathBlocks.push(match[1].trim());
    }

    // Remove all $$...$$ from label
    label = label.replace(displayMathPattern, "").trim();

    // If we found display math blocks and latexContent doesn't exist or is empty
    if (displayMathBlocks.length > 0) {
      // Combine multiple display math blocks or use the first one
      const combinedMath = displayMathBlocks.join(" \\\\ "); // Join with line breaks
      
      // Only set latexContent if it's empty or doesn't exist
      if (!cleaned.latexContent || cleaned.latexContent.trim() === "") {
        cleaned.latexContent = combinedMath;
      }
    }

    // Clean up the label - remove extra spaces and fix LaTeX commands
    label = label.replace(/\s+/g, " ").trim();
    cleaned.label = fixLatexContent(label);

    // Also clean latexContent if it exists
    if (cleaned.latexContent && typeof cleaned.latexContent === "string") {
      // Remove $$ delimiters from latexContent if present
      cleaned.latexContent = cleaned.latexContent.replace(/^\$\$|\$\$$/g, "").trim();
      cleaned.latexContent = fixLatexContent(cleaned.latexContent);
    }
  }

  return cleaned;
}

/**
 * Recursively cleans LaTeX content in a test object (fields, labels, options, etc.)
 */
function cleanLatexInTestData(data: any): any {
  if (typeof data === "string") {
    // Remove $$ delimiters from strings (shouldn't have them in JSON values)
    let cleaned = data.replace(/^\$\$|\$\$$/g, "").trim();
    return fixLatexContent(cleaned);
  }
  
  if (Array.isArray(data)) {
    return data.map(cleanLatexInTestData);
  }
  
  if (data && typeof data === "object") {
    // Check if this is a test object with fields array
    if (data.fields && Array.isArray(data.fields)) {
      const cleaned = { ...data };
      // Clean each field specially to handle label -> latexContent migration
      cleaned.fields = data.fields.map((field: any) => {
        const cleanedField = cleanLabelAndMoveLatex(field);
        // Also clean options if they exist
        if (cleanedField.options && Array.isArray(cleanedField.options)) {
          cleanedField.options = cleanedField.options.map((opt: any) => {
            if (typeof opt === "string") {
              // Remove $$ delimiters from options (should use $...$ for inline math)
              let cleanedOpt = opt.replace(/\$\$/g, "$");
              return fixLatexContent(cleanedOpt);
            }
            return cleanLatexInTestData(opt);
          });
        }
        return cleanedField;
      });
      return cleaned;
    }

    // For other objects, clean recursively
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      cleaned[key] = cleanLatexInTestData(value);
    }
    return cleaned;
  }
  
  return data;
}

// Generate test using AI
export const generateTestWithAI = action({
  args: {
    prompt: v.string(),
    gradeLevel: v.optional(v.string()),
    category: v.optional(v.string()),
    complexity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check user's current credits
    const creditCheck = await ctx.runQuery(api.credits.checkCredits, {
      amount: 0, // Just to get current credits
    });

    // Do not allow users with 0 credits
    if (creditCheck.credits <= 0) {
      throw new Error(
        "You need at least 1 credit to generate tests. Please purchase credits to continue."
      );
    }

    // Estimate credits needed (rough estimate before generation)
    const estimatedInputTokens = Math.ceil((args.prompt.length || 0) / 4); // Rough estimate: 4 chars per token
    const estimatedOutputTokens = 2000; // Estimate for a typical test generation
    const estimatedCreditsRaw =
      estimatedInputTokens * INPUT_CREDITS_PER_TOKEN +
      estimatedOutputTokens * OUTPUT_CREDITS_PER_TOKEN;
    const estimatedCredits = Math.ceil(estimatedCreditsRaw); // Round up to nearest credit

    // Check if user has enough credits (with buffer)
    if (creditCheck.credits < estimatedCredits * 1.5) {
      // 50% buffer for safety
      throw new Error(
        `Insufficient credits. You have ${creditCheck.credits} credits, but need approximately ${estimatedCredits} credits. Please purchase more credits to continue.`
      );
    }

    // Build configuration context for the prompt
    const configParts: string[] = [];
    if (args.gradeLevel) {
      const gradeNum = parseInt(args.gradeLevel);
      const gradeSuffix =
        gradeNum === 1
          ? "st"
          : gradeNum === 2
          ? "nd"
          : gradeNum === 3
          ? "rd"
          : "th";
      configParts.push(`Grade Level: ${gradeNum}${gradeSuffix} grade`);
    }
    if (args.category) {
      configParts.push(`Category: ${args.category}`);
    }
    if (args.complexity) {
      configParts.push(`Complexity: ${args.complexity}`);
    }

    const configContext =
      configParts.length > 0
        ? `\n\nIMPORTANT: The following configuration should guide the test creation:\n${configParts.join(
            "\n"
          )}\n\n- Adjust the difficulty and vocabulary to match the specified grade level.\n- Align all questions with the specified category.\n- Set question complexity based on the specified level (Low: basic concepts, Medium: application of concepts, High: analysis and synthesis).`
        : "";

    const systemPrompt = `You are an expert exam creator. Create a test based on the user's prompt.${configContext}
    Return a JSON object with the following structure:
    {
      "name": "Test Name",
      "description": "Test Description",
      "type": "test",
      "maxAttempts": number (optional, default unlimited),
      "estimatedDuration": number (optional, in minutes),
      "timeLimitMinutes": number (optional, in minutes, 0 for unlimited),
      "passingGrade": number (optional, percentage 0-100),
      "instantFeedback": boolean (optional),
      "showAnswerKey": boolean (optional),
      "randomizeQuestions": boolean (optional),
      "shuffleOptions": boolean (optional),
      "viewType": "singlePage" | "oneQuestionPerPage" (optional),
      "enableCalculator": boolean (optional),
      "calculatorType": "basic" | "scientific" (optional),
      "fields": [
        {
          "id": "unique_string_id",
          "type": "shortInput" | "longInput" | "multipleChoice" | "checkboxes" | "dropdown" | "imageChoice" | "pageBreak" | "infoBlock",
          "label": "Question text",
          "required": boolean (optional),
          "options": ["Option 1", "Option 2"] (optional, for multipleChoice, checkboxes, dropdown, imageChoice),
          "correctAnswers": [0] (optional, indices of correct options for auto-grading),
          "marks": number (optional, default 1),
          "helpText": "Optional hint",
          "placeholder": "Optional placeholder",
          "latexContent": "Optional LaTeX math formula for questions - USE THIS FIELD for math equations/formulas (NO $$ delimiters needed, e.g., \"x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}\")",
          "minLength": number (optional, for text input),
          "maxLength": number (optional, for text input),
          "pattern": "Optional regex pattern",
          "width": "full" | "half" | "third" (optional, default "full")
        }
      ]
    }
    Ensure the JSON is valid and fields follow this schema.
    For 'id', generate a unique string like 'field-{timestamp}'.
    Default to 'test' type if not specified.
    Do NOT include any fields related to Access & Security (requireAuth, password, browser restrictions).
    
    CRITICAL - LaTeX Support and JSON Escaping:
    When writing LaTeX in JSON strings, you MUST escape backslashes by doubling them (\\). 
    After JSON parsing, \\ becomes \ which is correct LaTeX syntax.
    
    Examples of CORRECT LaTeX in JSON:
    - latexContent: "x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}" (NO $$ delimiters - added automatically during rendering)
    - label: "Multiply the following:" (plain text in label, math goes in latexContent)
    - options: ["$\\\\sqrt{16}$", "$4^2$"] (becomes ["$\\sqrt{16}$", "$4^2$"] after parsing - use single $ for inline math)
    
    Common LaTeX commands that need double backslashes in JSON:
    - \\times for multiplication (×)
    - \\div for division (÷)
    - \\pm for plus/minus (±)
    - \\frac{a}{b} for fractions
    - \\sqrt{x} for square root
    - \\leq, \\geq, \\neq for inequalities
    - Greek letters: \\alpha, \\beta, \\pi, \\theta, etc.
    
    - For math formulas/equations in QUESTIONS: ALWAYS use the latexContent field (WITHOUT $$ delimiters)
      * Example: latexContent: "x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}"
      * Keep the label text simple (e.g., "Solve for x:") and put the formula in latexContent
      * DO NOT put $$ delimiters in latexContent - they are added automatically during rendering
    - For inline math within question labels: Use $...$ format in the label text itself (single $ delimiters)
      * Example: "What is the value of $x$ when $y = 3$?"
      * DO NOT use $$ in labels - use latexContent field for display math instead
    - For math in answer options: Use $...$ inline format in options
      * Example: ["$x = 5$", "$x = -5$", "$x = 0$"] 
      * Example: ["$\\\\sqrt{16} = 4$", "$4^2 = 16$"] (double backslashes for commands)
    - When creating math questions: Use latexContent field for formulas/equations, $...$ for small inline expressions
    
    REMEMBER: In JSON, every single backslash must be doubled. \\times in JSON becomes \times in LaTeX.
    `;

    const result = await generateText({
      model: "xai/grok-4-fast-reasoning", // AI Gateway format: provider/model-name
      system: systemPrompt,
      prompt: args.prompt,
    });

    const text = result.text;
    const usage = result.usage;

    // Debug: Log the usage object structure to understand its format
    console.log("Usage object:", JSON.stringify(usage, null, 2));
    console.log(
      "Usage object keys:",
      usage ? Object.keys(usage) : "usage is null/undefined"
    );

    // Calculate actual credits used
    // The Vercel AI SDK v5 usage object should have promptTokens and completionTokens
    const usageObj = usage as any;
    let inputTokens = 0;
    let outputTokens = 0;

    if (usageObj) {
      // Try standard Vercel AI SDK format
      inputTokens = usageObj.promptTokens ?? usageObj.inputTokens ?? 0;
      outputTokens = usageObj.completionTokens ?? usageObj.outputTokens ?? 0;

      // If still 0, try nested structure
      if (inputTokens === 0 && outputTokens === 0 && usageObj.usage) {
        inputTokens =
          usageObj.usage.promptTokens ?? usageObj.usage.inputTokens ?? 0;
        outputTokens =
          usageObj.usage.completionTokens ?? usageObj.usage.outputTokens ?? 0;
      }
    }

    const creditsUsedRaw =
      inputTokens * INPUT_CREDITS_PER_TOKEN +
      outputTokens * OUTPUT_CREDITS_PER_TOKEN;

    // Ensure at least 1 credit is charged if there was any usage, and always round up
    const creditsUsed = Math.max(1, Math.ceil(creditsUsedRaw));

    // Deduct credits
    await ctx.runMutation(api.credits.deductCredits, {
      userId: identity.subject,
      amount: creditsUsed,
      description: `AI test generation (${inputTokens} input + ${outputTokens} output tokens)`,
      aiModel: "xai/grok-4-fast-reasoning",
    });

    // Parse the JSON response
    try {
      let data = JSON.parse(text);
      // Clean LaTeX content to fix common AI-generated errors
      data = cleanLatexInTestData(data);
      return data;
    } catch (error) {
      // If parsing fails, try to extract JSON from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let data = JSON.parse(jsonMatch[0]);
        // Clean LaTeX content to fix common AI-generated errors
        data = cleanLatexInTestData(data);
        return data;
      }
      throw new Error("Failed to parse AI response as JSON");
    }
  },
});

export const generateDummyAnswers = action({
  args: {
    question: v.string(),
    correctAnswers: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check user's current credits
    const creditCheck = await ctx.runQuery(api.credits.checkCredits, {
      amount: 0, // Just to get current credits
    });

    // Do not allow users with 0 credits
    if (creditCheck.credits <= 0) {
      throw new Error(
        "You need at least 1 credit to generate answers. Please purchase credits to continue."
      );
    }

    const systemPrompt = `You are an expert exam creator. Generate 3 incorrect but plausible options (distractors) for a multiple choice question.
    
    Question: "${args.question}"
    Correct Answer(s): "${args.correctAnswers.join(", ")}"
    
    Return ONLY a JSON array of strings containing 3 incorrect options.
    Example: ["Incorrect Option 1", "Incorrect Option 2", "Incorrect Option 3"]
    Do not include the correct answer in the output.
    Ensure the JSON is valid.
    
    CRITICAL - If the question or answers contain LaTeX math (using $...$ or $$...$$):
    - When writing LaTeX in JSON strings, you MUST escape backslashes by doubling them (\\)
    - Example: If you want to output "$$23 \\times 47$$", write it as "$$23 \\\\times 47$$" in the JSON
    - Common LaTeX commands: \\\\times (×), \\\\div (÷), \\\\pm (±), \\\\sqrt{}, \\\\frac{}{}, etc.
    - Preserve any existing LaTeX formatting from the question/answers in your distractors
    - REMEMBER: In JSON, every single backslash must be doubled.`;

    // Estimate credits needed (rough estimate)
    const estimatedInputTokens = Math.ceil(
      (systemPrompt.length + args.question.length) / 4
    );
    const estimatedOutputTokens = 100; // Short response
    const estimatedCreditsRaw =
      estimatedInputTokens * INPUT_CREDITS_PER_TOKEN +
      estimatedOutputTokens * OUTPUT_CREDITS_PER_TOKEN;
    const estimatedCredits = Math.ceil(estimatedCreditsRaw);

    // Check if user has enough credits (with buffer)
    if (creditCheck.credits < estimatedCredits) {
      // minimal check, usually 1 credit is enough
    }

    const result = await generateText({
      model: "xai/grok-4-fast-non-reasoning",
      system: systemPrompt,
      prompt: "Generate distractors.",
    });

    const text = result.text;
    const usage = result.usage;

    // Calculate actual credits used
    const usageObj = usage as any;
    let inputTokens = 0;
    let outputTokens = 0;

    if (usageObj) {
      inputTokens = usageObj.promptTokens ?? usageObj.inputTokens ?? 0;
      outputTokens = usageObj.completionTokens ?? usageObj.outputTokens ?? 0;
      if (inputTokens === 0 && outputTokens === 0 && usageObj.usage) {
        inputTokens =
          usageObj.usage.promptTokens ?? usageObj.usage.inputTokens ?? 0;
        outputTokens =
          usageObj.usage.completionTokens ?? usageObj.usage.outputTokens ?? 0;
      }
    }

    const creditsUsedRaw =
      inputTokens * INPUT_CREDITS_PER_TOKEN +
      outputTokens * OUTPUT_CREDITS_PER_TOKEN;

    // Ensure at least 1 credit is charged if there was any usage, and always round up
    const creditsUsed = Math.max(1, Math.ceil(creditsUsedRaw));

    // Deduct credits
    await ctx.runMutation(api.credits.deductCredits, {
      userId: identity.subject,
      amount: creditsUsed,
      description: `AI distractor generation (${inputTokens} in + ${outputTokens} out)`,
      aiModel: "xai/grok-4-fast-non-reasoning",
    });

    // Parse the JSON response
    try {
      let data = JSON.parse(text);
      if (Array.isArray(data)) {
        // Clean LaTeX content in distractors
        return cleanLatexInTestData(data);
      }
      // Try to find array in text if not direct JSON
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        let data = JSON.parse(arrayMatch[0]);
        // Clean LaTeX content in distractors
        return cleanLatexInTestData(data);
      }
      throw new Error("Invalid response format");
    } catch (error) {
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        let data = JSON.parse(arrayMatch[0]);
        // Clean LaTeX content in distractors
        return cleanLatexInTestData(data);
      }
      throw new Error("Failed to parse AI response as JSON");
    }
  },
});
