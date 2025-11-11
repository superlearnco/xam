/**
 * Polar Credit Pricing Configuration
 * Token-based credit system with no subscription plans
 *
 * Pricing Model:
 * - $1 = 10 credits (fixed rate)
 * - AI input tokens: 15 credits per million tokens
 * - AI output tokens: 60 credits per million tokens
 */

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonusCredits?: number;
  productPriceId?: string;
  popular?: boolean;
  pricePerCredit: number;
}

export interface TokenCost {
  operation: string;
  creditsPerMillionInputTokens: number;
  creditsPerMillionOutputTokens: number;
  description: string;
}

/**
 * Credit to USD conversion rate
 */
export const CREDITS_PER_DOLLAR = 10;
export const DOLLARS_PER_CREDIT = 1 / CREDITS_PER_DOLLAR; // $0.10 per credit

/**
 * Token pricing (credits per million tokens)
 */
export const TOKEN_PRICING = {
  INPUT_TOKENS: 15, // 15 credits per 1M input tokens
  OUTPUT_TOKENS: 60, // 60 credits per 1M output tokens
} as const;

/**
 * Credit Packages (One-time purchases)
 * Price calculated at $1 = 10 credits
 */
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "credits_50",
    name: "Starter Pack",
    credits: 50,
    price: 5,
    pricePerCredit: 0.10,
    productPriceId: process.env.NEXT_PUBLIC_POLAR_CREDITS_50_PRICE_ID,
  },
  {
    id: "credits_100",
    name: "Small Pack",
    credits: 100,
    price: 10,
    pricePerCredit: 0.10,
    productPriceId: process.env.NEXT_PUBLIC_POLAR_CREDITS_100_PRICE_ID,
  },
  {
    id: "credits_250",
    name: "Medium Pack",
    credits: 250,
    price: 25,
    bonusCredits: 25, // 10% bonus
    pricePerCredit: 0.091,
    productPriceId: process.env.NEXT_PUBLIC_POLAR_CREDITS_250_PRICE_ID,
  },
  {
    id: "credits_500",
    name: "Large Pack",
    credits: 500,
    price: 50,
    bonusCredits: 75, // 15% bonus
    pricePerCredit: 0.087,
    productPriceId: process.env.NEXT_PUBLIC_POLAR_CREDITS_500_PRICE_ID,
    popular: true,
  },
  {
    id: "credits_1000",
    name: "Pro Pack",
    credits: 1000,
    price: 100,
    bonusCredits: 200, // 20% bonus
    pricePerCredit: 0.083,
    productPriceId: process.env.NEXT_PUBLIC_POLAR_CREDITS_1000_PRICE_ID,
  },
  {
    id: "credits_2500",
    name: "Business Pack",
    credits: 2500,
    price: 250,
    bonusCredits: 625, // 25% bonus
    pricePerCredit: 0.080,
    productPriceId: process.env.NEXT_PUBLIC_POLAR_CREDITS_2500_PRICE_ID,
  },
];

/**
 * AI Operation Token Costs
 * Based on actual Gemini token usage patterns
 */
export const AI_OPERATIONS: Record<string, TokenCost> = {
  GENERATE_QUESTION: {
    operation: "generate_question",
    creditsPerMillionInputTokens: TOKEN_PRICING.INPUT_TOKENS,
    creditsPerMillionOutputTokens: TOKEN_PRICING.OUTPUT_TOKENS,
    description: "Generate a question with AI (avg. ~2000 input, ~500 output tokens)",
  },
  GENERATE_DISTRACTORS: {
    operation: "generate_distractors",
    creditsPerMillionInputTokens: TOKEN_PRICING.INPUT_TOKENS,
    creditsPerMillionOutputTokens: TOKEN_PRICING.OUTPUT_TOKENS,
    description: "Generate answer options (avg. ~1000 input, ~300 output tokens)",
  },
  GENERATE_EXPLANATION: {
    operation: "generate_explanation",
    creditsPerMillionInputTokens: TOKEN_PRICING.INPUT_TOKENS,
    creditsPerMillionOutputTokens: TOKEN_PRICING.OUTPUT_TOKENS,
    description: "Generate explanation (avg. ~800 input, ~400 output tokens)",
  },
  GRADE_SUBMISSION: {
    operation: "grade_submission",
    creditsPerMillionInputTokens: TOKEN_PRICING.INPUT_TOKENS,
    creditsPerMillionOutputTokens: TOKEN_PRICING.OUTPUT_TOKENS,
    description: "Grade open-ended answer (avg. ~1500 input, ~300 output tokens)",
  },
  IMPROVE_QUESTION: {
    operation: "improve_question",
    creditsPerMillionInputTokens: TOKEN_PRICING.INPUT_TOKENS,
    creditsPerMillionOutputTokens: TOKEN_PRICING.OUTPUT_TOKENS,
    description: "Get AI improvement suggestions (avg. ~1200 input, ~600 output tokens)",
  },
  GENERATE_FEEDBACK: {
    operation: "generate_feedback",
    creditsPerMillionInputTokens: TOKEN_PRICING.INPUT_TOKENS,
    creditsPerMillionOutputTokens: TOKEN_PRICING.OUTPUT_TOKENS,
    description: "Generate personalized feedback (avg. ~2000 input, ~800 output tokens)",
  },
  GENERATE_RUBRIC: {
    operation: "generate_rubric",
    creditsPerMillionInputTokens: TOKEN_PRICING.INPUT_TOKENS,
    creditsPerMillionOutputTokens: TOKEN_PRICING.OUTPUT_TOKENS,
    description: "Generate grading rubric (avg. ~1000 input, ~700 output tokens)",
  },
};

