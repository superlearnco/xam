"use client";

/**
 * Analytics tracking utilities for Xam
 * Integrates with Databuddy and internal analytics
 */

// Event types for tracking
export type AnalyticsEvent =
  | "page_view"
  | "project_created"
  | "project_published"
  | "project_deleted"
  | "question_created"
  | "question_edited"
  | "question_deleted"
  | "ai_generation_requested"
  | "ai_generation_completed"
  | "test_started"
  | "test_submitted"
  | "test_graded"
  | "submission_viewed"
  | "user_signed_up"
  | "user_signed_in"
  | "subscription_upgraded"
  | "credits_purchased"
  | "template_used"
  | "question_bank_item_added";

export interface AnalyticsEventData {
  [key: string]: string | number | boolean | undefined;
}

// Track event with Databuddy
export function trackEvent(
  eventName: AnalyticsEvent,
  eventData?: AnalyticsEventData
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
    params?: Record<string, any>
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
    tokensUsed?: number
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
    score?: number
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
