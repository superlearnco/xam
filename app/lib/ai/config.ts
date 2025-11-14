import { createOpenAI } from "@ai-sdk/openai";

// Vercel AI Gateway configuration for xAI (Grok) models
// The gateway handles routing and provides unified access to AI models
// When using Vercel AI Gateway, set baseURL to the gateway endpoint
// and use model names in the format: provider/model-name
export const xai = createOpenAI({
  name: "xai",
  apiKey: process.env.AI_GATEWAY_API_KEY || process.env.XAI_API_KEY || "",
  baseURL: process.env.AI_GATEWAY_URL || "https://gateway.vercel.ai/v1",
});

// Model identifiers - using Vercel AI Gateway format (provider/model-name)
// The gateway routes requests based on the provider/model-name format
export const MODELS = {
  FAST: "xai/grok-4-fast-non-reasoning", // Fast non-reasoning model for quick tasks
  REASONING: "xai/grok-4-fast-non-reasoning", // Using same model for all tasks
} as const;

// Token costs (in credits per 1000 tokens)
export const TOKEN_COSTS = {
  INPUT_PER_1K: 0.3, // $0.003 per 1K input tokens = 0.3 credits
  OUTPUT_PER_1K: 1.5, // $0.015 per 1K output tokens = 1.5 credits
};

/**
 * Calculate the cost of an AI request based on token usage
 * @param inputTokens Number of input tokens
 * @param outputTokens Number of output tokens
 * @returns Total cost in credits
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number
): number {
  const inputCost = (inputTokens / 1000) * TOKEN_COSTS.INPUT_PER_1K;
  const outputCost = (outputTokens / 1000) * TOKEN_COSTS.OUTPUT_PER_1K;
  return Math.ceil((inputCost + outputCost) * 100) / 100; // Round to 2 decimal places
}

/**
 * Estimate the cost of a request based on approximate input size
 * @param estimatedInputTokens Estimated input tokens
 * @param estimatedOutputTokens Estimated output tokens
 * @returns Estimated cost in credits
 */
export function estimateCost(
  estimatedInputTokens: number,
  estimatedOutputTokens: number
): number {
  return calculateCost(estimatedInputTokens, estimatedOutputTokens);
}

// Rough token estimation (1 token ≈ 4 characters for English text)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

