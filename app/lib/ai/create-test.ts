import { generateObject } from "ai";
import { xai, MODELS, calculateCost } from "./config";
import { z } from "zod";

// Schema for a single question
const questionSchema = z.object({
  type: z.enum(["multiple-choice", "short-text", "long-text", "checkbox"]),
  question: z.string(),
  description: z.string().optional(),
  marks: z.number().min(1),
  options: z.array(z.string()).optional(), // For multiple choice and checkbox
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  rubric: z.string().optional(), // For text questions
});

// Schema for the entire test
const testSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1).max(50),
  totalMarks: z.number(),
});

export type AIQuestion = {
  type: "multiple-choice" | "short-text" | "long-text" | "checkbox";
  question: string;
  description?: string;
  marks: number;
  options?: string[];
  correctAnswer?: string | string[];
  rubric?: string;
};

export type AITestResult = {
  title: string;
  description?: string;
  questions: AIQuestion[];
  totalMarks: number;
  tokensInput: number;
  tokensOutput: number;
  cost: number;
};

/**
 * Create an entire test using AI
 * @param subject The subject area (e.g., "Mathematics", "History")
 * @param topic The specific topic (e.g., "Quadratic Equations", "World War II")
 * @param difficulty The difficulty level
 * @param questionCount Number of questions to generate
 * @param instructions Additional instructions for the AI
 * @returns Complete test structure
 */
export async function createTest(
  subject: string,
  topic: string,
  difficulty: "easy" | "medium" | "hard",
  questionCount: number,
  instructions?: string
): Promise<AITestResult> {
  const prompt = `Create a comprehensive ${difficulty} difficulty test for ${subject} on the topic of "${topic}" with ${questionCount} questions.

Requirements:
- Include a mix of question types (multiple choice, short answer, and essay questions)
- Allocate appropriate marks to each question (1-10 marks depending on complexity)
- For multiple choice questions: provide exactly 4 options with one correct answer
- For checkbox questions: provide 4-6 options with multiple correct answers
- For text questions: provide a brief marking rubric explaining what to look for
- Questions should build from foundational to advanced concepts
- Make questions clear, unambiguous, and educationally valuable
- Ensure questions test understanding, not just memorization
${instructions ? `\nAdditional Instructions: ${instructions}` : ""}

Create a well-structured test with ${questionCount} questions.`;

  try {
    const result = await generateObject({
      model: xai(MODELS.REASONING),
      schema: testSchema,
      prompt,
      temperature: 0.7, // Balanced temperature for creativity and consistency
    });

    // Calculate cost
    const tokensInput = result.usage?.promptTokens || 0;
    const tokensOutput = result.usage?.completionTokens || 0;
    const cost = calculateCost(tokensInput, tokensOutput);

    return {
      title: result.object.title,
      description: result.object.description,
      questions: result.object.questions,
      totalMarks: result.object.totalMarks,
      tokensInput,
      tokensOutput,
      cost,
    };
  } catch (error) {
    console.error("Error creating test:", error);
    throw new Error("Failed to create test. Please try again.");
  }
}

/**
 * Estimate the cost of creating a test
 * @param questionCount Number of questions
 * @returns Estimated cost in credits
 */
export function estimateTestCreationCost(questionCount: number): number {
  // Rough estimate: ~300 input tokens + ~200 output tokens per question
  const estimatedInput = 300 + questionCount * 100;
  const estimatedOutput = questionCount * 200;
  return calculateCost(estimatedInput, estimatedOutput);
}

