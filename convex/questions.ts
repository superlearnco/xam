import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all questions for a project
 */
export const getProjectQuestions = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Sort by order
    questions.sort((a, b) => a.order - b.order);

    return questions;
  },
});

/**
 * Get a single question by ID
 */
export const getQuestion = query({
  args: {
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    return question;
  },
});

/**
 * Get questions by type
 */
export const getQuestionsByType = query({
  args: {
    projectId: v.id("projects"),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    return questions.filter((q) => q.type === args.type).sort((a, b) => a.order - b.order);
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new question
 */
export const createQuestion = mutation({
  args: {
    projectId: v.id("projects"),
    type: v.string(),
    questionText: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // If no order specified, add to end
    let order = args.order;
    if (order === undefined) {
      const questions = await ctx.db
        .query("questions")
        .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
        .collect();
      order = questions.length;
    }

    const questionId = await ctx.db.insert("questions", {
      projectId: args.projectId,
      order,
      type: args.type,
      questionText: args.questionText || getDefaultQuestionText(args.type),
      description: null,
      imageUrl: null,
      videoUrl: null,
      points: 1,
      required: true,
      options: args.type === "multipleChoice" || args.type === "multipleSelect" || args.type === "imageChoice"
        ? [
            { text: "Option 1", imageUrl: null, isCorrect: false },
            { text: "Option 2", imageUrl: null, isCorrect: false },
            { text: "Option 3", imageUrl: null, isCorrect: false },
            { text: "Option 4", imageUrl: null, isCorrect: false },
          ]
        : [],
      correctAnswers: [],
      correctAnswer: null,
      modelAnswer: null,
      rubric: [],
      explanation: null,
      randomizeOptions: false,
      allowOther: false,
      minLength: null,
      maxLength: null,
      fileTypes: [],
      maxFileSize: null,
      scaleMin: args.type === "linearScale" ? 1 : null,
      scaleMax: args.type === "linearScale" ? 5 : null,
      scaleMinLabel: null,
      scaleMaxLabel: null,
      matrixRows: args.type === "matrix" ? ["Row 1", "Row 2", "Row 3"] : [],
      matrixColumns: args.type === "matrix" ? ["Column 1", "Column 2", "Column 3"] : [],
      createdAt: now,
      updatedAt: now,
      generatedByAI: false,
      aiGenerationId: null,
      fromQuestionBank: false,
      tags: [],
      difficulty: null,
    });

    // Update project updatedAt
    await ctx.db.patch(args.projectId, {
      updatedAt: now,
    });

    return questionId;
  },
});

/**
 * Update a question
 */
export const updateQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    questionText: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    imageUrl: v.optional(v.union(v.string(), v.null())),
    videoUrl: v.optional(v.union(v.string(), v.null())),
    points: v.optional(v.number()),
    required: v.optional(v.boolean()),
    options: v.optional(
      v.array(
        v.object({
          text: v.optional(v.string()),
          imageUrl: v.optional(v.union(v.string(), v.null())),
          isCorrect: v.optional(v.boolean()),
        })
      )
    ),
    correctAnswers: v.optional(v.array(v.string())),
    correctAnswer: v.optional(v.union(v.string(), v.null())),
    modelAnswer: v.optional(v.union(v.string(), v.null())),
    rubric: v.optional(
      v.array(
        v.object({
          criterion: v.optional(v.string()),
          points: v.optional(v.number()),
          description: v.optional(v.string()),
        })
      )
    ),
    explanation: v.optional(v.union(v.string(), v.null())),
    randomizeOptions: v.optional(v.boolean()),
    allowOther: v.optional(v.boolean()),
    minLength: v.optional(v.union(v.number(), v.null())),
    maxLength: v.optional(v.union(v.number(), v.null())),
    fileTypes: v.optional(v.array(v.string())),
    maxFileSize: v.optional(v.union(v.number(), v.null())),
    scaleMin: v.optional(v.union(v.number(), v.null())),
    scaleMax: v.optional(v.union(v.number(), v.null())),
    scaleMinLabel: v.optional(v.union(v.string(), v.null())),
    scaleMaxLabel: v.optional(v.union(v.string(), v.null())),
    matrixRows: v.optional(v.array(v.string())),
    matrixColumns: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"), v.null())),
  },
  handler: async (ctx, args) => {
    const { questionId, ...updates } = args;
    const question = await ctx.db.get(questionId);

    if (!question) {
      throw new Error("Question not found");
    }

    await ctx.db.patch(questionId, {
      ...updates,
      updatedAt: Date.now(),
    });

    // Update project updatedAt
    await ctx.db.patch(question.projectId, {
      updatedAt: Date.now(),
    });

    return questionId;
  },
});

/**
 * Delete a question
 */
