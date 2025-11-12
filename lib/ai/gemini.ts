import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Get Gemini model - using gemini-2.0-flash-exp as the default
export function getGeminiModel(modelName: string = "gemini-2.0-flash-exp") {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
    ],
  });
}

// Helper to extract JSON from markdown code blocks or raw text
function extractJSON(text: string): string {
  // Try to find JSON in markdown code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to find JSON array or object directly
  const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  return text.trim();
}

// Helper to count tokens (approximate)
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

// Generate questions from a topic/subject
export async function generateQuestions(params: {
  topic: string;
  subject?: string;
  difficulty?: "easy" | "medium" | "hard";
  questionTypes: string[];
  count?: number;
  additionalContext?: string;
}) {
  const {
    topic,
    subject,
    difficulty = "medium",
    questionTypes,
    count = 5,
    additionalContext,
  } = params;

  const model = getGeminiModel();

  let prompt = `You are an expert educator creating high-quality assessment questions.

Generate ${count} ${difficulty} difficulty questions about "${topic}"`;

  if (subject) {
    prompt += ` in the subject of ${subject}`;
  }

  if (additionalContext) {
    prompt += `\n\nAdditional context: ${additionalContext}`;
  }

  prompt += `\n\nQuestion types to generate: ${questionTypes.join(", ")}

IMPORTANT: Return ONLY a valid JSON array with no additional text or markdown formatting.

For multiple choice questions, provide:
{
  "type": "multipleChoice",
  "questionText": "Question here?",
  "options": [
    {"text": "Option A", "isCorrect": false},
    {"text": "Option B", "isCorrect": true},
    {"text": "Option C", "isCorrect": false},
    {"text": "Option D", "isCorrect": false}
  ],
  "explanation": "Explanation here",
  "points": 1
}

For true/false questions:
{
  "type": "trueFalse",
  "questionText": "Statement here",
  "options": [
    {"text": "True", "isCorrect": true},
    {"text": "False", "isCorrect": false}
  ],
  "explanation": "Explanation here",
  "points": 1
}

For short answer questions:
{
  "type": "shortAnswer",
  "questionText": "Question here?",
  "modelAnswer": "Expected answer here",
  "explanation": "Key points that should be addressed",
  "points": 2
}

For essay questions:
{
  "type": "essay",
  "questionText": "Essay prompt here",
  "modelAnswer": "Key points: 1) point one, 2) point two, 3) point three",
  "explanation": "What should be covered in this essay",
  "points": 5
}

Return a JSON array of questions following these formats.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonText = extractJSON(text);
    const questions = JSON.parse(jsonText);

    // Validate that we got an array
    if (!Array.isArray(questions)) {
      throw new Error("Response is not a valid array");
    }

    // Calculate tokens used
    const tokensUsed = estimateTokens(prompt) + estimateTokens(text);

    return {
      questions,
      tokensUsed,
      success: true,
    };
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error(
      `Failed to generate questions: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Generate distractor options for multiple choice questions
export async function generateDistractors(params: {
  questionText: string;
  correctAnswer: string;
  count?: number;
  difficulty?: "easy" | "medium" | "hard";
}) {
  const {
    questionText,
    correctAnswer,
    count = 3,
    difficulty = "medium",
  } = params;

  const model = getGeminiModel();

  const prompt = `You are an expert educator creating multiple choice question options.

Given this question and correct answer, generate ${count} plausible but incorrect answer options (distractors):

Question: ${questionText}
Correct Answer: ${correctAnswer}
Difficulty Level: ${difficulty}

The distractors should:
1. Be plausible enough to seem correct at first glance
2. Test common misconceptions or errors
3. Be similar in length and complexity to the correct answer
4. Not be obviously wrong
5. Be appropriate for ${difficulty} difficulty level

IMPORTANT: Return ONLY a valid JSON array of strings with no additional text or markdown.

Example format:
["distractor 1", "distractor 2", "distractor 3"]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonText = extractJSON(text);
    const distractors = JSON.parse(jsonText);

    if (!Array.isArray(distractors)) {
      throw new Error("Response is not a valid array");
    }

    const tokensUsed = estimateTokens(prompt) + estimateTokens(text);

    return {
      distractors,
      tokensUsed,
      success: true,
    };
  } catch (error) {
    console.error("Error generating distractors:", error);
    throw new Error(
      `Failed to generate distractors: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Generate explanation for a question
export async function generateExplanation(params: {
  questionText: string;
  correctAnswer: string;
  questionType: string;
  difficulty?: "easy" | "medium" | "hard";
}) {
  const {
    questionText,
    correctAnswer,
    questionType,
    difficulty = "medium",
  } = params;

  const model = getGeminiModel();

  const prompt = `You are an expert educator providing clear explanations for students.

Provide a clear, educational explanation for why this answer is correct:

Question: ${questionText}
Correct Answer: ${correctAnswer}
Question Type: ${questionType}
Difficulty: ${difficulty}

The explanation should:
1. Be 2-4 sentences long
2. Help students understand the underlying concept
3. Be educational and encouraging
4. Be appropriate for the ${difficulty} difficulty level

IMPORTANT: Return ONLY the explanation text with no additional formatting, quotes, or markdown.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    const tokensUsed = estimateTokens(prompt) + estimateTokens(text);

    return {
      explanation: text,
      tokensUsed,
      success: true,
    };
  } catch (error) {
    console.error("Error generating explanation:", error);
    throw new Error(
      `Failed to generate explanation: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Grade an open-ended answer (short answer or essay)
export async function gradeOpenEndedAnswer(params: {
  questionText: string;
  modelAnswer: string;
  studentAnswer: string;
  rubric?: Array<{ criterion: string; points: number; description: string }>;
  maxPoints: number;
  questionType: string;
}) {
  const {
    questionText,
    modelAnswer,
    studentAnswer,
    rubric,
    maxPoints,
    questionType,
  } = params;

  const model = getGeminiModel();

  let prompt = `You are an expert educator grading student work fairly and constructively.

Grade this student's ${questionType} answer:

Question: ${questionText}
Model Answer: ${modelAnswer}
Student Answer: ${studentAnswer}
Maximum Points: ${maxPoints}`;

  if (rubric && rubric.length > 0) {
    prompt += `\n\nGrading Rubric:`;
    rubric.forEach((item) => {
      prompt += `\n- ${item.criterion} (${item.points} points): ${item.description}`;
    });
  }

  prompt += `\n\nProvide a fair, rigorous grade with constructive feedback.

IMPORTANT: Return ONLY a valid JSON object with no additional text or markdown.

Format:
{
  "pointsEarned": <number between 0 and ${maxPoints}>,
  "percentage": <percentage score>,
  "feedback": "<constructive, specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<area for improvement 1>", "<area for improvement 2>"],
  "keyPointsCovered": ["<covered point 1>", "<covered point 2>"],
  "keyPointsMissed": ["<missed point 1>", "<missed point 2>"],
  "confidence": <0-100, how confident you are in this grade>
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonText = extractJSON(text);
    const grading = JSON.parse(jsonText);

    const tokensUsed = estimateTokens(prompt) + estimateTokens(text);

    return {
      grading,
      tokensUsed,
      success: true,
    };
  } catch (error) {
    console.error("Error grading answer:", error);
    throw new Error(
      `Failed to grade answer: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Suggest improvements for a question
export async function suggestQuestionImprovements(params: {
  questionText: string;
  questionType: string;
  options?: Array<{ text: string; isCorrect: boolean }>;
  difficulty?: "easy" | "medium" | "hard";
}) {
  const { questionText, questionType, options, difficulty } = params;

  const model = getGeminiModel();

  let prompt = `You are an expert educator reviewing assessment questions for quality.

Review this question and suggest improvements:

Question: ${questionText}
Type: ${questionType}`;

  if (difficulty) {
    prompt += `\nIntended Difficulty: ${difficulty}`;
  }

  if (options && options.length > 0) {
    prompt += `\nOptions:\n${options.map((opt, i) => `${i + 1}. ${opt.text} ${opt.isCorrect ? "(CORRECT)" : ""}`).join("\n")}`;
  }

  prompt += `\n\nEvaluate and provide suggestions for improving:
1. Clarity and wording
2. Difficulty level appropriateness
3. Answer options (if applicable)
4. Potential ambiguities or biases
5. Educational value

IMPORTANT: Return ONLY a valid JSON object with no additional text or markdown.

Format:
{
  "clarityScore": <1-10>,
  "difficultyScore": <1-10>,
  "overallScore": <1-10>,
  "suggestions": ["<specific suggestion 1>", "<specific suggestion 2>"],
  "improvedVersion": "<your improved version of the question>",
  "improvedOptions": [{"text": "option", "isCorrect": boolean}],
  "reasoning": "<brief explanation of your improvements>"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonText = extractJSON(text);
    const improvements = JSON.parse(jsonText);

    const tokensUsed = estimateTokens(prompt) + estimateTokens(text);

    return {
      improvements,
      tokensUsed,
      success: true,
    };
  } catch (error) {
    console.error("Error suggesting improvements:", error);
    throw new Error(
      `Failed to suggest improvements: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Calculate estimated credits for an AI operation
export function calculateCreditsForOperation(
  operationType:
    | "question_generation"
    | "distractor_generation"
    | "explanation_generation"
    | "grading"
    | "improvement_suggestion",
  additionalParams?: { questionCount?: number; answerLength?: number },
): number {
  const baseCredits = {
    question_generation: 2,
    distractor_generation: 1,
    explanation_generation: 1,
    grading: 3,
    improvement_suggestion: 2,
  };

  let credits = baseCredits[operationType];

  // Adjust based on additional parameters
  if (
    operationType === "question_generation" &&
    additionalParams?.questionCount
  ) {
    credits *= additionalParams.questionCount;
  }

  if (operationType === "grading" && additionalParams?.answerLength) {
    // Charge more for longer answers
    if (additionalParams.answerLength > 500) {
      credits += 2;
    }
    if (additionalParams.answerLength > 1000) {
      credits += 3;
    }
  }

  return credits;
}

// Calculate credits from tokens used (more accurate, post-operation)
export function calculateCreditsFromTokens(tokensUsed: number): number {
  // Pricing model: ~1 credit per 1000 tokens
  // Round up to ensure we always charge at least 1 credit
  return Math.max(1, Math.ceil(tokensUsed / 1000));
}
