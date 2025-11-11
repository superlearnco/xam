import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all projects for the current user
 */
export const getUserProjects = query({
  args: {
    userId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived"),
      ),
    ),
    type: v.optional(
      v.union(v.literal("test"), v.literal("essay"), v.literal("survey")),
    ),
  },
  handler: async (ctx, args) => {
    let projectsQuery = ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId));

    const projects = await projectsQuery.collect();

    // Filter by status and type if provided
    let filteredProjects = projects;
    if (args.status) {
      filteredProjects = filteredProjects.filter(
        (p) => p.status === args.status,
      );
    }
    if (args.type) {
      filteredProjects = filteredProjects.filter((p) => p.type === args.type);
    }

    // Sort by updatedAt descending
    filteredProjects.sort((a, b) => b.updatedAt - a.updatedAt);

    return filteredProjects;
  },
});

/**
 * Get a single project by ID
 */
export const getProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    return project;
  },
});

/**
 * Get project with questions
 */
export const getProjectWithQuestions = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return null;
    }

    const questions = await ctx.db
      .query("questions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Sort by order
    questions.sort((a, b) => a.order - b.order);

    return {
      ...project,
      questions,
    };
  },
});

/**
 * Get project by access code (for students)
 */
export const getProjectByAccessCode = query({
  args: {
    accessCode: v.string(),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("accessCode"), args.accessCode))
      .first();

    return projects;
  },
});

/**
 * Get project statistics
 */
export const getProjectStats = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return null;
    }

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const markedSubmissions = submissions.filter(
      (s) => s.status === "marked" || s.status === "returned",
    );
    const averageGrade =
      markedSubmissions.length > 0
        ? markedSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0) /
          markedSubmissions.length
        : 0;

    const gradeCounts = {
      "90-100": 0,
      "80-89": 0,
      "70-79": 0,
      "60-69": 0,
      "0-59": 0,
    };

    markedSubmissions.forEach((s) => {
      const percentage = s.percentage || 0;
      if (percentage >= 90) gradeCounts["90-100"]++;
      else if (percentage >= 80) gradeCounts["80-89"]++;
      else if (percentage >= 70) gradeCounts["70-79"]++;
      else if (percentage >= 60) gradeCounts["60-69"]++;
      else gradeCounts["0-59"]++;
    });

    return {
      totalSubmissions: submissions.length,
      markedSubmissions: markedSubmissions.length,
      unmarkedSubmissions: submissions.filter((s) => s.status === "submitted")
        .length,
      averageGrade,
      gradeCounts,
      completionRate:
        submissions.length > 0
          ? (markedSubmissions.length / submissions.length) * 100
          : 0,
    };
  },
});

/**
 * Search projects
 */
export const searchProjects = query({
  args: {
    userId: v.id("users"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const searchLower = args.searchTerm.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower)),
    );
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new project
 */
export const createProject = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("test"), v.literal("essay"), v.literal("survey")),
    useAI: v.optional(v.boolean()),
    aiPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Generate unique access code
    const accessCode = generateAccessCode();

    const projectId = await ctx.db.insert("projects", {
      userId: args.userId,
      name: args.name,
      description: args.description || "",
      type: args.type,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      settings: {
        duration: undefined,
        maxAttempts: 1,
        passingGrade: 70,
        requireAuth: false,
        requireEmailVerification: false,
        passwordProtected: false,
        password: undefined,
        disableCopyPaste: false,
        fullScreenRequired: false,
        blockTabSwitching: false,
        autoGrade: true,
        enableAIMarking: false,
        instantFeedback: false,
        showAnswerKey: false,
        showExplanations: false,
        notifyTeacherOnSubmission: true,
        notifyTeacherDailySummary: false,
        notifyTeacherWhenMarked: false,
        notifyStudentOnSubmission: true,
        notifyStudentOnGradeRelease: true,
        notifyStudentDeadlineReminders: false,
        shuffleQuestions: false,
        dueDate: undefined,
        allowLateSubmissions: true,
      },
      totalMarks: 0,
      submissionCount: 0,
      averageGrade: 0,
      viewCount: 0,
      accessCode,
      publicUrl: `${accessCode}`,
      collaborators: [],
      tags: [],
    });

    return projectId;
  },
});

/**
 * Update project details
 */
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { projectId, ...updates } = args;

    await ctx.db.patch(projectId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return projectId;
  },
});

/**
 * Update project settings
 */
