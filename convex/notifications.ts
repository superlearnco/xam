import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all notifications for a user
 */
export const getUserNotifications = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    let notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    if (args.unreadOnly) {
      notifications = notifications.filter((n) => !n.read);
    }

    return notifications;
  },
});

/**
 * Get unread notification count
 */
export const getUnreadCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const unreadCount = notifications.filter((n) => !n.read).length;

    return unreadCount;
  },
});

/**
 * Get a single notification
 */
export const getNotification = query({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    return notification;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a notification
 */
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("submission_received"),
      v.literal("grading_complete"),
      v.literal("payment_success"),
      v.literal("credits_low"),
      v.literal("plan_renewal"),
      v.literal("system_alert"),
      v.literal("collaboration_invite"),
    ),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      link: args.link || null,
      read: false,
      readAt: null,
      createdAt: now,
    });

    return notificationId;
  },
});

/**
 * Mark notification as read
 */
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      read: true,
      readAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Mark all notifications as read
 */
export const markAllAsRead = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const now = Date.now();

    for (const notification of notifications) {
      if (!notification.read) {
        await ctx.db.patch(notification._id, {
          read: true,
          readAt: now,
        });
      }
    }

    return { success: true, count: notifications.filter((n) => !n.read).length };
  },
});

/**
 * Delete a notification
 */
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
    return { success: true };
  },
});

/**
 * Delete all notifications for a user
 */
export const deleteAllNotifications = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    return { success: true, count: notifications.length };
  },
});

/**
 * Delete read notifications older than X days
 */
export const deleteOldNotifications = mutation({
  args: {
    userId: v.id("users"),
    daysOld: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysOld = args.daysOld || 30;
    const cutoffDate = Date.now() - daysOld * 24 * 60 * 60 * 1000;

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    let deletedCount = 0;

    for (const notification of notifications) {
      if (notification.read && notification.createdAt < cutoffDate) {
        await ctx.db.delete(notification._id);
        deletedCount++;
      }
    }

    return { success: true, count: deletedCount };
  },
});

// ============================================================================
// NOTIFICATION CREATION HELPERS
// ============================================================================

/**
 * Notify teacher of new submission
 */
export const notifySubmissionReceived = mutation({
  args: {
    teacherId: v.id("users"),
    projectId: v.id("projects"),
    studentName: v.string(),
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if teacher wants this notification
    if (!project.settings.notifyTeacherOnSubmission) {
      return { success: false, reason: "Notifications disabled" };
    }

    await ctx.db.insert("notifications", {
      userId: args.teacherId,
      type: "submission_received",
      title: "New Submission Received",
      message: `${args.studentName} submitted "${project.name}"`,
      link: `/app/${args.projectId}/mark/${args.submissionId}`,
      read: false,
      readAt: null,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Notify student that grading is complete
 */
export const notifyGradingComplete = mutation({
  args: {
    studentId: v.optional(v.id("users")),
    studentEmail: v.string,
    projectId: v.id("projects"),
    submissionId: v.id("submissions"),
    grade: v.string(),
    percentage: v.number(),
  },
  handler: async (ctx, args) => {
    // Only notify if student has an account
    if (!args.studentId) {
      return { success: false, reason: "Student has no account" };
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if notifications are enabled
    if (!project.settings.notifyStudentOnGradeRelease) {
      return { success: false, reason: "Notifications disabled" };
    }

    await ctx.db.insert("notifications", {
      userId: args.studentId,
      type: "grading_complete",
      title: "Your Test Has Been Graded",
      message: `You received ${args.grade} (${args.percentage.toFixed(1)}%) on "${project.name}"`,
      link: `/test/${args.submissionId}/results`,
      read: false,
      readAt: null,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Notify user of successful payment
 */
export const notifyPaymentSuccess = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    credits: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "payment_success",
      title: "Payment Successful",
      message: `Your payment of $${args.amount.toFixed(2)} was successful. ${args.credits} credits added to your account.`,
      link: "/app/billing",
      read: false,
      readAt: null,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Notify user of low credits
 */
export const notifyCreditsLow = mutation({
  args: {
    userId: v.id("users"),
    remainingCredits: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if user already has an unread low credits notification
    const existingNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const hasUnreadLowCreditsNotification = existingNotifications.some(
      (n) => n.type === "credits_low" && !n.read,
    );

    if (hasUnreadLowCreditsNotification) {
      return { success: false, reason: "Already has unread low credits notification" };
    }

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "credits_low",
      title: "Credits Running Low",
      message: `You have ${args.remainingCredits} credits remaining. Purchase more to continue using AI features.`,
      link: "/app/billing",
      read: false,
      readAt: null,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Notify user of upcoming plan renewal
 */
export const notifyPlanRenewal = mutation({
  args: {
    userId: v.id("users"),
    planName: v.string(),
    renewalDate: v.number(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const daysUntilRenewal = Math.ceil((args.renewalDate - Date.now()) / (1000 * 60 * 60 * 24));

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "plan_renewal",
      title: "Upcoming Plan Renewal",
      message: `Your ${args.planName} plan will renew in ${daysUntilRenewal} days for $${args.amount.toFixed(2)}.`,
      link: "/app/billing",
      read: false,
      readAt: null,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Create system alert notification
 */
export const notifySystemAlert = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "system_alert",
      title: args.title,
      message: args.message,
      link: args.link || null,
      read: false,
      readAt: null,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
