import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import {
  trackEvent,
  trackPageView,
  identifyUser,
  projectAnalytics,
  questionAnalytics,
  aiAnalytics,
  testAnalytics,
  userAnalytics,
  billingAnalytics,
  libraryAnalytics,
  landingPageAnalytics,
  authAnalytics,
  enhancedProjectAnalytics,
  testTakingAnalytics,
  markingAnalytics,
  enhancedBillingAnalytics,
  trackTimeSpent,
  initializeDatabuddy,
} from "@/lib/analytics/track";

// Mock window object
const mockDatabuddy = {
  track: jest.fn(),
  page: jest.fn(),
  identify: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (global as any).window = {
    databuddy: mockDatabuddy,
  };
});

describe("Analytics Tracking", () => {
  describe("trackEvent", () => {
    test("should track event with Databuddy", () => {
      trackEvent("project_created", { projectId: "123", projectType: "test" });

      expect(mockDatabuddy.track).toHaveBeenCalledWith("project_created", {
        projectId: "123",
        projectType: "test",
      });
    });

    test("should handle missing eventData", () => {
      trackEvent("page_view");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("page_view", undefined);
    });
  });

  describe("trackPageView", () => {
    test("should track page view with path", () => {
      trackPageView("/dashboard", "Dashboard");

      expect(mockDatabuddy.page).toHaveBeenCalledWith("/dashboard", {
        title: "Dashboard",
      });
    });

    test("should handle missing title", () => {
      trackPageView("/pricing");

      expect(mockDatabuddy.page).toHaveBeenCalledWith("/pricing", {
        title: "",
      });
    });
  });

  describe("identifyUser", () => {
    test("should identify user with traits", () => {
      identifyUser("user-123", { email: "test@example.com", plan: "pro" });

      expect(mockDatabuddy.identify).toHaveBeenCalledWith("user-123", {
        email: "test@example.com",
        plan: "pro",
      });
    });

    test("should handle missing traits", () => {
      identifyUser("user-456");

      expect(mockDatabuddy.identify).toHaveBeenCalledWith(
        "user-456",
        undefined
      );
    });
  });

  describe("projectAnalytics", () => {
    test("should track project created", () => {
      projectAnalytics.created("project-123", "multiple_choice");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("project_created", {
        projectId: "project-123",
        projectType: "multiple_choice",
      });
    });

    test("should track project published", () => {
      projectAnalytics.published("project-123", 10);

      expect(mockDatabuddy.track).toHaveBeenCalledWith("project_published", {
        projectId: "project-123",
        questionCount: 10,
      });
    });

    test("should track project deleted", () => {
      projectAnalytics.deleted("project-123");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("project_deleted", {
        projectId: "project-123",
      });
    });
  });

  describe("questionAnalytics", () => {
    test("should track question created", () => {
      questionAnalytics.created("project-123", "multiple_choice", true);

      expect(mockDatabuddy.track).toHaveBeenCalledWith("question_created", {
        projectId: "project-123",
        questionType: "multiple_choice",
        aiGenerated: true,
      });
    });

    test("should track question edited", () => {
      questionAnalytics.edited("question-123", "short_answer");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("question_edited", {
        questionId: "question-123",
        questionType: "short_answer",
      });
    });

    test("should track question deleted", () => {
      questionAnalytics.deleted("question-123");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("question_deleted", {
        questionId: "question-123",
      });
    });
  });

  describe("aiAnalytics", () => {
    test("should track AI generation requested", () => {
      aiAnalytics.generationRequested("question_generation", 5, {
        count: 10,
      });

      expect(mockDatabuddy.track).toHaveBeenCalledWith(
        "ai_generation_requested",
        {
          operationType: "question_generation",
          credits: 5,
          count: 10,
        }
      );
    });

    test("should track AI generation completed", () => {
      aiAnalytics.generationCompleted("distractor_generation", true, 1500);

      expect(mockDatabuddy.track).toHaveBeenCalledWith(
        "ai_generation_completed",
        {
          operationType: "distractor_generation",
          success: true,
          tokensUsed: 1500,
        }
      );
    });
  });

  describe("testAnalytics", () => {
    test("should track test started", () => {
      testAnalytics.started("project-123", "student@example.com");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("test_started", {
        projectId: "project-123",
        studentEmail: "student@example.com",
      });
    });

    test("should track test submitted", () => {
      testAnalytics.submitted("submission-123", "project-123", 3600, 85);

      expect(mockDatabuddy.track).toHaveBeenCalledWith("test_submitted", {
        submissionId: "submission-123",
        projectId: "project-123",
        timeSpent: 3600,
        score: 85,
      });
    });

    test("should track test graded", () => {
      testAnalytics.graded("submission-123", true, 85);

      expect(mockDatabuddy.track).toHaveBeenCalledWith("test_graded", {
        submissionId: "submission-123",
        autoGraded: true,
        score: 85,
      });
    });

    test("should track submission viewed", () => {
      testAnalytics.viewed("submission-123");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("submission_viewed", {
        submissionId: "submission-123",
      });
    });
  });

  describe("userAnalytics", () => {
    test("should track user signed up", () => {
      userAnalytics.signedUp("user-123", "google");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("user_signed_up", {
        userId: "user-123",
        method: "google",
      });
    });

    test("should track user signed in", () => {
      userAnalytics.signedIn("user-123", "email");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("user_signed_in", {
        userId: "user-123",
        method: "email",
      });
    });
  });

  describe("billingAnalytics", () => {
    test("should track subscription upgraded", () => {
      billingAnalytics.subscriptionUpgraded("user-123", "free", "pro");

      expect(mockDatabuddy.track).toHaveBeenCalledWith(
        "subscription_upgraded",
        {
          userId: "user-123",
          fromTier: "free",
          toTier: "pro",
        }
      );
    });

    test("should track credits purchased", () => {
      billingAnalytics.creditsPurchased("user-123", 50, 500);

      expect(mockDatabuddy.track).toHaveBeenCalledWith("credits_purchased", {
        userId: "user-123",
        amount: 50,
        credits: 500,
      });
    });
  });

  describe("libraryAnalytics", () => {
    test("should track template used", () => {
      libraryAnalytics.templateUsed("template-123", "multiple_choice");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("template_used", {
        templateId: "template-123",
        templateType: "multiple_choice",
      });
    });

    test("should track question bank item added", () => {
      libraryAnalytics.questionBankItemAdded(
        "bank-123",
        "true_false"
      );

      expect(mockDatabuddy.track).toHaveBeenCalledWith(
        "question_bank_item_added",
        {
          questionBankId: "bank-123",
          questionType: "true_false",
        }
      );
    });
  });

  describe("landingPageAnalytics", () => {
    test("should track get started clicked", () => {
      landingPageAnalytics.getStartedClicked("hero");

      expect(mockDatabuddy.track).toHaveBeenCalledWith(
        "get_started_clicked",
        {
          location: "hero",
        }
      );
    });

    test("should track watch demo clicked", () => {
      landingPageAnalytics.watchDemoClicked();

      expect(mockDatabuddy.track).toHaveBeenCalledWith(
        "watch_demo_clicked",
        {}
      );
    });

    test("should track feature card clicked", () => {
      landingPageAnalytics.featureCardClicked("AI Generation");

      expect(mockDatabuddy.track).toHaveBeenCalledWith(
        "feature_card_clicked",
        {
          featureName: "AI Generation",
        }
      );
    });
  });

  describe("authAnalytics", () => {
    test("should track signup started", () => {
      authAnalytics.signupStarted("google");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("signup_started", {
        method: "google",
      });
    });

    test("should track signup completed", () => {
      authAnalytics.signupCompleted("user-123", "email");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("signup_completed", {
        userId: "user-123",
        method: "email",
      });

      expect(mockDatabuddy.identify).toHaveBeenCalledWith("user-123", {
        signupMethod: "email",
      });
    });

    test("should track signin completed", () => {
      authAnalytics.signinCompleted("user-123", "google");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("signin_completed", {
        userId: "user-123",
        method: "google",
      });
    });

    test("should track signout", () => {
      authAnalytics.signout("user-123");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("signout", {
        userId: "user-123",
      });
    });
  });

  describe("enhancedProjectAnalytics", () => {
    test("should track project opened", () => {
      enhancedProjectAnalytics.opened("project-123", "survey");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("project_opened", {
        projectId: "project-123",
        projectType: "survey",
      });
    });

    test("should track project archived", () => {
      enhancedProjectAnalytics.archived("project-123");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("project_archived", {
        projectId: "project-123",
      });
    });

    test("should track share link copied", () => {
      enhancedProjectAnalytics.shareLinkCopied("project-123");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("share_link_copied", {
        projectId: "project-123",
      });
    });

    test("should track QR code generated", () => {
      enhancedProjectAnalytics.qrCodeGenerated("project-123");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("qr_code_generated", {
        projectId: "project-123",
      });
    });
  });

  describe("testTakingAnalytics", () => {
    test("should track question answered", () => {
      testTakingAnalytics.questionAnswered(
        "submission-123",
        "question-456",
        120
      );

      expect(mockDatabuddy.track).toHaveBeenCalledWith(
        "test_question_answered",
        {
          submissionId: "submission-123",
          questionId: "question-456",
          timeSpent: 120,
        }
      );
    });

    test("should track question flagged", () => {
      testTakingAnalytics.questionFlagged("submission-123", "question-456");

      expect(mockDatabuddy.track).toHaveBeenCalledWith(
        "test_question_flagged",
        {
          submissionId: "submission-123",
          questionId: "question-456",
        }
      );
    });

    test("should track navigation", () => {
      testTakingAnalytics.navigation("submission-123", 1, 2);

      expect(mockDatabuddy.track).toHaveBeenCalledWith("test_navigation", {
        submissionId: "submission-123",
        fromQuestion: 1,
        toQuestion: 2,
      });
    });
  });

  describe("markingAnalytics", () => {
    test("should track marking page opened", () => {
      markingAnalytics.pageOpened("project-123", 25);

      expect(mockDatabuddy.track).toHaveBeenCalledWith(
        "marking_page_opened",
        {
          projectId: "project-123",
          submissionCount: 25,
        }
      );
    });

    test("should track submission marked", () => {
      markingAnalytics.submissionMarked("submission-123", "project-123", 600);

      expect(mockDatabuddy.track).toHaveBeenCalledWith("submission_marked", {
        submissionId: "submission-123",
        projectId: "project-123",
        timeSpent: 600,
      });
    });

    test("should track AI grading used", () => {
      markingAnalytics.aiGradingUsed("submission-123", 10);

      expect(mockDatabuddy.track).toHaveBeenCalledWith("ai_grading_used", {
        submissionId: "submission-123",
        questionCount: 10,
      });
    });

    test("should track feedback sent", () => {
      markingAnalytics.feedbackSent("submission-123");

      expect(mockDatabuddy.track).toHaveBeenCalledWith("feedback_sent", {
        submissionId: "submission-123",
      });
    });

    test("should track grades exported", () => {
      markingAnalytics.gradesExported("project-123", "csv", 50);

      expect(mockDatabuddy.track).toHaveBeenCalledWith("grades_exported", {
        projectId: "project-123",
        format: "csv",
        count: 50,
      });
    });
  });

  describe("enhancedBillingAnalytics", () => {
    test("should track pricing page viewed", () => {
      enhancedBillingAnalytics.pricingPageViewed();

      expect(mockDatabuddy.track).toHaveBeenCalledWith(
        "pricing_page_view",
        {}
      );
    });

    test("should track plan card clicked", () => {
      enhancedBillingAnalytics.planCardClicked("Pro Plan", 50);

      expect(mockDatabuddy.track).toHaveBeenCalledWith("plan_card_clicked", {
        planName: "Pro Plan",
        price: 50,
      });
    });

    test("should track checkout initiated", () => {
      enhancedBillingAnalytics.checkoutInitiated("product-123", 50);

      expect(mockDatabuddy.track).toHaveBeenCalledWith(
        "checkout_initiated",
        {
          productId: "product-123",
          amount: 50,
        }
      );
    });

    test("should track payment completed", () => {
      enhancedBillingAnalytics.paymentCompleted("user-123", 50, 500);

      expect(mockDatabuddy.track).toHaveBeenCalledWith("payment_completed", {
        userId: "user-123",
        amount: 50,
        credits: 500,
      });
    });

    test("should track payment failed", () => {
      enhancedBillingAnalytics.paymentFailed(
        "user-123",
        50,
        "Insufficient funds"
      );

      expect(mockDatabuddy.track).toHaveBeenCalledWith("payment_failed", {
        userId: "user-123",
        amount: 50,
        reason: "Insufficient funds",
      });
    });

    test("should track subscription cancelled", () => {
      enhancedBillingAnalytics.subscriptionCancelled("user-123", "Pro Plan");

      expect(mockDatabuddy.track).toHaveBeenCalledWith(
        "subscription_cancelled",
        {
          userId: "user-123",
          planName: "Pro Plan",
        }
      );
    });
  });

  describe("trackTimeSpent", () => {
    test("should calculate and track time spent", () => {
      const startTime = Date.now() - 5000; // 5 seconds ago
      trackTimeSpent("project_editing", startTime, { projectId: "123" });

      expect(mockDatabuddy.track).toHaveBeenCalledWith("page_view", {
        activity: "project_editing",
        timeSpent: expect.any(Number),
        projectId: "123",
      });
    });
  });

  describe("initializeDatabuddy", () => {
    test("should not initialize if no window object", () => {
      delete (global as any).window;
      initializeDatabuddy();
      // Should not throw error
    });
  });
});
