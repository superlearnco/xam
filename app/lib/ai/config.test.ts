import { describe, it, expect } from "vitest";
import {
  calculateCost,
  estimateCost,
  estimateTokens,
  TOKEN_COSTS,
} from "./config";

describe("calculateCost", () => {
  it("should calculate cost for input tokens correctly", () => {
    // 1000 input tokens = 0.3 credits
    expect(calculateCost(1000, 0)).toBe(0.3);
  });

  it("should calculate cost for output tokens correctly", () => {
    // 1000 output tokens = 1.5 credits
    expect(calculateCost(0, 1000)).toBe(1.5);
  });

  it("should calculate combined cost correctly", () => {
    // 1000 input + 1000 output = 0.3 + 1.5 = 1.8 credits
    expect(calculateCost(1000, 1000)).toBe(1.8);
  });

  it("should handle zero tokens", () => {
    expect(calculateCost(0, 0)).toBe(0);
  });

  it("should round to 2 decimal places", () => {
    // 100 input + 100 output = 0.03 + 0.15 = 0.18, rounds up to 0.19
    expect(calculateCost(100, 100)).toBe(0.19);
  });

  it("should round up small amounts", () => {
    // 10 input + 10 output = 0.003 + 0.015 = 0.018 -> rounds to 0.02
    const result = calculateCost(10, 10);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(0.02);
  });

  it("should handle large token counts", () => {
    // 100K input + 100K output = 30 + 150 = 180 credits
    expect(calculateCost(100000, 100000)).toBe(180);
  });

  it("should calculate realistic test generation cost", () => {
    // Typical test generation: ~1500 input, ~3000 output
    const cost = calculateCost(1500, 3000);
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeLessThan(10); // Should be around 4-5 credits
  });

  it("should calculate realistic option generation cost", () => {
    // Typical option generation: ~300 input, ~100 output
    const cost = calculateCost(300, 100);
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeLessThan(1); // Should be around 0.2-0.3 credits
  });

  it("should calculate realistic grading cost", () => {
    // Typical grading: ~500 input, ~200 output
    const cost = calculateCost(500, 200);
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeLessThan(1); // Should be around 0.4-0.5 credits
  });
});

describe("estimateCost", () => {
  it("should match calculateCost for same inputs", () => {
    expect(estimateCost(1000, 1000)).toBe(calculateCost(1000, 1000));
    expect(estimateCost(500, 200)).toBe(calculateCost(500, 200));
  });

  it("should handle edge cases", () => {
    expect(estimateCost(0, 0)).toBe(0);
    expect(estimateCost(1, 1)).toBeGreaterThan(0);
  });
});

describe("estimateTokens", () => {
  it("should estimate tokens for short text", () => {
    // "Hello" = 5 chars -> ~2 tokens
    expect(estimateTokens("Hello")).toBe(2);
  });

  it("should estimate tokens for medium text", () => {
    // 100 chars -> ~25 tokens
    const text = "a".repeat(100);
    expect(estimateTokens(text)).toBe(25);
  });

  it("should estimate tokens for long text", () => {
    // 1000 chars -> ~250 tokens
    const text = "a".repeat(1000);
    expect(estimateTokens(text)).toBe(250);
  });

  it("should handle empty string", () => {
    expect(estimateTokens("")).toBe(0);
  });

  it("should round up to nearest integer", () => {
    // 3 chars -> 0.75 tokens -> rounds to 1
    expect(estimateTokens("abc")).toBe(1);
  });

  it("should handle realistic question text", () => {
    const question = "What is the capital of France? Explain your answer.";
    const tokens = estimateTokens(question);
    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBeLessThan(50); // Should be around 12-15 tokens
  });

  it("should handle realistic long answer", () => {
    const answer =
      "The capital of France is Paris. It has been the capital since the 12th century and is the most populous city in the country.";
    const tokens = estimateTokens(answer);
    expect(tokens).toBeGreaterThan(20);
    expect(tokens).toBeLessThan(50);
  });
});

describe("TOKEN_COSTS", () => {
  it("should have correct input cost", () => {
    expect(TOKEN_COSTS.INPUT_PER_1K).toBe(0.3);
  });

  it("should have correct output cost", () => {
    expect(TOKEN_COSTS.OUTPUT_PER_1K).toBe(1.5);
  });

  it("should have output cost higher than input cost", () => {
    expect(TOKEN_COSTS.OUTPUT_PER_1K).toBeGreaterThan(
      TOKEN_COSTS.INPUT_PER_1K
    );
  });
});

