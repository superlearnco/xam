import { describe, it, expect } from "@jest/globals";
import {
  CREDIT_PACKAGES,
  calculateCreditsForTokens,
  formatCredits,
  getTotalCredits,
  getCreditPackage,
  estimateProjectCredits,
  ESTIMATED_CREDITS,
  TOKEN_PRICING,
  CREDITS_PER_DOLLAR,
  WELCOME_BONUS_CREDITS,
} from "@/lib/polar/config/pricing";

describe("Credit Pricing Configuration", () => {
  describe("Credit Packages", () => {
    it("should have 6 credit packages", () => {
      expect(CREDIT_PACKAGES).toHaveLength(6);
    });

    it("should have correct base packages without bonuses", () => {
      const starterPack = CREDIT_PACKAGES[0];
      const smallPack = CREDIT_PACKAGES[1];

      expect(starterPack.credits).toBe(50);
      expect(starterPack.price).toBe(5);
      expect(starterPack.bonusCredits).toBeUndefined();

      expect(smallPack.credits).toBe(100);
      expect(smallPack.price).toBe(10);
      expect(smallPack.bonusCredits).toBeUndefined();
    });

    it("should have correct bonus scaling (10%, 15%, 20%, 25%)", () => {
      const mediumPack = CREDIT_PACKAGES[2]; // 250 credits
      const largePack = CREDIT_PACKAGES[3]; // 500 credits
      const proPack = CREDIT_PACKAGES[4]; // 1000 credits
      const businessPack = CREDIT_PACKAGES[5]; // 2500 credits

      expect(mediumPack.bonusCredits).toBe(25); // 10% of 250
      expect(largePack.bonusCredits).toBe(75); // 15% of 500
      expect(proPack.bonusCredits).toBe(200); // 20% of 1000
      expect(businessPack.bonusCredits).toBe(625); // 25% of 2500
    });

    it("should mark the 500 credit pack as popular", () => {
      const popularPack = CREDIT_PACKAGES.find((pkg) => pkg.popular);
      expect(popularPack).toBeDefined();
      expect(popularPack?.credits).toBe(500);
    });

    it("should maintain $0.10 per credit base rate", () => {
      const starterPack = CREDIT_PACKAGES[0];
      const smallPack = CREDIT_PACKAGES[1];

      expect(starterPack.pricePerCredit).toBe(0.1);
      expect(smallPack.pricePerCredit).toBe(0.1);
    });

    it("should have decreasing price per credit with larger packages", () => {
      for (let i = 1; i < CREDIT_PACKAGES.length; i++) {
        const currentPack = CREDIT_PACKAGES[i];
        const previousPack = CREDIT_PACKAGES[i - 1];

        expect(currentPack.pricePerCredit).toBeLessThanOrEqual(
          previousPack.pricePerCredit,
        );
      }
    });
  });

  describe("Token Pricing", () => {
    it("should have correct token pricing constants", () => {
      expect(TOKEN_PRICING.INPUT_TOKENS).toBe(15);
      expect(TOKEN_PRICING.OUTPUT_TOKENS).toBe(60);
    });

    it("should calculate credits correctly for token usage", () => {
      // 1M input tokens + 1M output tokens = 15 + 60 = 75 credits
      const credits = calculateCreditsForTokens(1_000_000, 1_000_000);
      expect(credits).toBe(75);
    });

    it("should round up credit calculations", () => {
      // Small token amounts should round up to at least 1 credit
      const credits = calculateCreditsForTokens(100, 100);
      expect(credits).toBeGreaterThanOrEqual(1);
    });

    it("should calculate credits for typical question generation", () => {
      // 2000 input, 500 output tokens
      const credits = calculateCreditsForTokens(2000, 500);
      expect(credits).toBeCloseTo(0.06, 2);
    });

    it("should calculate credits for typical grading operation", () => {
      // 1500 input, 300 output tokens
      const credits = calculateCreditsForTokens(1500, 300);
      expect(credits).toBeCloseTo(0.0405, 2);
    });
  });

  describe("Estimated Credits", () => {
    it("should have all operation types defined", () => {
      const operations = [
        "generate_question",
        "generate_distractors",
        "generate_explanation",
        "grade_submission",
        "improve_question",
        "generate_feedback",
        "generate_rubric",
      ];

      operations.forEach((operation) => {
        expect(ESTIMATED_CREDITS[operation]).toBeDefined();
        expect(ESTIMATED_CREDITS[operation]).toBeGreaterThan(0);
      });
    });

    it("should have reasonable credit estimates", () => {
      // All operations should cost less than 1 credit
      Object.values(ESTIMATED_CREDITS).forEach((credits) => {
        expect(credits).toBeLessThan(1);
        expect(credits).toBeGreaterThan(0);
      });
    });

    it("should have generate_question as one of the more expensive operations", () => {
      const questionGen = ESTIMATED_CREDITS.generate_question;
      const distractors = ESTIMATED_CREDITS.generate_distractors;

      // Question generation should cost more than distractor generation
      expect(questionGen).toBeGreaterThan(distractors);
    });
  });

  describe("Helper Functions", () => {
    it("should get credit package by ID", () => {
      const pack = getCreditPackage("credits_500");
      expect(pack).toBeDefined();
      expect(pack?.credits).toBe(500);
      expect(pack?.price).toBe(50);
    });

    it("should return undefined for invalid package ID", () => {
      const pack = getCreditPackage("invalid_id");
      expect(pack).toBeUndefined();
    });

    it("should calculate total credits including bonus", () => {
      const total = getTotalCredits("credits_500");
      expect(total).toBe(575); // 500 + 75 bonus
    });

    it("should calculate total credits for package without bonus", () => {
      const total = getTotalCredits("credits_50");
      expect(total).toBe(50); // No bonus
    });

    it("should format credits correctly", () => {
      expect(formatCredits(0.0405)).toBe("0.0405");
      expect(formatCredits(50)).toBe("50.00");
      expect(formatCredits(1234)).toBe("1.2K");
      expect(formatCredits(1234567)).toBe("1.2M");
    });

    it("should format small credit amounts with precision", () => {
      const formatted = formatCredits(0.06);
      expect(formatted).toMatch(/0\.06/);
    });
  });

  describe("Project Credit Estimation", () => {
    it("should estimate credits for basic project", () => {
      const estimate = estimateProjectCredits({
        numQuestions: 10,
        generateQuestions: true,
      });

      expect(estimate.total).toBeGreaterThan(0);
      expect(estimate.breakdown).toHaveLength(1);
      expect(estimate.breakdown[0].operation).toBe("Generate Questions");
      expect(estimate.breakdown[0].count).toBe(10);
    });

    it("should estimate credits for full AI-assisted project", () => {
      const estimate = estimateProjectCredits({
        numQuestions: 20,
        generateQuestions: true,
        generateDistractors: true,
        generateExplanations: true,
        generateRubrics: true,
      });

      expect(estimate.breakdown).toHaveLength(4);
      expect(estimate.total).toBeGreaterThan(0);
    });

    it("should estimate credits for auto-grading", () => {
      const estimate = estimateProjectCredits({
        numQuestions: 5,
        expectedSubmissions: 30,
        autoGrade: true,
      });

      expect(estimate.breakdown).toHaveLength(1);
      expect(estimate.breakdown[0].operation).toBe("Auto-Grade Submissions");
      expect(estimate.breakdown[0].count).toBe(150); // 5 questions * 30 submissions
    });

    it("should return zero for no operations", () => {
      const estimate = estimateProjectCredits({
        numQuestions: 10,
      });

      expect(estimate.total).toBe(0);
      expect(estimate.breakdown).toHaveLength(0);
    });

    it("should calculate correct total across multiple operations", () => {
      const estimate = estimateProjectCredits({
        numQuestions: 10,
        generateQuestions: true,
        generateDistractors: true,
      });

      const expectedTotal =
        ESTIMATED_CREDITS.generate_question * 10 +
        ESTIMATED_CREDITS.generate_distractors * 10;

      expect(estimate.total).toBeCloseTo(expectedTotal, 4);
    });
  });

  describe("Currency Constants", () => {
    it("should have correct credit to dollar conversion", () => {
      expect(CREDITS_PER_DOLLAR).toBe(10);
    });

    it("should have correct welcome bonus", () => {
      expect(WELCOME_BONUS_CREDITS).toBe(50);
    });

    it("should maintain consistent pricing across packages", () => {
      // Verify that price = credits / CREDITS_PER_DOLLAR (for base packages)
      const starterPack = CREDIT_PACKAGES[0];
      expect(starterPack.price).toBe(starterPack.credits / CREDITS_PER_DOLLAR);
    });
  });

  describe("Cost Efficiency", () => {
    it("should show increasing value with larger packages", () => {
      const starter = CREDIT_PACKAGES[0]; // 50 credits, $5
      const business = CREDIT_PACKAGES[5]; // 2500 + 625 bonus, $250

      const starterValuePerDollar = starter.credits / starter.price;
      const businessValuePerDollar =
        getTotalCredits(business.id) / business.price;

      expect(businessValuePerDollar).toBeGreaterThan(starterValuePerDollar);
    });

    it("should calculate cost per thousand questions for each package", () => {
      CREDIT_PACKAGES.forEach((pkg) => {
        const totalCredits = getTotalCredits(pkg.id);
        const questionsPerPackage = Math.floor(
          totalCredits / ESTIMATED_CREDITS.generate_question,
        );
        const costPerQuestion = pkg.price / questionsPerPackage;

        // Cost per question should be reasonable (less than $0.01)
        expect(costPerQuestion).toBeLessThan(0.01);
      });
    });
  });

  describe("Real-world Usage Scenarios", () => {
    it("should calculate cost for small teacher (10 tests, 20 questions each)", () => {
      const estimate = estimateProjectCredits({
        numQuestions: 200, // 10 tests * 20 questions
        generateQuestions: true,
        generateDistractors: true,
        expectedSubmissions: 300, // 10 tests * 30 students
        autoGrade: false, // Manual grading
      });

      // Should be affordable with starter or small pack
      expect(estimate.total).toBeLessThan(100);
    });

    it("should calculate cost for large institution scenario", () => {
      const estimate = estimateProjectCredits({
        numQuestions: 1000, // Many tests
        generateQuestions: true,
        generateDistractors: true,
        generateExplanations: true,
        expectedSubmissions: 5000, // Many students
        autoGrade: true,
      });

      // Should still be cost-effective
      const estimatedCost = estimate.total * 0.1; // $0.10 per credit
      expect(estimatedCost).toBeLessThan(1000); // Under $1000
    });
  });
});
