/**
 * Helper functions for AI credit management
 * These are client-side helpers that work with Convex queries and mutations
 */

/**
 * Format credit balance with appropriate precision
 * @param credits Credit balance
 * @returns Formatted string
 */
export function formatCredits(credits: number): string {
  return credits.toFixed(2);
}

/**
 * Get color class based on credit balance
 * @param balance Current credit balance
 * @returns Tailwind color class
 */
export function getCreditColorClass(balance: number): string {
  if (balance > 100) return "text-green-600";
  if (balance > 50) return "text-yellow-600";
  if (balance > 10) return "text-orange-600";
  return "text-red-600";
}

/**
 * Get background color class based on credit balance
 * @param balance Current credit balance
 * @returns Tailwind background color class
 */
export function getCreditBgColorClass(balance: number): string {
  if (balance > 100) return "bg-green-50 border-green-200";
  if (balance > 50) return "bg-yellow-50 border-yellow-200";
  if (balance > 10) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}

/**
 * Format feature name for display
 * @param feature Feature identifier
 * @returns Human-readable feature name
 */
export function formatFeatureName(
  feature:
    | "generate_test"
    | "generate_options"
    | "grade_response"
    | "bulk_grade"
    | "suggest_feedback"
): string {
  const names: Record<string, string> = {
    generate_test: "Test Generation",
    generate_options: "Option Generation",
    grade_response: "AI Grading",
    bulk_grade: "Bulk Grading",
    suggest_feedback: "Feedback Suggestion",
  };
  return names[feature] || feature;
}

/**
 * Check if user should be warned about low credits
 * @param balance Current credit balance
 * @param estimatedCost Estimated cost of operation
 * @returns True if warning should be shown
 */
export function shouldWarnLowCredits(
  balance: number,
  estimatedCost: number
): boolean {
  return balance < estimatedCost || balance < 10;
}

