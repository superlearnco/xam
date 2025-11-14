import { generateObject } from "ai";
import { xai, MODELS, calculateCost } from "./config";
import { z } from "zod";

// Schema for grading response
const gradingSchema = z.object({
  marks: z.number().min(0),
  feedback: z.string(),
  reasoning: z.string(),
  isCorrect: z.boolean(),
});

export type GradeResponseResult = {
  marks: number;
  maxMarks: number;
  feedback: string;
  reasoning: string;
  isCorrect: boolean;
  tokensInput: number;
  tokensOutput: number;
  cost: number;
};

/**
 * Grade a student response using AI
 * @param question The question text
 * @param studentResponse The student's answer
 * @param maxMarks Maximum marks for this question
 * @param rubric Optional marking rubric
 * @param correctAnswer Optional correct answer (for reference)
 * @returns Grading result with marks, feedback, and reasoning
 */
export async function gradeResponse(
  question: string,
  studentResponse: string,
  maxMarks: number,
  rubric?: string,
  correctAnswer?: string
): Promise<GradeResponseResult> {
  const prompt = `Grade this student response fairly and thoroughly.

Question: ${question}
${correctAnswer ? `Correct/Expected Answer: ${correctAnswer}` : ""}
${rubric ? `Marking Rubric: ${rubric}` : ""}
Maximum Marks: ${maxMarks}

Student Response: "${studentResponse}"

Instructions:
1. Award marks from 0 to ${maxMarks} based on accuracy and completeness
2. Consider partial credit where appropriate
3. Provide constructive, specific feedback
4. Explain your reasoning for the marks awarded
5. Be fair but thorough in your assessment
6. If the response is blank or irrelevant, award 0 marks
7. Mark "isCorrect" as true if the student earned at least 70% of marks

Provide your grading assessment.`;

  try {
    const result = await generateObject({
      model: xai(MODELS.REASONING),
      schema: gradingSchema,
      prompt,
      temperature: 0.3, // Lower temperature for consistent grading
    });

    // Ensure marks don't exceed max
    const marks = Math.min(Math.max(0, result.object.marks), maxMarks);

    // Calculate cost
    const tokensInput = result.usage?.promptTokens || 0;
    const tokensOutput = result.usage?.completionTokens || 0;
    const cost = calculateCost(tokensInput, tokensOutput);

    return {
      marks,
      maxMarks,
      feedback: result.object.feedback,
      reasoning: result.object.reasoning,
      isCorrect: result.object.isCorrect,
      tokensInput,
      tokensOutput,
      cost,
    };
  } catch (error) {
    console.error("Error grading response:", error);
    throw new Error("Failed to grade response. Please try again.");
  }
}

/**
 * Estimate the cost of grading a response
 * @param responseLength Length of student response
 * @returns Estimated cost in credits
 */
export function estimateGradingCost(responseLength: number): number {
  // Rough estimate: question (50) + rubric (100) + response + output (150)
  const estimatedInput = 150 + Math.min(responseLength, 500);
  const estimatedOutput = 150;
  return calculateCost(estimatedInput, estimatedOutput);
}

