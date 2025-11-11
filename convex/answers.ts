import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all answers for a submission
 */
export const getSubmissionAnswers = query({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_submissionId", (q) => q.eq("submissionId", args.submissionId))
      .collect();

    return answers;
  },
});

/**
 * Get a single answer by ID
 */
export const getAnswer = query({
  args: {
    answerId: v.id("answers"),
  },
  handler: async (ctx, args) => {
    const answer = await ctx.db.get(args.answerId);
    return answer;
  },
});

/**
 * Get answer for a specific question in a submission
 */
export const getAnswerForQuestion = query({
  args: {
    submissionId: v.id("submissions"),
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_submissionId", (q) => q.eq("submissionId", args.submissionId))
      .collect();

    return answers.find((a) => a.questionId === args.questionId) || null;
  },
});

/**
 * Get answers by question ID (across all submissions)
 */
export const getAnswersByQuestion = query({
  args: {
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_questionId", (q) => q.eq("questionId", args.questionId))
      .collect();

    return answers;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Save/update an answer
 */
export const saveAnswer = mutation({
  args: {
    submissionId: v.id("submissions"),
    questionId: v.id("questions"),
    textAnswer: v.optional(v.union(v.string(), v.null())),
    selectedOption: v.optional(v.union(v.string(), v.null())),
    selectedOptions: v.optional(v.array(v.string())),
    fileUrl: v.optional(v.union(v.string(), v.null())),
    fileName: v.optional(v.union(v.string(), v.null())),
    fileSize: v.optional(v.union(v.number(), v.null())),
    scaleValue: v.optional(v.union(v.number(), v.null())),
    matrixAnswers: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { submissionId, questionId, ...answerData } = args;

    // Find existing answer
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_submissionId", (q) => q.eq("submissionId", submissionId))
      .collect();

    const existingAnswer = answers.find((a) => a.questionId === questionId);

    if (existingAnswer) {
      // Update existing answer
      await ctx.db.patch(existingAnswer._id, {
        ...answerData,
        updatedAt: Date.now(),
      });

      return existingAnswer._id;
    } else {
      // Create new answer
      const question = await ctx.db.get(questionId);
      if (!question) {
        throw new Error("Question not found");
      }

      const answerId = await ctx.db.insert("answers", {
        submissionId,
        questionId,
        answerType: question.type,
        textAnswer: answerData.textAnswer || null,
        selectedOption: answerData.selectedOption || null,
        selectedOptions: answerData.selectedOptions || [],
        fileUrl: answerData.fileUrl || null,
        fileName: answerData.fileName || null,
        fileSize: answerData.fileSize || null,
        scaleValue: answerData.scaleValue || null,
        matrixAnswers: answerData.matrixAnswers || null,
        isCorrect: null,
        pointsAwarded: 0,
        pointsPossible: question.points || 0,
        feedback: null,
        aiEvaluation: null,
        markedAt: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return answerId;
    }
  },
});

/**
 * Grade an answer manually
 */
export const gradeAnswer = mutation({
  args: {
    answerId: v.id("answers"),
    pointsAwarded: v.number(),
    feedback: v.optional(v.string()),
    isCorrect: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const answer = await ctx.db.get(args.answerId);
    if (!answer) {
      throw new Error("Answer not found");
    }

    await ctx.db.patch(args.answerId, {
      pointsAwarded: args.pointsAwarded,
      feedback: args.feedback || null,
      isCorrect: args.isCorrect ?? null,
      markedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Recalculate submission total
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_submissionId", (q) => q.eq("submissionId", answer.submissionId))
      .collect();

    const totalMarks = answers.reduce((sum, a) => sum + (a.pointsPossible || 0), 0);
    const awardedMarks = answers.reduce((sum, a) => sum + (a.pointsAwarded || 0), 0);
    const percentage = totalMarks > 0 ? (awardedMarks / totalMarks) * 100 : 0;

    let grade = "F";
    if (percentage >= 90) grade = "A";
    else if (percentage >= 80) grade = "B";
    else if (percentage >= 70) grade = "C";
    else if (percentage >= 60) grade = "D";

    await ctx.db.patch(answer.submissionId, {
      totalMarks,
      awardedMarks,
      percentage,
      grade,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Bulk grade answers
 */
export const bulkGradeAnswers = mutation({
  args: {
    grades: v.array(
      v.object({
        answerId: v.id("answers"),
        pointsAwarded: v.number(),
        feedback: v.optional(v.string()),
        isCorrect: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let submissionId: Id<"submissions"> | null = null;

    for (const grade of args.grades) {
      const answer = await ctx.db.get(grade.answerId);
      if (!answer) continue;

      if (!submissionId) {
        submissionId = answer.submissionId;
      }

      await ctx.db.patch(grade.answerId, {
        pointsAwarded: grade.pointsAwarded,
        feedback: grade.feedback || null,
        isCorrect: grade.isCorrect ?? null,
        markedAt: now,
        updatedAt: now,
      });
    }

    // Recalculate submission total
    if (submissionId) {
      const answers = await ctx.db
        .query("answers")
        .withIndex("by_submissionId", (q) => q.eq("submissionId", submissionId))
        .collect();

      const totalMarks = answers.reduce((sum, a) => sum + (a.pointsPossible || 0), 0);
      const awardedMarks = answers.reduce((sum, a) => sum + (a.pointsAwarded || 0), 0);
      const percentage = totalMarks > 0 ? (awardedMarks / totalMarks) * 100 : 0;

      let grade = "F";
      if (percentage >= 90) grade = "A";
      else if (percentage >= 80) grade = "B";
      else if (percentage >= 70) grade = "C";
      else if (percentage >= 60) grade = "D";

      await ctx.db.patch(submissionId, {
        totalMarks,
        awardedMarks,
        percentage,
        grade,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Save AI evaluation for an answer
 */
export const saveAIEvaluation = mutation({
  args: {
    answerId: v.id("answers"),
    score: v.number(),
    reasoning: v.string(),
    suggestions: v.optional(v.array(v.string())),
    confidence: v.optional(v.number()),
    pointsAwarded: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const answer = await ctx.db.get(args.answerId);
    if (!answer) {
      throw new Error("Answer not found");
    }

    const aiEvaluation = {
      score: args.score,
      reasoning: args.reasoning,
      suggestions: args.suggestions || [],
      confidence: args.confidence || 0.8,
    };

    const updates: Partial<Doc<"answers">> = {
      aiEvaluation,
      updatedAt: Date.now(),
    };

    if (args.pointsAwarded !== undefined) {
      updates.pointsAwarded = args.pointsAwarded;
      updates.markedAt = Date.now();
    }

    await ctx.db.patch(args.answerId, updates);

    return { success: true };
  },
});

/**
 * Clear answer (for resubmission)
 */
export const clearAnswer = mutation({
  args: {
    answerId: v.id("answers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.answerId, {
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
      feedback: null,
      aiEvaluation: null,
      markedAt: null,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Auto-grade a single answer
 */
export const autoGradeAnswer = mutation({
  args: {
    answerId: v.id("answers"),
  },
  handler: async (ctx, args) => {
    const answer = await ctx.db.get(args.answerId);
    if (!answer) {
      throw new Error("Answer not found");
    }

    const question = await ctx.db.get(answer.questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    let isCorrect = false;
    let pointsAwarded = 0;

    // Auto-gradable question types
    if (question.type === "multipleChoice") {
      const correctOptionIndex = question.options.findIndex((opt) => opt.isCorrect);
      isCorrect = answer.selectedOption === correctOptionIndex.toString();
      pointsAwarded = isCorrect ? (question.points || 0) : 0;
    } else if (question.type === "multipleSelect") {
      const correctIndices = question.options
        .map((opt, idx) => (opt.isCorrect ? idx.toString() : null))
        .filter(Boolean) as string[];

      const studentAnswers = answer.selectedOptions || [];
      isCorrect =
        correctIndices.length === studentAnswers.length &&
        correctIndices.every((idx) => studentAnswers.includes(idx));

      pointsAwarded = isCorrect ? (question.points || 0) : 0;
    } else if (question.type === "shortText" && question.correctAnswer) {
      // Case-insensitive comparison for short text
      isCorrect =
        answer.textAnswer?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      pointsAwarded = isCorrect ? (question.points || 0) : 0;
    } else {
      // Cannot auto-grade this question type
      return { success: false, reason: "Question type not auto-gradable" };
    }

    await ctx.db.patch(args.answerId, {
      isCorrect,
      pointsAwarded,
      markedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, isCorrect, pointsAwarded };
  },
});

/**
 * Get answer statistics for a question
 */
export const getQuestionAnswerStats = query({
  args: {
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_questionId", (q) => q.eq("questionId", args.questionId))
      .collect();

    const question = await ctx.db.get(args.questionId);
    if (!question) {
      return null;
    }

    const totalAnswers = answers.length;
    const correctAnswers = answers.filter((a) => a.isCorrect === true).length;
    const incorrectAnswers = answers.filter((a) => a.isCorrect === false).length;
    const unanswered = answers.filter((a) => !a.textAnswer && !a.selectedOption && (!a.selectedOptions || a.selectedOptions.length === 0)).length;

    // For multiple choice, get distribution of answers
    const optionDistribution: Record<string, number> = {};
    if (question.type === "multipleChoice" || question.type === "multipleSelect") {
      question.options.forEach((_, idx) => {
        optionDistribution[idx.toString()] = 0;
      });

      answers.forEach((a) => {
        if (a.selectedOption) {
          optionDistribution[a.selectedOption] = (optionDistribution[a.selectedOption] || 0) + 1;
        }
        if (a.selectedOptions) {
          a.selectedOptions.forEach((opt) => {
            optionDistribution[opt] = (optionDistribution[opt] || 0) + 1;
          });
        }
      });
    }

    return {
      totalAnswers,
      correctAnswers,
      incorrectAnswers,
      unanswered,
      correctPercentage: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
      optionDistribution,
      averagePoints: totalAnswers > 0 ? answers.reduce((sum, a) => sum + (a.pointsAwarded || 0), 0) / totalAnswers : 0,
    };
  },
});
