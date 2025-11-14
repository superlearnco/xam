import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

/**
 * Generate dummy options for a multiple choice question
 */
export const generateOptions = action({
  args: {
    fieldId: v.id("fields"),
    question: v.string(),
    correctAnswer: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get field to verify ownership
    const field = await ctx.runQuery(api.fields.get, { fieldId: args.fieldId });
    if (!field) {
      throw new Error("Field not found");
    }

    // Get project to verify ownership
    const project = await ctx.runQuery(api.projects.get, {
      projectId: field.projectId,
    });
    if (!project) {
      throw new Error("Project not found");
    }

    // Check credits (estimate ~0.5 credits)
    const estimatedCost = 0.5;
    const creditsCheck = await ctx.runQuery(api.credits.checkSufficient, {
      amount: estimatedCost,
    });

    if (!creditsCheck.sufficient) {
      throw new Error(
        `Insufficient credits. You have ${creditsCheck.balance} credits but need ${estimatedCost} credits.`
      );
    }

    // Import AI function dynamically
    const { generateDummyOptions } = await import(
      "../../app/lib/ai/generate-options"
    );

    try {
      // Generate options using AI
      const result = await generateDummyOptions(args.question, args.correctAnswer);

      // Deduct credits
      await ctx.runMutation(api.credits.deductCredits, {
        cost: result.cost,
        feature: "generate_options",
        metadata: {
          projectId: field.projectId,
          model: "xai/grok-beta",
          tokensInput: result.tokensInput,
          tokensOutput: result.tokensOutput,
        },
      });

      // Update field with new options (add to existing options)
      const allOptions = [args.correctAnswer, ...result.options];
      await ctx.runMutation(api.fields.update, {
        fieldId: args.fieldId,
        options: allOptions,
      });

      return {
        success: true,
        options: result.options,
        cost: result.cost,
      };
    } catch (error) {
      console.error("Error generating options:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to generate options"
      );
    }
  },
});

/**
 * Grade a single response using AI
 */
export const gradeResponse = action({
  args: {
    responseId: v.id("responses"),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get response
    const response = await ctx.runQuery(api.responses.get, {
      responseId: args.responseId,
    });
    if (!response) {
      throw new Error("Response not found");
    }

    // Get field
    const field = await ctx.runQuery(api.fields.get, {
      fieldId: response.fieldId,
    });
    if (!field) {
      throw new Error("Field not found");
    }

    // Get project to verify ownership
    const project = await ctx.runQuery(api.projects.get, {
      projectId: field.projectId,
    });
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if response has text content
    if (!response.value || typeof response.value !== "string") {
      throw new Error("Cannot grade non-text response");
    }

    // Estimate cost
    const responseLength = response.value.length;
    const estimatedCost = 1.5; // Rough estimate

    const creditsCheck = await ctx.runQuery(api.credits.checkSufficient, {
      amount: estimatedCost,
    });

    if (!creditsCheck.sufficient) {
      throw new Error(
        `Insufficient credits. You have ${creditsCheck.balance} credits but need at least ${estimatedCost} credits.`
      );
    }

    // Import AI function
    const { gradeResponse: gradeResponseAI } = await import(
      "../../app/lib/ai/grade-response"
    );

    try {
      // Grade using AI
      const result = await gradeResponseAI(
        field.question,
        response.value,
        field.marks || 10,
        field.description, // Use description as rubric
        typeof field.correctAnswer === "string"
          ? field.correctAnswer
          : undefined
      );

      // Deduct credits
      await ctx.runMutation(api.credits.deductCredits, {
        cost: result.cost,
        feature: "grade_response",
        metadata: {
          projectId: field.projectId,
          submissionId: response.submissionId,
          model: "xai/grok-beta",
          tokensInput: result.tokensInput,
          tokensOutput: result.tokensOutput,
        },
      });

      return {
        success: true,
        marks: result.marks,
        maxMarks: result.maxMarks,
        feedback: result.feedback,
        isCorrect: result.isCorrect,
        reasoning: result.reasoning,
        cost: result.cost,
      };
    } catch (error) {
      console.error("Error grading response:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to grade response"
      );
    }
  },
});

/**
 * Bulk grade all text responses for a submission
 */