export const deleteQuestion = mutation({
  args: {
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    const projectId = question.projectId;
    const deletedOrder = question.order;

    // Delete the question
    await ctx.db.delete(args.questionId);

    // Reorder remaining questions
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();

    for (const q of questions) {
      if (q.order > deletedOrder) {
        await ctx.db.patch(q._id, {
          order: q.order - 1,
          updatedAt: Date.now(),
        });
      }
    }

    // Update project updatedAt
    await ctx.db.patch(projectId, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Duplicate a question
 */
export const duplicateQuestion = mutation({
  args: {
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    const now = Date.now();
    const { _id, _creationTime, ...questionData } = question;

    // Insert after the original question
    const newOrder = question.order + 1;

    // Shift other questions down
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_projectId", (q) => q.eq("projectId", question.projectId))
      .collect();

    for (const q of questions) {
      if (q.order >= newOrder && q._id !== args.questionId) {
        await ctx.db.patch(q._id, {
          order: q.order + 1,
          updatedAt: now,
        });
      }
    }

    // Create the duplicate
    const newQuestionId = await ctx.db.insert("questions", {
      ...questionData,
      order: newOrder,
      createdAt: now,
      updatedAt: now,
      generatedByAI: false,
      aiGenerationId: null,
    });

    // Update project updatedAt
    await ctx.db.patch(question.projectId, {
      updatedAt: now,
    });

    return newQuestionId;
  },
});

/**
 * Reorder questions
 */
export const reorderQuestions = mutation({
  args: {
    projectId: v.id("projects"),
    questionIds: v.array(v.id("questions")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Update each question with its new order
    for (let i = 0; i < args.questionIds.length; i++) {
      await ctx.db.patch(args.questionIds[i], {
        order: i,
        updatedAt: now,
      });
    }

    // Update project updatedAt
    await ctx.db.patch(args.projectId, {
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Bulk create questions (for AI generation)
 */
export const bulkCreateQuestions = mutation({
  args: {
    projectId: v.id("projects"),
    questions: v.array(
      v.object({
        type: v.string(),
        questionText: v.string(),
        description: v.optional(v.union(v.string(), v.null())),
        points: v.optional(v.number()),
        options: v.optional(
          v.array(
            v.object({
              text: v.string(),
              imageUrl: v.optional(v.union(v.string(), v.null())),
              isCorrect: v.boolean(),
            })
          )
        ),
        correctAnswer: v.optional(v.union(v.string(), v.null())),
        explanation: v.optional(v.union(v.string(), v.null())),
        difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"), v.null())),
      })
    ),
    aiGenerationId: v.optional(v.id("aiGenerations")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const questionIds: Id<"questions">[] = [];

    // Get current question count for ordering
    const existingQuestions = await ctx.db
      .query("questions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    let order = existingQuestions.length;

    for (const questionData of args.questions) {
      const questionId = await ctx.db.insert("questions", {
        projectId: args.projectId,
        order: order++,
        type: questionData.type,
        questionText: questionData.questionText,
        description: questionData.description || null,
        imageUrl: null,
        videoUrl: null,
        points: questionData.points || 1,
        required: true,
        options: questionData.options || [],
        correctAnswers: [],
        correctAnswer: questionData.correctAnswer || null,
        modelAnswer: null,
        rubric: [],
        explanation: questionData.explanation || null,
        randomizeOptions: false,
        allowOther: false,
        minLength: null,
        maxLength: null,
        fileTypes: [],
        maxFileSize: null,
        scaleMin: null,
        scaleMax: null,
        scaleMinLabel: null,
        scaleMaxLabel: null,
        matrixRows: [],
        matrixColumns: [],
        createdAt: now,
        updatedAt: now,
        generatedByAI: true,
        aiGenerationId: args.aiGenerationId || null,
        fromQuestionBank: false,
        tags: [],
        difficulty: questionData.difficulty || null,
      });

      questionIds.push(questionId);
    }

    // Update project updatedAt
    await ctx.db.patch(args.projectId, {
      updatedAt: now,
    });

    return questionIds;
  },
});

/**
 * Add option to a question
 */
export const addOption = mutation({
  args: {
    questionId: v.id("questions"),
    text: v.optional(v.string()),
    imageUrl: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    const newOption = {
      text: args.text || `Option ${question.options.length + 1}`,
      imageUrl: args.imageUrl || null,
      isCorrect: false,
    };

    await ctx.db.patch(args.questionId, {
      options: [...question.options, newOption],
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Remove option from a question
 */
export const removeOption = mutation({
  args: {
    questionId: v.id("questions"),
    optionIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    if (args.optionIndex < 0 || args.optionIndex >= question.options.length) {
      throw new Error("Invalid option index");
    }

    const newOptions = question.options.filter((_, index) => index !== args.optionIndex);

    await ctx.db.patch(args.questionId, {
      options: newOptions,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update option
 */
export const updateOption = mutation({
  args: {
    questionId: v.id("questions"),
    optionIndex: v.number(),
    text: v.optional(v.string()),
    imageUrl: v.optional(v.union(v.string(), v.null())),
    isCorrect: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    if (args.optionIndex < 0 || args.optionIndex >= question.options.length) {
      throw new Error("Invalid option index");
    }

    const newOptions = [...question.options];
    newOptions[args.optionIndex] = {
      ...newOptions[args.optionIndex],
      ...(args.text !== undefined && { text: args.text }),
      ...(args.imageUrl !== undefined && { imageUrl: args.imageUrl }),
      ...(args.isCorrect !== undefined && { isCorrect: args.isCorrect }),
    };

    await ctx.db.patch(args.questionId, {
      options: newOptions,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDefaultQuestionText(type: string): string {
  const defaults: Record<string, string> = {
    multipleChoice: "Select the correct answer",
    multipleSelect: "Select all that apply",
    shortText: "Enter your answer",
    longText: "Provide your response",
    richText: "Write your essay response",
    dropdown: "Choose from the options",
    imageChoice: "Select the correct image",
    fileUpload: "Upload your file",
    ratingScale: "Rate from 1 to 5",
    linearScale: "Select a value on the scale",
    matrix: "Complete the matrix",
    sectionHeader: "Section Title",
    pageBreak: "Page Break",
    infoBlock: "Information",
  };

  return defaults[type] || "Enter your question";
}
