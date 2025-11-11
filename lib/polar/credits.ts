/**
 * Credit Management Utilities
 * Helper functions for token-based credit system
 */

import {
  calculateCreditsForTokens,
  ESTIMATED_CREDITS,
  formatCredits as formatCreditsBase,
  calculatePriceForCredits,
  CREDITS_PER_DOLLAR,
  TOKEN_PRICING,
} from "./config/pricing";

export type AIOperation =
  | "generate_question"
  | "generate_distractors"
  | "generate_explanation"
  | "grade_submission"
  | "improve_question"
  | "generate_feedback"
  | "generate_rubric";

/**
 * Get estimated credit cost for an AI operation
 * Based on average token usage
 */
export function getOperationCost(operation: AIOperation): number {
  return ESTIMATED_CREDITS[operation] || 0;
}

/**
 * Calculate actual credits for a specific token count
 */
export function calculateCreditCost(inputTokens: number, outputTokens: number): number {
  return calculateCreditsForTokens(inputTokens, outputTokens);
}

/**
 * Calculate total cost for multiple operations
 */
export function calculateTotalCost(operations: { operation: AIOperation; count: number }[]): number {
  return operations.reduce((total, { operation, count }) => {
    return total + getOperationCost(operation) * count;
  }, 0);
}

/**
 * Check if user has sufficient credits for an operation
 */
export function hasSufficientCredits(
  userCredits: number,
  operation: AIOperation,
  count: number = 1
): boolean {
  const cost = getOperationCost(operation) * count;
  return userCredits >= cost;
}

/**
 * Check if user can perform an AI operation
 */
export function canPerformAIOperation(
  credits: number,
  operation: AIOperation,
  count: number = 1
): { allowed: boolean; reason?: string; cost: number } {
  const cost = getOperationCost(operation) * count;

  if (credits < cost) {
    return {
      allowed: false,
      reason: `Insufficient credits. Required: ${formatCredits(cost)}, Available: ${formatCredits(credits)}`,
      cost,
    };
  }

  return {
    allowed: true,
    cost,
  };
}

/**
 * Format credit amount for display
 */
export function formatCredits(credits: number): string {
  return formatCreditsBase(credits);
}

/**
 * Format credits with price
 */
export function formatCreditsWithPrice(credits: number): string {
  const price = calculatePriceForCredits(credits);
  return `${formatCredits(credits)} credits ($${price.toFixed(2)})`;
}

/**
 * Get operation display name
 */
export function getOperationDisplayName(operation: AIOperation): string {
  const names: Record<AIOperation, string> = {
    generate_question: "AI Question Generation",
    generate_distractors: "AI Distractor Generation",
    generate_explanation: "AI Explanation Generation",
    grade_submission: "AI Grading",
    improve_question: "AI Question Improvement",
    generate_feedback: "AI Feedback Generation",
    generate_rubric: "AI Rubric Generation",
  };
  return names[operation] || operation;
}

/**
 * Calculate token pricing breakdown
 */
export function getTokenPricing() {
  return {
    inputTokens: TOKEN_PRICING.INPUT_TOKENS,
    outputTokens: TOKEN_PRICING.OUTPUT_TOKENS,
    creditsPerDollar: CREDITS_PER_DOLLAR,
  };
}

/**
 * Estimate cost for generating multiple questions
 */
export function estimateQuestionGenerationCost(
  numQuestions: number,
  includeDistractors: boolean = false,
  includeExplanations: boolean = false
): {
  total: number;
  breakdown: { operation: string; cost: number }[];
} {
  const breakdown: { operation: string; cost: number }[] = [];

  const questionCost = getOperationCost("generate_question") * numQuestions;
  breakdown.push({
    operation: "Generate Questions",
    cost: questionCost,
  });

  if (includeDistractors) {
    const distractorCost = getOperationCost("generate_distractors") * numQuestions;
    breakdown.push({
      operation: "Generate Distractors",
      cost: distractorCost,
    });
  }

  if (includeExplanations) {
    const explanationCost = getOperationCost("generate_explanation") * numQuestions;
    breakdown.push({
      operation: "Generate Explanations",
      cost: explanationCost,
    });
  }

  const total = breakdown.reduce((sum, item) => sum + item.cost, 0);

  return { total, breakdown };
}

/**
 * Estimate cost for grading submissions
 */
export function estimateGradingCost(
  numQuestions: number,
  numSubmissions: number,
  includeFeedback: boolean = false
): {
  total: number;
  breakdown: { operation: string; cost: number }[];
} {
  const breakdown: { operation: string; cost: number }[] = [];

  const gradingCost = getOperationCost("grade_submission") * numQuestions * numSubmissions;
  breakdown.push({
    operation: "Grade Submissions",
    cost: gradingCost,
  });

  if (includeFeedback) {
    const feedbackCost = getOperationCost("generate_feedback") * numSubmissions;
    breakdown.push({
      operation: "Generate Feedback",
      cost: feedbackCost,
    });
  }

  const total = breakdown.reduce((sum, item) => sum + item.cost, 0);

  return { total, breakdown };
}

/**
 * Check if user needs to purchase more credits
 */
export function needsMoreCredits(
  currentCredits: number,
  plannedOperations: { operation: AIOperation; count: number }[]
): {
  needs: boolean;
  required: number;
  deficit: number;
  suggestedPurchase: number;
} {
  const required = calculateTotalCost(plannedOperations);
  const deficit = Math.max(0, required - currentCredits);
  const needs = deficit > 0;

  // Suggest purchasing 50% more than needed for buffer
  const suggestedPurchase = needs ? Math.ceil(deficit * 1.5) : 0;

  return {
    needs,
    required,
    deficit,
    suggestedPurchase,
  };
}

/**
 * Get credit status for display
 */
export function getCreditStatus(credits: number): {
  status: "high" | "medium" | "low" | "critical";
  message: string;
  color: string;
} {
  if (credits >= 100) {
    return {
      status: "high",
      message: "You have plenty of credits",
      color: "green",
    };
  } else if (credits >= 50) {
    return {
      status: "medium",
      message: "You have a good credit balance",
      color: "blue",
    };
  } else if (credits >= 10) {
    return {
      status: "low",
      message: "Your credits are running low",
      color: "yellow",
    };
  } else {
    return {
      status: "critical",
      message: "Your credits are critically low",
      color: "red",
    };
  }
}