/**
 * Calculate credits needed for token usage
 */
export function calculateCreditsForTokens(inputTokens: number, outputTokens: number): number {
  const inputCredits = (inputTokens / 1_000_000) * TOKEN_PRICING.INPUT_TOKENS;
  const outputCredits = (outputTokens / 1_000_000) * TOKEN_PRICING.OUTPUT_TOKENS;
  return Math.ceil(inputCredits + outputCredits);
}

/**
 * Estimate credits for common operations
 * Based on average token usage patterns
 */
export const ESTIMATED_CREDITS: Record<string, number> = {
  generate_question: calculateCreditsForTokens(2000, 500), // ~0.06 credits
  generate_distractors: calculateCreditsForTokens(1000, 300), // ~0.03 credits
  generate_explanation: calculateCreditsForTokens(800, 400), // ~0.036 credits
  grade_submission: calculateCreditsForTokens(1500, 300), // ~0.0405 credits
  improve_question: calculateCreditsForTokens(1200, 600), // ~0.054 credits
  generate_feedback: calculateCreditsForTokens(2000, 800), // ~0.078 credits
  generate_rubric: calculateCreditsForTokens(1000, 700), // ~0.057 credits
};

/**
 * Get credit package by ID
 */
export function getCreditPackage(packageId: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === packageId);
}

/**
 * Calculate total credits including bonus
 */
export function getTotalCredits(packageId: string): number {
  const pkg = getCreditPackage(packageId);
  if (!pkg) return 0;
  return pkg.credits + (pkg.bonusCredits || 0);
}

/**
 * Format credit amount for display
 */
export function formatCredits(credits: number): string {
  if (credits >= 1000000) {
    return `${(credits / 1000000).toFixed(1)}M`;
  }
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}K`;
  }
  if (credits < 1) {
    return credits.toFixed(4);
  }
  return credits.toFixed(2);
}

/**
 * Calculate price for credits
 */
export function calculatePriceForCredits(credits: number): number {
  return credits * DOLLARS_PER_CREDIT;
}

/**
 * Calculate credits for price
 */
export function calculateCreditsForPrice(dollars: number): number {
  return dollars * CREDITS_PER_DOLLAR;
}

/**
 * Get operation display name
 */
export function getOperationDisplayName(operation: string): string {
  const names: Record<string, string> = {
    generate_question: "AI Question Generation",
    generate_distractors: "AI Distractor Generation",
    generate_explanation: "AI Explanation Generation",
    grade_submission: "AI Grading",
    improve_question: "AI Question Improvement",
    generate_feedback: "AI Feedback Generation",
    generate_rubric: "AI Rubric Generation",
  };
  return names[operation] || operation.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Estimate credits needed for a project
 */
export function estimateProjectCredits(params: {
  numQuestions: number;
  generateQuestions?: boolean;
  generateDistractors?: boolean;
  generateExplanations?: boolean;
  generateRubrics?: boolean;
  expectedSubmissions?: number;
  autoGrade?: boolean;
}): {
  total: number;
  breakdown: { operation: string; count: number; credits: number }[];
} {
  const breakdown: { operation: string; count: number; credits: number }[] = [];

  if (params.generateQuestions) {
    const credits = ESTIMATED_CREDITS.generate_question * params.numQuestions;
    breakdown.push({
      operation: "Generate Questions",
      count: params.numQuestions,
      credits,
    });
  }

  if (params.generateDistractors) {
    const credits = ESTIMATED_CREDITS.generate_distractors * params.numQuestions;
    breakdown.push({
      operation: "Generate Distractors",
      count: params.numQuestions,
      credits,
    });
  }

  if (params.generateExplanations) {
    const credits = ESTIMATED_CREDITS.generate_explanation * params.numQuestions;
    breakdown.push({
      operation: "Generate Explanations",
      count: params.numQuestions,
      credits,
    });
  }

  if (params.generateRubrics) {
    const credits = ESTIMATED_CREDITS.generate_rubric * params.numQuestions;
    breakdown.push({
      operation: "Generate Rubrics",
      count: params.numQuestions,
      credits,
    });
  }

  if (params.autoGrade && params.expectedSubmissions) {
    const credits =
      ESTIMATED_CREDITS.grade_submission *
      params.numQuestions *
      params.expectedSubmissions;
    breakdown.push({
      operation: "Auto-Grade Submissions",
      count: params.numQuestions * params.expectedSubmissions,
      credits,
    });
  }

  const total = breakdown.reduce((sum, item) => sum + item.credits, 0);

  return { total, breakdown };
}

/**
 * Welcome bonus for new users
 */
export const WELCOME_BONUS_CREDITS = 50; // $5 worth of credits

/**
 * Minimum purchase amount
 */
export const MINIMUM_PURCHASE_DOLLARS = 5;
export const MINIMUM_PURCHASE_CREDITS = calculateCreditsForPrice(MINIMUM_PURCHASE_DOLLARS);
