import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { generateText } from "ai";

const INPUT_CREDITS_PER_TOKEN = 0.00005;
const OUTPUT_CREDITS_PER_TOKEN = 0.00015;

export const autoMarkSubmission = action({
  args: {
    submissionId: v.id("testSubmissions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check user's current credits
    const creditCheck = await ctx.runQuery(api.credits.checkCredits, {
      amount: 0, // Just to get current credits
    });

    // Do not allow users with 0 credits
    if (creditCheck.credits <= 0) {
      throw new Error(
        "You need at least 1 credit to auto-mark submissions. Please purchase credits to continue."
      );
    }

    // Get submission and test data
    const data = await ctx.runQuery(api.tests.getSubmissionForMarking, {
      submissionId: args.submissionId,
    });

    const { submission, test } = data;

    // Filter for markable fields that need marking (skip auto-marked ones if possible, but for "auto-mark" usually we want AI to review text fields mainly)
    // The user said "go through every submission". AI should probably mark text fields.
    // Multiple choice are already marked by the system usually if correct answers are set.
    // But let's assume we want AI to mark everything that isn't marked or just text fields?
    // Usually AI is for Open-Ended questions.
    // Let's include all fields in the prompt but focus on text fields for scoring.
    // Actually, let's just send the whole thing and let AI score. Or better, only send fields that have marks assigned.

    const fieldsToMark = test.fields.filter(
      (f) =>
        f.type !== "pageBreak" &&
        f.type !== "infoBlock" &&
        f.marks &&
        f.marks > 0
    );

    if (fieldsToMark.length === 0) {
      return { success: true, message: "No markable fields found." };
    }

    // Construct prompt
    const questionsAndAnswers = fieldsToMark.map((f) => {
      const response = submission.responses[f.id];
      let responseText = "No response";
      if (response !== undefined && response !== null) {
        if (Array.isArray(response)) {
            // Map indices to option text for checkboxes/imageChoice
            if ((f.type === "checkboxes" || f.type === "imageChoice") && f.options) {
                 responseText = response.map((idx: any) => f.options![parseInt(idx)] || idx).join(", ");
            } else {
                 responseText = response.join(", ");
            }
        } else if ((f.type === "multipleChoice" || f.type === "dropdown") && f.options) {
            // Map index to option text
             responseText = f.options[parseInt(response)] || String(response);
        } else {
            responseText = String(response);
        }
      }

      let correctAnswerText = "";
      if (f.correctAnswers && f.correctAnswers.length > 0 && f.options) {
        correctAnswerText = `Correct Answer(s): ${f.correctAnswers
          .map((idx) => f.options![idx])
          .join(", ")}`;
      } else if (f.correctAnswers) {
          correctAnswerText = `Correct Answer(s): ${f.correctAnswers.join(", ")}`;
      } else {
          correctAnswerText = "No rigid correct answer key provided. Grade based on relevance and correctness.";
      }

      return `
ID: ${f.id}
Question: ${f.label}
Type: ${f.type}
Max Marks: ${f.marks}
Student Response: "${responseText}"
${correctAnswerText}
${f.helpText ? `Help Text/Hint: ${f.helpText}` : ""}
`;
    }).join("\n---\n");

    const systemPrompt = `You are an expert examiner. Your task is to mark a student's submission for a test.
You will be provided with a list of questions, the student's responses, and correct answers (if available).
For each question, assign a mark between 0 and the Max Marks.
Be fair and consistent. For text answers, evaluate based on understanding and correctness.
For multiple choice or fixed answers, use the provided correct answer key strictly.

Return a JSON object where keys are the Question IDs and values are the assigned marks (numbers).
Example:
{
  "field-123": 5,
  "field-456": 0,
  "field-789": 2.5
}

Ensure the JSON is valid and contains only the marking data.
`;

    const userPrompt = `Please mark the following submission:\n\n${questionsAndAnswers}`;

    // Estimate tokens
    const estimatedInputTokens = Math.ceil(userPrompt.length / 4);
    const estimatedOutputTokens = fieldsToMark.length * 10; // ~10 tokens per score line
    const estimatedCreditsRaw =
      estimatedInputTokens * INPUT_CREDITS_PER_TOKEN +
      estimatedOutputTokens * OUTPUT_CREDITS_PER_TOKEN;
    const estimatedCredits = Math.max(1, Math.ceil(estimatedCreditsRaw));

    if (creditCheck.credits < estimatedCredits) {
        // If strict checking is needed. But we already checked > 0.
        // We'll just proceed and error if deduction fails (though deduction logic is robust)
    }

    const result = await generateText({
      model: "xai/grok-4-fast-reasoning",
      system: systemPrompt,
      prompt: userPrompt,
    });

    const text = result.text;
    const usage = result.usage;

    // Calculate actual credits
    const usageObj = usage as any;
    let inputTokens = 0;
    let outputTokens = 0;

    if (usageObj) {
      inputTokens = usageObj.promptTokens ?? usageObj.inputTokens ?? 0;
      outputTokens = usageObj.completionTokens ?? usageObj.outputTokens ?? 0;
       if (inputTokens === 0 && outputTokens === 0 && usageObj.usage) {
        inputTokens = usageObj.usage.promptTokens ?? usageObj.usage.inputTokens ?? 0;
        outputTokens = usageObj.usage.completionTokens ?? usageObj.usage.outputTokens ?? 0;
      }
    }
    
    const creditsUsedRaw =
      inputTokens * INPUT_CREDITS_PER_TOKEN +
      outputTokens * OUTPUT_CREDITS_PER_TOKEN;
    
    // Ensure at least 1 credit is charged
    const creditsUsed = Math.max(1, Math.ceil(creditsUsedRaw));

    // Deduct credits
    await ctx.runMutation(api.credits.deductCredits, {
      userId: identity.subject,
      amount: creditsUsed,
      description: `AI Auto-Marking (${inputTokens} in + ${outputTokens} out)`,
      aiModel: "xai/grok-4-fast-reasoning",
    });

    // Parse marks
    let marks: Record<string, number> = {};
    try {
      marks = JSON.parse(text);
    } catch (error) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        marks = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI marking response");
      }
    }

    // Save marks
    await ctx.runMutation(api.tests.updateSubmissionMarks, {
      submissionId: args.submissionId,
      fieldMarks: marks,
    });

    return { success: true, creditsUsed };
  },
});

