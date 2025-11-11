import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all submissions for a project
 */
export const getProjectSubmissions = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(
      v.union(
        v.literal("in_progress"),
        v.literal("submitted"),
        v.literal("marked"),
        v.literal("returned"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    let submissions = await ctx.db
      .query("submissions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (args.status) {
      submissions = submissions.filter((s) => s.status === args.status);
    }

    // Sort by submitted date descending
    submissions.sort(
      (a, b) => (b.submittedAt || b.createdAt) - (a.submittedAt || a.createdAt),
    );

    return submissions;
  },
});

/**
 * Get a single submission by ID
 */
export const getSubmission = query({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    return submission;
  },
});

/**
 * Get submission with answers
 */
export const getSubmissionWithAnswers = query({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      return null;
    }

    const answers = await ctx.db
      .query("answers")
      .withIndex("by_submissionId", (q) =>
        q.eq("submissionId", args.submissionId),
      )
      .collect();

    return {
      ...submission,
      answers,
    };
  },
});

/**
 * Get student's submissions for a project
 */
export const getStudentSubmissions = query({
  args: {
    projectId: v.id("projects"),
    studentEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    return submissions
      .filter((s) => s.studentEmail === args.studentEmail)
      .sort(
        (a, b) =>
          (b.submittedAt || b.createdAt) - (a.submittedAt || a.createdAt),
      );
  },
});

/**
 * Check if student can submit (max attempts check)
 */
export const canStudentSubmit = query({
  args: {
    projectId: v.id("projects"),
    studentEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return { canSubmit: false, reason: "Project not found" };
    }

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const studentSubmissions = submissions.filter(
      (s) => s.studentEmail === args.studentEmail && s.status !== "in_progress",
    );

    const maxAttempts = project.settings.maxAttempts || 1;

    if (studentSubmissions.length >= maxAttempts) {
      return {
        canSubmit: false,
        reason: `Maximum attempts (${maxAttempts}) reached`,
        attemptsUsed: studentSubmissions.length,
        maxAttempts,
      };
    }

    return {
      canSubmit: true,
      attemptsUsed: studentSubmissions.length,
      maxAttempts,
    };
  },
});

/**
 * Get submission statistics
 */
