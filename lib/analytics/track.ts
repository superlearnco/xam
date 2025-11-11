"use client";

/**
 * Analytics tracking utilities for Xam
 * Integrates with Databuddy and internal analytics
 */

// Event types for tracking
export type AnalyticsEvent =
  // Page views
  | "page_view"
  | "landing_page_view"
  | "pricing_page_view"
  | "dashboard_view"

  // Landing page interactions
  | "get_started_clicked"
  | "watch_demo_clicked"
  | "feature_card_clicked"

  // Authentication events
  | "signup_started"
  | "signup_completed"
  | "signin_completed"
  | "signout"

  // Project lifecycle
  | "project_created"
  | "project_opened"
  | "project_published"
  | "project_archived"
  | "project_deleted"
  | "share_link_copied"
  | "qr_code_generated"

  // Question events
  | "question_created"
  | "question_edited"
  | "question_deleted"

  // AI features
  | "ai_generation_requested"
  | "ai_generation_completed"
  | "ai_grading_used"

  // Test taking
  | "test_started"
  | "test_question_answered"
  | "test_question_flagged"
  | "test_submitted"
  | "test_navigation"

  // Marking events
  | "marking_page_opened"
  | "submission_marked"
  | "feedback_sent"
  | "grades_exported"

  // Billing events
  | "plan_card_clicked"
  | "checkout_initiated"
  | "payment_completed"
  | "payment_failed"
  | "subscription_cancelled"
  | "credits_purchased"

  // Other
  | "template_used"
  | "question_bank_item_added"
  | "submission_viewed";

export interface AnalyticsEventData {
  [key: string]: string | number | boolean | undefined;
}

// Track event with Databuddy
export function trackEvent(
  eventName: AnalyticsEvent,
  eventData?: AnalyticsEventData,
) {
  try {
    // Track with Databuddy if available
    if (typeof window !== "undefined" && (window as any).databuddy) {
      (window as any).databuddy.track(eventName, eventData);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics]", eventName, eventData);
    }
  } catch (error) {
    console.error("Error tracking event:", error);
  }
}

// Track page view
export function trackPageView(pagePath: string, pageTitle?: string) {
  try {
    if (typeof window !== "undefined" && (window as any).databuddy) {
      (window as any).databuddy.page(pagePath, {
        title: pageTitle,
      });
    }

    trackEvent("page_view", {
      path: pagePath,
      title: pageTitle || "",
    });
  } catch (error) {
    console.error("Error tracking page view:", error);
  }
}

// Track user identification
export function identifyUser(userId: string, traits?: Record<string, any>) {
  try {
    if (typeof window !== "undefined" && (window as any).databuddy) {
      (window as any).databuddy.identify(userId, traits);
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics] Identify user:", userId, traits);
    }
  } catch (error) {
    console.error("Error identifying user:", error);
  }
}

// Project-related analytics
export const projectAnalytics = {
  created: (projectId: string, projectType: string) => {
    trackEvent("project_created", {
      projectId,
      projectType,
    });
  },

  published: (projectId: string, questionCount: number) => {
    trackEvent("project_published", {
      projectId,
      questionCount,
    });
  },

  deleted: (projectId: string) => {
    trackEvent("project_deleted", {
      projectId,
    });
  },
};

// Question-related analytics
export const questionAnalytics = {
  created: (projectId: string, questionType: string, aiGenerated: boolean) => {
    trackEvent("question_created", {
      projectId,
      questionType,
      aiGenerated,
    });
  },

  edited: (questionId: string, questionType: string) => {
    trackEvent("question_edited", {
      questionId,
      questionType,
    });
  },

  deleted: (questionId: string) => {
    trackEvent("question_deleted", {
      questionId,
    });
  },
};

// AI-related analytics
export const aiAnalytics = {
  generationRequested: (
    operationType: string,
    credits: number,
    params?: Record<string, any>,
  ) => {
    trackEvent("ai_generation_requested", {
      operationType,
      credits,
      ...params,
    });
  },

  generationCompleted: (
    operationType: string,
    success: boolean,
    tokensUsed?: number,
  ) => {
    trackEvent("ai_generation_completed", {
      operationType,
      success,
      tokensUsed,
    });
  },
};

// Test/submission analytics
export const testAnalytics = {
  started: (projectId: string, studentEmail?: string) => {
    trackEvent("test_started", {
      projectId,
      studentEmail: studentEmail || "anonymous",
    });
  },

  submitted: (
    submissionId: string,
    projectId: string,
    timeSpent: number,
    score?: number,
  ) => {
    trackEvent("test_submitted", {
      submissionId,
      projectId,
      timeSpent,
      score,
    });
  },

  graded: (submissionId: string, autoGraded: boolean, score: number) => {
    trackEvent("test_graded", {
      submissionId,
      autoGraded,
      score,
    });
  },

  viewed: (submissionId: string) => {
    trackEvent("submission_viewed", {
      submissionId,
    });
  },
};

// User authentication analytics
export const userAnalytics = {
  signedUp: (userId: string, method: string) => {
    trackEvent("user_signed_up", {
      userId,
      method,
    });
  },

  signedIn: (userId: string, method: string) => {
    trackEvent("user_signed_in", {
      userId,
      method,
    });
  },
};