export const updateProjectSettings = mutation({
  args: {
    projectId: v.id("projects"),
    settings: v.object({
      duration: v.optional(v.number()),
      maxAttempts: v.optional(v.number()),
      passingGrade: v.optional(v.number()),
      requireAuth: v.optional(v.boolean()),
      requireEmailVerification: v.optional(v.boolean()),
      passwordProtected: v.optional(v.boolean()),
      password: v.optional(v.string()),
      disableCopyPaste: v.optional(v.boolean()),
      fullScreenRequired: v.optional(v.boolean()),
      blockTabSwitching: v.optional(v.boolean()),
      autoGrade: v.optional(v.boolean()),
      enableAIMarking: v.optional(v.boolean()),
      instantFeedback: v.optional(v.boolean()),
      showAnswerKey: v.optional(v.boolean()),
      showExplanations: v.optional(v.boolean()),
      notifyTeacherOnSubmission: v.optional(v.boolean()),
      notifyTeacherDailySummary: v.optional(v.boolean()),
      notifyTeacherWhenMarked: v.optional(v.boolean()),
      notifyStudentOnSubmission: v.optional(v.boolean()),
      notifyStudentOnGradeRelease: v.optional(v.boolean()),
      notifyStudentDeadlineReminders: v.optional(v.boolean()),
      shuffleQuestions: v.optional(v.boolean()),
      dueDate: v.optional(v.number()),
      allowLateSubmissions: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    await ctx.db.patch(args.projectId, {
      settings: {
        ...project.settings,
        ...args.settings,
      },
      updatedAt: Date.now(),
    });

    return args.projectId;
  },
});

/**
 * Update project status
 */
export const updateProjectStatus = mutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const updates: Partial<Doc<"projects">> = {
      status: args.status,
      updatedAt: now,
    };

    if (args.status === "published") {
      updates.publishedAt = now;
    } else if (args.status === "archived") {
      updates.archivedAt = now;
    }

    await ctx.db.patch(args.projectId, updates);

    return args.projectId;
  },
});

/**
 * Duplicate a project
 */
export const duplicateProject = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const originalProject = await ctx.db.get(args.projectId);
    if (!originalProject) {
      throw new Error("Project not found");
    }

    const now = Date.now();
    const accessCode = generateAccessCode();

    // Create new project
    const newProjectId = await ctx.db.insert("projects", {
      ...originalProject,
      userId: args.userId,
      name: `${originalProject.name} (Copy)`,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      publishedAt: undefined,
      archivedAt: undefined,
      submissionCount: 0,
      averageGrade: 0,
      viewCount: 0,
      accessCode,
      publicUrl: `${accessCode}`,
    });

    // Duplicate questions
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const question of questions) {
      const { _id, _creationTime, ...questionData } = question;
      await ctx.db.insert("questions", {
        ...questionData,
        projectId: newProjectId,
        createdAt: now,
        updatedAt: now,
      });
    }

    return newProjectId;
  },
});

/**
 * Delete a project
 */
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Delete all questions
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const question of questions) {
      await ctx.db.delete(question._id);
    }

    // Delete all submissions
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const submission of submissions) {
      // Delete all answers for this submission
      const answers = await ctx.db
        .query("answers")
        .withIndex("by_submissionId", (q) =>
          q.eq("submissionId", submission._id),
        )
        .collect();

      for (const answer of answers) {
        await ctx.db.delete(answer._id);
      }

      await ctx.db.delete(submission._id);
    }

    // Delete the project
    await ctx.db.delete(args.projectId);

    return { success: true };
  },
});

/**
 * Increment view count
 */
export const incrementViewCount = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    await ctx.db.patch(args.projectId, {
      viewCount: (project.viewCount || 0) + 1,
    });

    return { success: true };
  },
});

/**
 * Recalculate project statistics
 */
export const recalculateProjectStats = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Calculate total marks from questions
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const totalMarks = questions.reduce((sum, q) => sum + (q.points || 0), 0);

    // Calculate average grade from submissions
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const markedSubmissions = submissions.filter(
      (s) => s.status === "marked" || s.status === "returned",
    );
    const averageGrade =
      markedSubmissions.length > 0
        ? markedSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0) /
          markedSubmissions.length
        : 0;

    await ctx.db.patch(args.projectId, {
      totalMarks,
      submissionCount: submissions.length,
      averageGrade,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding similar-looking characters
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
