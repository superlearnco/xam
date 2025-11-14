import { generateObject } from "ai";
import { xai, MODELS, calculateCost } from "./config";
import { z } from "zod";

// Schema for generated options
const optionsSchema = z.object({
  options: z.array(z.string()).length(3),
});

export type GenerateOptionsResult = {
  options: string[];
  tokensInput: number;
  tokensOutput: number;
  cost: number;
};

/**
 * Generate 3 plausible but incorrect options for a multiple choice question
 * @param question The question text
 * @param correctAnswer The correct answer
 * @returns Array of 3 incorrect options
 */
export async function generateDummyOptions(
  question: string,
  correctAnswer: string
): Promise<GenerateOptionsResult> {
  const prompt = `Given this multiple choice question and correct answer, generate 3 plausible but incorrect options.

Question: ${question}
Correct Answer: ${correctAnswer}

Requirements:
- Generate exactly 3 wrong answers
- Make them plausible and challenging
- They should test common misconceptions
- Keep similar length and style to the correct answer
- Make them sound realistic, not obviously wrong
- Do not include explanations, just the options

Provide the 3 incorrect options as an array.`;

  try {
    const result = await generateObject({
      model: xai(MODELS.FAST),
      schema: optionsSchema,
      prompt,
      temperature: 0.8, // Higher temperature for more creative options
    });

    // Calculate cost
    const tokensInput = result.usage?.promptTokens || 0;
    const tokensOutput = result.usage?.completionTokens || 0;
    const cost = calculateCost(tokensInput, tokensOutput);

    return {
      options: result.object.options,
      tokensInput,
      tokensOutput,
      cost,
    };
  } catch (error) {
    console.error("Error generating options:", error);
    throw new Error("Failed to generate options. Please try again.");
  }
}

/**
 * Estimate the cost of generating dummy options
 * @returns Estimated cost in credits
 */
export function estimateGenerateOptionsCost(): number {
  // Rough estimate: ~200 input tokens, ~100 output tokens
  return calculateCost(200, 100);
}