export const bulkGradeSubmission = action({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get submission
    const submission = await ctx.runQuery(api.submissions.get, {
      submissionId: args.submissionId,
    });
    if (!submission) {
      throw new Error("Submission not found");
    }

    // Get project to verify ownership
    const project = await ctx.runQuery(api.projects.get, {
      projectId: submission.projectId,
    });
    if (!project) {
      throw new Error("Project not found");
    }

    // Get all responses for this submission
    const responses = submission.responses || [];

    // Filter text responses that haven't been marked
    const textResponsesToGrade = responses.filter((r) => {
      const field = submission.fields?.find((f) => f._id === r.fieldId);
      return (
        field &&
        (field.type === "short-text" || field.type === "long-text") &&
        r.marksAwarded === undefined &&
        r.value &&
        typeof r.value === "string" &&
        r.value.trim().length > 0
      );
    });

    if (textResponsesToGrade.length === 0) {
      return {
        success: true,
        gradedCount: 0,
        message: "No text responses to grade",
      };
    }

    // Estimate total cost
    const estimatedCost = textResponsesToGrade.length * 1.5;

    const creditsCheck = await ctx.runQuery(api.credits.checkSufficient, {
      amount: estimatedCost,
    });

    if (!creditsCheck.sufficient) {
      throw new Error(
        `Insufficient credits. You have ${creditsCheck.balance} credits but need approximately ${estimatedCost} credits.`
      );
    }

    // Import AI function
    const { gradeResponse: gradeResponseAI } = await import(
      "../../app/lib/ai/grade-response"
    );

    let totalCost = 0;
    let gradedCount = 0;

    // Grade each response
    for (const response of textResponsesToGrade) {
      try {
        const field = submission.fields?.find((f) => f._id === response.fieldId);
        if (!field) continue;

        // Grade using AI
        const result = await gradeResponseAI(
          field.question,
          response.value as string,
          field.marks || 10,
          field.description,
          typeof field.correctAnswer === "string"
            ? field.correctAnswer
            : undefined
        );

        // Mark the response
        await ctx.runMutation(api.responses.mark, {
          responseId: response._id,
          marksAwarded: result.marks,
          feedback: result.feedback,
          isCorrect: result.isCorrect,
        });

        totalCost += result.cost;
        gradedCount++;

        // Deduct credits for this response
        await ctx.runMutation(api.credits.deductCredits, {
          cost: result.cost,
          feature: "bulk_grade",
          metadata: {
            projectId: submission.projectId,
            submissionId: args.submissionId,
            model: "xai/grok-beta",
            tokensInput: result.tokensInput,
            tokensOutput: result.tokensOutput,
          },
        });
      } catch (error) {
        console.error(`Error grading response ${response._id}:`, error);
        // Continue with other responses
      }
    }

    return {
      success: true,
      gradedCount,
      totalCost,
      message: `Successfully graded ${gradedCount} response(s)`,
    };
  },
});

/**
 * Create an entire test using AI
 */
export const createTest = action({
  args: {
    projectId: v.id("projects"),
    subject: v.string(),
    topic: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    questionCount: v.number(),
    instructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get project to verify ownership
    const project = await ctx.runQuery(api.projects.get, {
      projectId: args.projectId,
    });
    if (!project) {
      throw new Error("Project not found");
    }

    // Estimate cost (expensive operation)
    const estimatedCost = args.questionCount * 3;

    const creditsCheck = await ctx.runQuery(api.credits.checkSufficient, {
      amount: estimatedCost,
    });

    if (!creditsCheck.sufficient) {
      throw new Error(
        `Insufficient credits. You have ${creditsCheck.balance} credits but need approximately ${estimatedCost} credits.`
      );
    }

    // Import AI function
    const { createTest: createTestAI } = await import(
      "../../app/lib/ai/create-test"
    );

    try {
      // Generate test using AI
      const result = await createTestAI(
        args.subject,
        args.topic,
        args.difficulty,
        args.questionCount,
        args.instructions
      );

      // Create fields in database
      const fieldIds: string[] = [];
      for (let i = 0; i < result.questions.length; i++) {
        const question = result.questions[i];

        // Map AI question types to our field types
        let fieldType:
          | "short-text"
          | "long-text"
          | "multiple-choice"
          | "checkbox" = "short-text";
        if (question.type === "multiple-choice") fieldType = "multiple-choice";
        else if (question.type === "checkbox") fieldType = "checkbox";
        else if (question.type === "long-text") fieldType = "long-text";

        const fieldId = await ctx.runMutation(api.fields.create, {
          projectId: args.projectId,
          type: fieldType,
          question: question.question,
          description: question.description || question.rubric,
          marks: question.marks,
          required: true,
          options: question.options,
          correctAnswer: question.correctAnswer,
        });

        fieldIds.push(fieldId);
      }

      // Deduct credits
      await ctx.runMutation(api.credits.deductCredits, {
        cost: result.cost,
        feature: "generate_test",
        metadata: {
          projectId: args.projectId,
          model: "xai/grok-beta",
          tokensInput: result.tokensInput,
          tokensOutput: result.tokensOutput,
        },
      });

      // Update project description if provided
      if (result.description) {
        await ctx.runMutation(api.projects.update, {
          projectId: args.projectId,
          description: result.description,
        });
      }

      return {
        success: true,
        fieldIds,
        questionCount: result.questions.length,
        totalMarks: result.totalMarks,
        cost: result.cost,
      };
    } catch (error) {
      console.error("Error creating test:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to create test"
      );
    }
  },
});