export const getSubmissionStats = query({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      return null;
    }

    const answers = await ctx.db
      .query("answers")
      .withIndex("by_submissionId", (q) =>
        q.eq("submissionId", args.submissionId),
      )
      .collect();

    const totalQuestions = answers.length;
    const answeredQuestions = answers.filter(
      (a) => a.textAnswer || a.selectedOption || a.selectedOptions?.length,
    ).length;
    const correctAnswers = answers.filter((a) => a.isCorrect === true).length;

    return {
      totalQuestions,
      answeredQuestions,
      unansweredQuestions: totalQuestions - answeredQuestions,
      correctAnswers,
      incorrectAnswers: answers.filter((a) => a.isCorrect === false).length,
      percentComplete:
        totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new submission (start test)
 */
export const createSubmission = mutation({
  args: {
    projectId: v.id("projects"),
    studentId: v.optional(v.id("users")),
    studentName: v.string(),
    studentEmail: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get existing submissions to determine attempt number
    const existingSubmissions = await ctx.db
      .query("submissions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const studentSubmissions = existingSubmissions.filter(
      (s) => s.studentEmail === args.studentEmail,
    );

    const attemptNumber = studentSubmissions.length + 1;

    const submissionId = await ctx.db.insert("submissions", {
      projectId: args.projectId,
      studentId: args.studentId,
      studentName: args.studentName,
      studentEmail: args.studentEmail,
      attemptNumber,
      status: "in_progress",
      startedAt: now,
      timeSpent: 0,
      ipAddress: args.ipAddress || null,
      userAgent: args.userAgent || null,
      flagged: false,
      flagReason: null,
      tabSwitches: 0,
      copyPasteAttempts: 0,
      totalMarks: 0,
      awardedMarks: 0,
      percentage: 0,
      grade: null,
      feedback: null,
      markedBy: null,
      autoGraded: false,
      aiGraded: false,
      createdAt: now,
      updatedAt: now,
    });

    // Create answer records for all questions
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const question of questions) {
      await ctx.db.insert("answers", {
        submissionId,
        questionId: question._id,
        answerType: question.type,
        textAnswer: null,
        selectedOption: null,
        selectedOptions: [],
        fileUrl: null,
        fileName: null,
        fileSize: null,
        scaleValue: null,
        matrixAnswers: null,
        isCorrect: null,
        pointsAwarded: 0,
        pointsPossible: question.points || 0,
        feedback: null,
        aiEvaluation: null,
        markedAt: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Update project submission count
    const project = await ctx.db.get(args.projectId);
    if (project) {
      await ctx.db.patch(args.projectId, {
        submissionCount: (project.submissionCount || 0) + 1,
      });
    }

    return submissionId;
  },
});

/**
 * Update submission status
 */
export const updateSubmissionStatus = mutation({
  args: {
    submissionId: v.id("submissions"),
    status: v.union(
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("marked"),
      v.literal("returned"),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const updates: Partial<Doc<"submissions">> = {
      status: args.status,
      updatedAt: now,
    };

    if (args.status === "submitted") {
      updates.submittedAt = now;
    } else if (args.status === "marked") {
      updates.markedAt = now;
    } else if (args.status === "returned") {
      updates.returnedAt = now;
    }

    await ctx.db.patch(args.submissionId, updates);

    return { success: true };
  },
});

/**
 * Submit test (finalize submission)
 */
export const submitTest = mutation({
  args: {
    submissionId: v.id("submissions"),
    timeSpent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    const now = Date.now();

    await ctx.db.patch(args.submissionId, {
      status: "submitted",
      submittedAt: now,
      timeSpent: args.timeSpent || now - submission.startedAt,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Track violations (tab switches, copy/paste)
 */
export const trackViolation = mutation({
  args: {
    submissionId: v.id("submissions"),
    type: v.union(v.literal("tab_switch"), v.literal("copy_paste")),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    const updates: Partial<Doc<"submissions">> = {
      updatedAt: Date.now(),
    };

    if (args.type === "tab_switch") {
      updates.tabSwitches = (submission.tabSwitches || 0) + 1;

      // Auto-flag if too many violations
      if (updates.tabSwitches >= 5) {
        updates.flagged = true;
        updates.flagReason = `Excessive tab switching (${updates.tabSwitches} times)`;
      }
    } else if (args.type === "copy_paste") {
      updates.copyPasteAttempts = (submission.copyPasteAttempts || 0) + 1;

      if (updates.copyPasteAttempts >= 3) {
        updates.flagged = true;
        updates.flagReason = `Excessive copy/paste attempts (${updates.copyPasteAttempts} times)`;
      }
    }

    await ctx.db.patch(args.submissionId, updates);

    return { success: true };
  },
});

/**
 * Flag submission manually
 */
export const flagSubmission = mutation({
  args: {
    submissionId: v.id("submissions"),
    flagged: v.boolean(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, {
      flagged: args.flagged,
      flagReason: args.flagged ? args.reason || "Flagged by instructor" : null,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update submission grades
 */
export const updateSubmissionGrades = mutation({
  args: {
    submissionId: v.id("submissions"),
    awardedMarks: v.number(),
    totalMarks: v.number(),
    feedback: v.optional(v.string()),
    markedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const percentage =
      args.totalMarks > 0 ? (args.awardedMarks / args.totalMarks) * 100 : 0;

    // Calculate letter grade
    let grade = "F";
    if (percentage >= 90) grade = "A";
    else if (percentage >= 80) grade = "B";
    else if (percentage >= 70) grade = "C";
    else if (percentage >= 60) grade = "D";

    await ctx.db.patch(args.submissionId, {
      awardedMarks: args.awardedMarks,
      totalMarks: args.totalMarks,
      percentage,
      grade,
      feedback: args.feedback,
      markedBy: args.markedBy,
      status: "marked",
      markedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, percentage, grade };
  },
});

/**
 * Auto-grade submission
 */
export const autoGradeSubmission = mutation({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    // Get all answers
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_submissionId", (q) =>
        q.eq("submissionId", args.submissionId),
      )
      .collect();

    let totalMarks = 0;
    let awardedMarks = 0;

    // Grade each answer
    for (const answer of answers) {
      const question = await ctx.db.get(answer.questionId);
      if (!question) continue;

      totalMarks += question.points || 0;

      // Auto-gradable question types
      if (question.type === "multipleChoice") {
        const isCorrect = question.options.find(
          (opt, idx) =>
            opt.isCorrect && answer.selectedOption === idx.toString(),
        );

        if (isCorrect) {
          awardedMarks += question.points || 0;
          await ctx.db.patch(answer._id, {
            isCorrect: true,
            pointsAwarded: question.points || 0,
            markedAt: Date.now(),
            updatedAt: Date.now(),
          });
        } else {
          await ctx.db.patch(answer._id, {
            isCorrect: false,
            pointsAwarded: 0,
            markedAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      } else if (question.type === "multipleSelect") {
        const correctIndices = question.options
          .map((opt, idx) => (opt.isCorrect ? idx.toString() : null))
          .filter(Boolean) as string[];

        const studentAnswers = answer.selectedOptions || [];
        const isCorrect =
          correctIndices.length === studentAnswers.length &&
          correctIndices.every((idx) => studentAnswers.includes(idx));

        if (isCorrect) {
          awardedMarks += question.points || 0;
          await ctx.db.patch(answer._id, {
            isCorrect: true,
            pointsAwarded: question.points || 0,
            markedAt: Date.now(),
            updatedAt: Date.now(),
          });
        } else {
          await ctx.db.patch(answer._id, {
            isCorrect: false,
            pointsAwarded: 0,
            markedAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }
      // Other question types require manual grading
    }

    // Update submission with grades
    const percentage = totalMarks > 0 ? (awardedMarks / totalMarks) * 100 : 0;
    let grade = "F";
    if (percentage >= 90) grade = "A";
    else if (percentage >= 80) grade = "B";
    else if (percentage >= 70) grade = "C";
    else if (percentage >= 60) grade = "D";

    await ctx.db.patch(args.submissionId, {
      totalMarks,
      awardedMarks,
      percentage,
      grade,
      autoGraded: true,
      updatedAt: Date.now(),
    });

    return { success: true, totalMarks, awardedMarks, percentage, grade };
  },
});

/**
 * Return submission to student
 */
export const returnSubmission = mutation({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, {
      status: "returned",
      returnedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