// Billing analytics
export const billingAnalytics = {
  subscriptionUpgraded: (userId: string, fromTier: string, toTier: string) => {
    trackEvent("subscription_upgraded", {
      userId,
      fromTier,
      toTier,
    });
  },

  creditsPurchased: (userId: string, amount: number, credits: number) => {
    trackEvent("credits_purchased", {
      userId,
      amount,
      credits,
    });
  },
};

// Template/Question Bank analytics
export const libraryAnalytics = {
  templateUsed: (templateId: string, templateType: string) => {
    trackEvent("template_used", {
      templateId,
      templateType,
    });
  },

  questionBankItemAdded: (questionBankId: string, questionType: string) => {
    trackEvent("question_bank_item_added", {
      questionBankId,
      questionType,
    });
  },
};

// Landing page analytics
export const landingPageAnalytics = {
  getStartedClicked: (location: string) => {
    trackEvent("get_started_clicked", { location });
  },

  watchDemoClicked: () => {
    trackEvent("watch_demo_clicked", {});
  },

  featureCardClicked: (featureName: string) => {
    trackEvent("feature_card_clicked", { featureName });
  },
};

// Authentication analytics
export const authAnalytics = {
  signupStarted: (method: string) => {
    trackEvent("signup_started", { method });
  },

  signupCompleted: (userId: string, method: string) => {
    trackEvent("signup_completed", { userId, method });
    identifyUser(userId, { signupMethod: method });
  },

  signinCompleted: (userId: string, method: string) => {
    trackEvent("signin_completed", { userId, method });
  },

  signout: (userId: string) => {
    trackEvent("signout", { userId });
  },
};

// Enhanced project analytics
export const enhancedProjectAnalytics = {
  opened: (projectId: string, projectType: string) => {
    trackEvent("project_opened", { projectId, projectType });
  },

  archived: (projectId: string) => {
    trackEvent("project_archived", { projectId });
  },

  shareLinkCopied: (projectId: string) => {
    trackEvent("share_link_copied", { projectId });
  },

  qrCodeGenerated: (projectId: string) => {
    trackEvent("qr_code_generated", { projectId });
  },
};

// Test taking analytics
export const testTakingAnalytics = {
  questionAnswered: (
    submissionId: string,
    questionId: string,
    timeSpent: number,
  ) => {
    trackEvent("test_question_answered", {
      submissionId,
      questionId,
      timeSpent,
    });
  },

  questionFlagged: (submissionId: string, questionId: string) => {
    trackEvent("test_question_flagged", { submissionId, questionId });
  },

  navigation: (
    submissionId: string,
    fromQuestion: number,
    toQuestion: number,
  ) => {
    trackEvent("test_navigation", {
      submissionId,
      fromQuestion,
      toQuestion,
    });
  },
};

// Marking analytics
export const markingAnalytics = {
  pageOpened: (projectId: string, submissionCount: number) => {
    trackEvent("marking_page_opened", { projectId, submissionCount });
  },

  submissionMarked: (
    submissionId: string,
    projectId: string,
    timeSpent: number,
  ) => {
    trackEvent("submission_marked", { submissionId, projectId, timeSpent });
  },

  aiGradingUsed: (submissionId: string, questionCount: number) => {
    trackEvent("ai_grading_used", { submissionId, questionCount });
  },

  feedbackSent: (submissionId: string) => {
    trackEvent("feedback_sent", { submissionId });
  },

  gradesExported: (projectId: string, format: string, count: number) => {
    trackEvent("grades_exported", { projectId, format, count });
  },
};

// Enhanced billing analytics
export const enhancedBillingAnalytics = {
  pricingPageViewed: () => {
    trackEvent("pricing_page_view", {});
  },

  planCardClicked: (planName: string, price: number) => {
    trackEvent("plan_card_clicked", { planName, price });
  },

  checkoutInitiated: (productId: string, amount: number) => {
    trackEvent("checkout_initiated", { productId, amount });
  },

  paymentCompleted: (userId: string, amount: number, credits: number) => {
    trackEvent("payment_completed", { userId, amount, credits });
  },

  paymentFailed: (userId: string, amount: number, reason?: string) => {
    trackEvent("payment_failed", { userId, amount, reason });
  },

  subscriptionCancelled: (userId: string, planName: string) => {
    trackEvent("subscription_cancelled", { userId, planName });
  },
};

// Track time spent on a page/activity
export function trackTimeSpent(
  activityName: string,
  startTime: number,
  metadata?: Record<string, any>,
) {
  const timeSpent = Date.now() - startTime;
  trackEvent("page_view", {
    activity: activityName,
    timeSpent,
    ...metadata,
  });
}

// Initialize Databuddy on client-side
export function initializeDatabuddy() {
  if (typeof window === "undefined") return;

  const siteId = process.env.NEXT_PUBLIC_DATABUDDY_SITE_ID;

  if (!siteId) {
    console.warn("Databuddy site ID not configured");
    return;
  }

  // Load Databuddy script
  const script = document.createElement("script");
  script.src = "https://cdn.databuddy.com/tracker.js";
  script.async = true;
  script.setAttribute("data-site-id", siteId);

  document.head.appendChild(script);

  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics] Databuddy initialized");
  }
}
