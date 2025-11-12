import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  generateQuestions,
  generateDistractors,
  generateExplanation,
  gradeOpenEndedAnswer,
  suggestQuestionImprovements,
  calculateCreditsFromTokens,
} from "../lib/ai/gemini";

// ============================================================================
// AI QUESTION GENERATION
// ============================================================================

/**
 * Generate questions using AI
 */
export const generateQuestionsAction = action({
  args: {
    topic: v.string(),
    subject: v.optional(v.string()),
    difficulty: v.optional(
      v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    ),
    questionTypes: v.array(v.string()),
    count: v.optional(v.number()),
    additionalContext: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get user from database
    const user = await ctx.runQuery(internal.users.getUserByClerkIdInternal, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Estimate credits needed (2 credits per question)
    const estimatedCredits = (args.count || 5) * 2;

    // Check if user has enough credits
    if (user.credits < estimatedCredits) {
      throw new Error(
        `Insufficient credits. Required: ${estimatedCredits}, Available: ${user.credits}`,
      );
    }

    try {
      // Call Gemini API
      const result = await generateQuestions({
        topic: args.topic,
        subject: args.subject,
        difficulty: args.difficulty,
        questionTypes: args.questionTypes,
        count: args.count,
        additionalContext: args.additionalContext,
      });

      // Calculate actual credits used based on tokens
      const creditsUsed = calculateCreditsFromTokens(result.tokensUsed);

      // Deduct credits and log generation
      await ctx.runMutation(internal.ai.deductCreditsAndLog, {
        userId: user._id,
        creditsUsed,
        tokensUsed: result.tokensUsed,
        type: "questions",
        prompt: JSON.stringify(args),
        result: JSON.stringify(result.questions),
        projectId: args.projectId,
        success: true,
      });

      return {
        questions: result.questions,
        creditsUsed,
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      // Log failed attempt
      await ctx.runMutation(internal.ai.logFailedGeneration, {
        userId: user._id,
        type: "questions",
        prompt: JSON.stringify(args),
        error: error instanceof Error ? error.message : "Unknown error",
        projectId: args.projectId,
      });

      throw error;
    }
  },
});

// ============================================================================
// AI DISTRACTOR GENERATION
// ============================================================================

/**
 * Generate distractor options for multiple choice questions
 */
export const generateDistractorsAction = action({
  args: {
    questionText: v.string(),
    correctAnswer: v.string(),
    count: v.optional(v.number()),
    difficulty: v.optional(
      v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    ),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.runQuery(internal.users.getUserByClerkIdInternal, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Estimate credits needed (1 credit for distractors)
    const estimatedCredits = 1;

    if (user.credits < estimatedCredits) {
      throw new Error(
        `Insufficient credits. Required: ${estimatedCredits}, Available: ${user.credits}`,
      );
    }

    try {
      const result = await generateDistractors({
        questionText: args.questionText,
        correctAnswer: args.correctAnswer,
        count: args.count,
        difficulty: args.difficulty,
      });

      const creditsUsed = Math.max(
        1,
        calculateCreditsFromTokens(result.tokensUsed),
      );

      await ctx.runMutation(internal.ai.deductCreditsAndLog, {
        userId: user._id,
        creditsUsed,
        tokensUsed: result.tokensUsed,
        type: "distractors",
        prompt: JSON.stringify(args),
        result: JSON.stringify(result.distractors),
        projectId: args.projectId,
        success: true,
      });

      return {
        distractors: result.distractors,
        creditsUsed,
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      await ctx.runMutation(internal.ai.logFailedGeneration, {
        userId: user._id,
        type: "distractors",
        prompt: JSON.stringify(args),
        error: error instanceof Error ? error.message : "Unknown error",
        projectId: args.projectId,
      });

      throw error;
    }
  },
});

// ============================================================================
// AI EXPLANATION GENERATION
// ============================================================================

/**
 * Generate explanation for a question
 */
export const generateExplanationAction = action({
  args: {
    questionText: v.string(),
    correctAnswer: v.string(),
    questionType: v.string(),
    difficulty: v.optional(
      v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    ),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.runQuery(internal.users.getUserByClerkIdInternal, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const estimatedCredits = 1;

    if (user.credits < estimatedCredits) {
      throw new Error(
        `Insufficient credits. Required: ${estimatedCredits}, Available: ${user.credits}`,
      );
    }

    try {
      const result = await generateExplanation({
        questionText: args.questionText,
        correctAnswer: args.correctAnswer,
        questionType: args.questionType,
        difficulty: args.difficulty,
      });

      const creditsUsed = Math.max(
        1,
        calculateCreditsFromTokens(result.tokensUsed),
      );

      await ctx.runMutation(internal.ai.deductCreditsAndLog, {
        userId: user._id,
        creditsUsed,
        tokensUsed: result.tokensUsed,
        type: "explanations",
        prompt: JSON.stringify(args),
        result: result.explanation,
        projectId: args.projectId,
        success: true,
      });

      return {
        explanation: result.explanation,
        creditsUsed,
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      await ctx.runMutation(internal.ai.logFailedGeneration, {
        userId: user._id,
        type: "explanations",
        prompt: JSON.stringify(args),
        error: error instanceof Error ? error.message : "Unknown error",
        projectId: args.projectId,
      });

      throw error;
    }
  },
});

// ============================================================================
// AI GRADING
// ============================================================================

/**
 * Grade an open-ended answer using AI
 */
export const gradeAnswerAction = action({
  args: {
    questionId: v.id("questions"),
    answerId: v.id("answers"),
    questionText: v.string(),
    modelAnswer: v.string(),
    studentAnswer: v.string(),
    maxPoints: v.number(),
    questionType: v.string(),
    rubric: v.optional(
      v.array(
        v.object({
          criterion: v.string(),
          points: v.number(),
          description: v.string(),
        }),
      ),
    ),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.runQuery(internal.users.getUserByClerkIdInternal, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Grading is more expensive (3-5 credits depending on answer length)
    const answerLength = args.studentAnswer.length;
    let estimatedCredits = 3;
    if (answerLength > 500) estimatedCredits = 4;
    if (answerLength > 1000) estimatedCredits = 6;

    if (user.credits < estimatedCredits) {
      throw new Error(
        `Insufficient credits. Required: ~${estimatedCredits}, Available: ${user.credits}`,
      );
    }

    try {
      const result = await gradeOpenEndedAnswer({
        questionText: args.questionText,
        modelAnswer: args.modelAnswer,
        studentAnswer: args.studentAnswer,
        rubric: args.rubric,
        maxPoints: args.maxPoints,
        questionType: args.questionType,
      });

      const creditsUsed = Math.max(
        3,
        calculateCreditsFromTokens(result.tokensUsed),
      );

      await ctx.runMutation(internal.ai.deductCreditsAndLog, {
        userId: user._id,
        creditsUsed,
        tokensUsed: result.tokensUsed,
        type: "grading",
        prompt: JSON.stringify({
          questionText: args.questionText,
          answerLength,
        }),
        result: JSON.stringify(result.grading),
        projectId: args.projectId,
        success: true,
      });

      // Update the answer with AI grading results
      await ctx.runMutation(internal.ai.updateAnswerWithAIGrading, {
        answerId: args.answerId,
        pointsAwarded: result.grading.pointsEarned,
        feedback: result.grading.feedback,
        aiEvaluation: {
          score: result.grading.pointsEarned,
          reasoning: result.grading.feedback,
          suggestions: result.grading.improvements || [],
          confidence: result.grading.confidence || 0.8,
        },
      });

      return {
        grading: result.grading,
        creditsUsed,
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      await ctx.runMutation(internal.ai.logFailedGeneration, {
        userId: user._id,
        type: "grading",
        prompt: JSON.stringify({ questionText: args.questionText }),
        error: error instanceof Error ? error.message : "Unknown error",
        projectId: args.projectId,
      });

      throw error;
    }
  },
});

/**
 * Batch grade multiple answers
 */
export const batchGradeAnswersAction = action({
  args: {
    submissionId: v.id("submissions"),
    projectId: v.id("projects"),
    answers: v.array(
      v.object({
        answerId: v.id("answers"),
        questionId: v.id("questions"),
        questionText: v.string(),
        modelAnswer: v.string(),
        studentAnswer: v.string(),
        maxPoints: v.number(),
        questionType: v.string(),
        rubric: v.optional(
          v.array(
            v.object({
              criterion: v.string(),
              points: v.number(),
              description: v.string(),
            }),
          ),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.runQuery(internal.users.getUserByClerkIdInternal, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Estimate total credits needed
    const estimatedCreditsPerAnswer = 4;
    const totalEstimatedCredits =
      args.answers.length * estimatedCreditsPerAnswer;

    if (user.credits < totalEstimatedCredits) {
      throw new Error(
        `Insufficient credits. Required: ~${totalEstimatedCredits}, Available: ${user.credits}`,
      );
    }

    const results = [];
    let totalCreditsUsed = 0;

    // Grade each answer sequentially
    for (const answer of args.answers) {
      try {
        const result = await gradeOpenEndedAnswer({
          questionText: answer.questionText,
          modelAnswer: answer.modelAnswer,
          studentAnswer: answer.studentAnswer,
          rubric: answer.rubric,
          maxPoints: answer.maxPoints,
          questionType: answer.questionType,
        });

        const creditsUsed = Math.max(
          3,
          calculateCreditsFromTokens(result.tokensUsed),
        );
        totalCreditsUsed += creditsUsed;

        // Update the answer
        await ctx.runMutation(internal.ai.updateAnswerWithAIGrading, {
          answerId: answer.answerId,
          pointsAwarded: result.grading.pointsEarned,
          feedback: result.grading.feedback,
          aiEvaluation: {
            score: result.grading.pointsEarned,
            reasoning: result.grading.feedback,
            suggestions: result.grading.improvements || [],
            confidence: result.grading.confidence || 0.8,
          },
        });

        results.push({
          answerId: answer.answerId,
          grading: result.grading,
          creditsUsed,
          success: true,
        });
      } catch (error) {
        results.push({
          answerId: answer.answerId,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        });
      }
    }

    // Deduct total credits and log
    await ctx.runMutation(internal.ai.deductCreditsAndLog, {
      userId: user._id,
      creditsUsed: totalCreditsUsed,
      tokensUsed: results.reduce((sum, r) => sum + (r.success ? 1000 : 0), 0),
      type: "grading",
      prompt: `Batch grading ${args.answers.length} answers`,
      result: JSON.stringify(results),
      projectId: args.projectId,
      success: true,
    });

    return {
      results,
      totalCreditsUsed,
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
    };
  },
});

// ============================================================================
// AI QUESTION IMPROVEMENT
// ============================================================================

/**
 * Get AI suggestions for improving a question
 */
export const improveQuestionAction = action({
  args: {
    questionText: v.string(),
    questionType: v.string(),
    options: v.optional(
      v.array(
        v.object({
          text: v.string(),
          isCorrect: v.boolean(),
        }),
      ),
    ),
    difficulty: v.optional(
      v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    ),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.runQuery(internal.users.getUserByClerkIdInternal, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const estimatedCredits = 2;

    if (user.credits < estimatedCredits) {
      throw new Error(
        `Insufficient credits. Required: ${estimatedCredits}, Available: ${user.credits}`,
      );
    }

    try {
      const result = await suggestQuestionImprovements({
        questionText: args.questionText,
        questionType: args.questionType,
        options: args.options,
        difficulty: args.difficulty,
      });

      const creditsUsed = Math.max(
        2,
        calculateCreditsFromTokens(result.tokensUsed),
      );

      await ctx.runMutation(internal.ai.deductCreditsAndLog, {
        userId: user._id,
        creditsUsed,
        tokensUsed: result.tokensUsed,
        type: "grading",
        prompt: JSON.stringify(args),
        result: JSON.stringify(result.improvements),
        projectId: args.projectId,
        success: true,
      });

      return {
        improvements: result.improvements,
        creditsUsed,
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      await ctx.runMutation(internal.ai.logFailedGeneration, {
        userId: user._id,
        type: "grading",
        prompt: JSON.stringify(args),
        error: error instanceof Error ? error.message : "Unknown error",
        projectId: args.projectId,
      });

      throw error;
    }
  },
});

// ============================================================================
// INTERNAL MUTATIONS
// ============================================================================

/**
 * Internal mutation to deduct credits and log AI generation
 */
export const deductCreditsAndLog = internalMutation({
  args: {
    userId: v.id("users"),
    creditsUsed: v.number(),
    tokensUsed: v.number(),
    type: v.union(
      v.literal("questions"),
      v.literal("distractors"),
      v.literal("explanations"),
      v.literal("grading"),
    ),
    prompt: v.string(),
    result: v.string(),
    projectId: v.optional(v.id("projects")),
    success: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Get current user
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Deduct credits
    await ctx.db.patch(args.userId, {
      credits: Math.max(0, user.credits - args.creditsUsed),
      updatedAt: Date.now(),
    });

    // Log generation
    await ctx.db.insert("aiGenerations", {
      userId: args.userId,
      projectId: args.projectId,
      type: args.type,
      prompt: args.prompt,
      result: args.result,
      model: "gemini-2.0-flash-exp",
      tokensUsed: args.tokensUsed,
      creditsDeducted: args.creditsUsed,
      success: args.success,
      createdAt: Date.now(),
    });
  },
});

/**
 * Internal mutation to log failed generation
 */
export const logFailedGeneration = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("questions"),
      v.literal("distractors"),
      v.literal("explanations"),
      v.literal("grading"),
    ),
    prompt: v.string(),
    error: v.string(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("aiGenerations", {
      userId: args.userId,
      projectId: args.projectId,
      type: args.type,
      prompt: args.prompt,
      result: "",
      model: "gemini-2.0-flash-exp",
      tokensUsed: 0,
      creditsDeducted: 0,
      success: false,
      error: args.error,
      createdAt: Date.now(),
    });
  },
});

/**
 * Internal mutation to update answer with AI grading
 */
export const updateAnswerWithAIGrading = internalMutation({
  args: {
    answerId: v.id("answers"),
    pointsAwarded: v.number(),
    feedback: v.string(),
    aiEvaluation: v.object({
      score: v.number(),
      reasoning: v.string(),
      suggestions: v.array(v.string()),
      confidence: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const answer = await ctx.db.get(args.answerId);
    if (!answer) {
      throw new Error("Answer not found");
    }

    await ctx.db.patch(args.answerId, {
      pointsAwarded: args.pointsAwarded,
      feedback: args.feedback,
      aiEvaluation: args.aiEvaluation,
      markedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get AI generation history for user
 */
export const getAIGenerationHistory = internalMutation({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("aiGenerations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 50);

    return history;
  },
});
