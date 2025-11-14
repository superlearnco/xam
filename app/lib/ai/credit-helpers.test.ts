import { describe, it, expect } from "vitest";
import {
  formatCredits,
  getCreditColorClass,
  getCreditBgColorClass,
  formatFeatureName,
  shouldWarnLowCredits,
} from "./credit-helpers";

describe("formatCredits", () => {
  it("should format whole numbers with 2 decimal places", () => {
    expect(formatCredits(10)).toBe("10.00");
    expect(formatCredits(100)).toBe("100.00");
  });

  it("should format decimals with 2 decimal places", () => {
    expect(formatCredits(10.5)).toBe("10.50");
    expect(formatCredits(10.55)).toBe("10.55");
    expect(formatCredits(10.556)).toBe("10.56");
  });

  it("should handle zero", () => {
    expect(formatCredits(0)).toBe("0.00");
  });

  it("should handle negative numbers", () => {
    expect(formatCredits(-5)).toBe("-5.00");
  });

  it("should round to 2 decimal places", () => {
    expect(formatCredits(10.999)).toBe("11.00");
    expect(formatCredits(10.444)).toBe("10.44");
  });
});

describe("getCreditColorClass", () => {
  it("should return green for balance > 100", () => {
    expect(getCreditColorClass(101)).toBe("text-green-600");
    expect(getCreditColorClass(200)).toBe("text-green-600");
    expect(getCreditColorClass(1000)).toBe("text-green-600");
  });

  it("should return yellow for balance 51-100", () => {
    expect(getCreditColorClass(100)).toBe("text-yellow-600");
    expect(getCreditColorClass(75)).toBe("text-yellow-600");
    expect(getCreditColorClass(51)).toBe("text-yellow-600");
  });

  it("should return orange for balance 11-50", () => {
    expect(getCreditColorClass(50)).toBe("text-orange-600");
    expect(getCreditColorClass(25)).toBe("text-orange-600");
    expect(getCreditColorClass(11)).toBe("text-orange-600");
  });

  it("should return red for balance <= 10", () => {
    expect(getCreditColorClass(10)).toBe("text-red-600");
    expect(getCreditColorClass(5)).toBe("text-red-600");
    expect(getCreditColorClass(0)).toBe("text-red-600");
  });

  it("should handle edge cases", () => {
    expect(getCreditColorClass(100.5)).toBe("text-green-600"); // > 100
    expect(getCreditColorClass(50.5)).toBe("text-yellow-600"); // > 50
    expect(getCreditColorClass(10.5)).toBe("text-orange-600"); // > 10
  });
});

describe("getCreditBgColorClass", () => {
  it("should return green background for balance > 100", () => {
    expect(getCreditBgColorClass(101)).toBe("bg-green-50 border-green-200");
    expect(getCreditBgColorClass(200)).toBe("bg-green-50 border-green-200");
  });

  it("should return yellow background for balance 51-100", () => {
    expect(getCreditBgColorClass(100)).toBe("bg-yellow-50 border-yellow-200");
    expect(getCreditBgColorClass(75)).toBe("bg-yellow-50 border-yellow-200");
  });

  it("should return orange background for balance 11-50", () => {
    expect(getCreditBgColorClass(50)).toBe("bg-orange-50 border-orange-200");
    expect(getCreditBgColorClass(25)).toBe("bg-orange-50 border-orange-200");
  });

  it("should return red background for balance <= 10", () => {
    expect(getCreditBgColorClass(10)).toBe("bg-red-50 border-red-200");
    expect(getCreditBgColorClass(0)).toBe("bg-red-50 border-red-200");
  });
});

describe("formatFeatureName", () => {
  it("should format generate_test", () => {
    expect(formatFeatureName("generate_test")).toBe("Test Generation");
  });

  it("should format generate_options", () => {
    expect(formatFeatureName("generate_options")).toBe("Option Generation");
  });

  it("should format grade_response", () => {
    expect(formatFeatureName("grade_response")).toBe("AI Grading");
  });

  it("should format bulk_grade", () => {
    expect(formatFeatureName("bulk_grade")).toBe("Bulk Grading");
  });

  it("should format suggest_feedback", () => {
    expect(formatFeatureName("suggest_feedback")).toBe("Feedback Suggestion");
  });
});

describe("shouldWarnLowCredits", () => {
  it("should warn when balance is less than estimated cost", () => {
    expect(shouldWarnLowCredits(5, 10)).toBe(true);
    expect(shouldWarnLowCredits(0, 5)).toBe(true);
    expect(shouldWarnLowCredits(1, 2)).toBe(true);
  });

  it("should warn when balance is less than 10", () => {
    expect(shouldWarnLowCredits(9, 1)).toBe(true);
    expect(shouldWarnLowCredits(5, 1)).toBe(true);
    expect(shouldWarnLowCredits(0, 0)).toBe(true);
  });

  it("should not warn when balance is sufficient", () => {
    expect(shouldWarnLowCredits(100, 5)).toBe(false);
    expect(shouldWarnLowCredits(50, 10)).toBe(false);
    expect(shouldWarnLowCredits(10, 5)).toBe(false);
  });

  it("should handle edge case at 10 credits", () => {
    // Balance is exactly 10 and cost is small
    expect(shouldWarnLowCredits(10, 1)).toBe(false);
    // Balance is exactly 10 and cost equals balance
    expect(shouldWarnLowCredits(10, 10)).toBe(false);
    // Balance is exactly 10 and cost exceeds balance
    expect(shouldWarnLowCredits(10, 11)).toBe(true);
  });

  it("should handle zero cost", () => {
    expect(shouldWarnLowCredits(5, 0)).toBe(true); // Still warns due to low balance
    expect(shouldWarnLowCredits(20, 0)).toBe(false);
  });

  it("should warn for realistic scenarios", () => {
    // User has 8 credits, wants to generate test (~5 credits)
    expect(shouldWarnLowCredits(8, 5)).toBe(true);

    // User has 100 credits, wants to generate test (~5 credits)
    expect(shouldWarnLowCredits(100, 5)).toBe(false);

    // User has 15 credits, wants to bulk grade (~10 credits)
    expect(shouldWarnLowCredits(15, 10)).toBe(false);

    // User has 12 credits, wants to bulk grade (~15 credits)
    expect(shouldWarnLowCredits(12, 15)).toBe(true);
  });
});

