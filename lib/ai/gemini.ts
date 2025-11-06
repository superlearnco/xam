import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Get Gemini Pro model
export function getGeminiModel(modelName: "gemini-pro" | "gemini-pro-vision" = "gemini-pro") {
  return genAI.getGenerativeModel({ model: modelName });
}

// Generate questions from a topic/subject
export async function generateQuestions(params: {
  topic: string;
  subject?: string;
  difficulty?: "easy" | "medium" | "hard";
  questionType: "multiple_choice" | "true_false" | "short_answer" | "essay";
  count?: number;
  additionalContext?: string;
}) {
  const {
    topic,
    subject,
    difficulty = "medium",
    questionType,
    count = 5,
    additionalContext,
  } = params;

  const model = getGeminiModel();

  let prompt = `Generate ${count} ${difficulty} difficulty ${questionType.replace("_", " ")} questions about "${topic}"`;

  if (subject) {
    prompt += ` in the subject of ${subject}`;
  }

  if (additionalContext) {
    prompt += `\n\nAdditional context: ${additionalContext}`;
  }

  if (questionType === "multiple_choice") {
    prompt += `\n\nFor each question, provide:
1. The question text
2. Four answer options (A, B, C, D)
3. The correct answer
4. A brief explanation of why the answer is correct

Format your response as a JSON array with this structure:
[
  {
    "questionText": "Question here?",
    "options": [
      {"id": "A", "text": "Option A", "isCorrect": false},
      {"id": "B", "text": "Option B", "isCorrect": true},
      {"id": "C", "text": "Option C", "isCorrect": false},
      {"id": "D", "text": "Option D", "isCorrect": false}
    ],
    "explanation": "Explanation here"
  }
]`;
  } else if (questionType === "true_false") {
    prompt += `\n\nFor each question, provide:
1. The statement
2. Whether it's true or false
3. A brief explanation

Format your response as a JSON array with this structure:
[
  {
    "questionText": "Statement here",
    "options": [
      {"id": "true", "text": "True", "isCorrect": true},
      {"id": "false", "text": "False", "isCorrect": false}
    ],
    "explanation": "Explanation here"
  }
]`;
  } else if (questionType === "short_answer") {
    prompt += `\n\nFor each question, provide:
1. The question text
2. An expected answer
3. Key keywords that should be in a correct answer

Format your response as a JSON array with this structure:
[
  {
    "questionText": "Question here?",
    "expectedAnswer": "Expected answer here",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
]`;
  } else if (questionType === "essay") {
    prompt += `\n\nFor each question, provide:
1. The essay prompt
2. Key points that should be addressed
3. Suggested length

Format your response as a JSON array with this structure:
[
  {
    "questionText": "Essay prompt here",
    "expectedAnswer": "Key points that should be addressed",
    "keywords": ["point1", "point2", "point3"]
  }
]`;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;

    const questions = JSON.parse(jsonText);
    return questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions");
  }
}

// Generate distractor options for multiple choice questions
export async function generateDistractors(params: {
  questionText: string;
  correctAnswer: string;
  count?: number;
}) {
  const { questionText, correctAnswer, count = 3 } = params;

  const model = getGeminiModel();

  const prompt = `Given this question and correct answer, generate ${count} plausible but incorrect answer options (distractors):

Question: ${questionText}
Correct Answer: ${correctAnswer}

The distractors should:
1. Be plausible enough to seem correct at first glance
2. Test common misconceptions or errors
3. Be similar in length and complexity to the correct answer
4. Not be obviously wrong

Format your response as a JSON array of strings:
["distractor 1", "distractor 2", "distractor 3"]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;

    const distractors = JSON.parse(jsonText);
    return distractors;
  } catch (error) {
    console.error("Error generating distractors:", error);
    throw new Error("Failed to generate distractors");
  }
}

// Generate explanation for a question
export async function generateExplanation(params: {
  questionText: string;
  correctAnswer: string;
  questionType: string;
}) {
  const { questionText, correctAnswer, questionType } = params;

  const model = getGeminiModel();

  const prompt = `Provide a clear, concise explanation for why this answer is correct:

Question: ${questionText}
Correct Answer: ${correctAnswer}
Question Type: ${questionType}

The explanation should:
1. Be 2-3 sentences
2. Help students understand the concept
3. Be educational but not condescending

Respond with just the explanation text, no additional formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error("Error generating explanation:", error);
    throw new Error("Failed to generate explanation");
  }
}

// Grade an open-ended answer (short answer or essay)
export async function gradeOpenEndedAnswer(params: {
  questionText: string;
  expectedAnswer: string;
  studentAnswer: string;
  keywords?: string[];
  maxPoints: number;
}) {
  const { questionText, expectedAnswer, studentAnswer, keywords, maxPoints } = params;

  const model = getGeminiModel();

  let prompt = `Grade this student's answer to the following question:

Question: ${questionText}
Expected Answer: ${expectedAnswer}
Student Answer: ${studentAnswer}
Maximum Points: ${maxPoints}`;

  if (keywords && keywords.length > 0) {
    prompt += `\nKey concepts that should be present: ${keywords.join(", ")}`;
  }

  prompt += `\n\nProvide a grade and feedback in JSON format:
{
  "pointsEarned": <number between 0 and ${maxPoints}>,
  "feedback": "<constructive feedback for the student>",
  "keyPointsCovered": ["<list of key points the student addressed>"],
  "keyPointsMissed": ["<list of key points the student missed>"]
}

Be fair but rigorous in grading. Provide specific, actionable feedback.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;

    const grading = JSON.parse(jsonText);
    return grading;
  } catch (error) {
    console.error("Error grading answer:", error);
    throw new Error("Failed to grade answer");
  }
}

// Suggest improvements for a question
export async function suggestQuestionImprovements(params: {
  questionText: string;
  questionType: string;
  options?: Array<{ text: string; isCorrect: boolean }>;
}) {
  const { questionText, questionType, options } = params;

  const model = getGeminiModel();

  let prompt = `Review this question and suggest improvements:

Question: ${questionText}
Type: ${questionType}`;

  if (options && options.length > 0) {
    prompt += `\nOptions:\n${options.map((opt, i) => `${i + 1}. ${opt.text} ${opt.isCorrect ? "(correct)" : ""}`).join("\n")}`;
  }

  prompt += `\n\nProvide suggestions for improving:
1. Clarity and wording
2. Difficulty level appropriateness
3. Answer options (if applicable)
4. Potential ambiguities

Format your response as JSON:
{
  "clarityScore": <1-10>,
  "suggestions": ["<suggestion 1>", "<suggestion 2>"],
  "improvedVersion": "<your improved version of the question>",
  "reasoning": "<brief explanation of your changes>"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;

    const improvements = JSON.parse(jsonText);
    return improvements;
  } catch (error) {
    console.error("Error suggesting improvements:", error);
    throw new Error("Failed to suggest improvements");
  }
}

// Calculate estimated credits for an AI operation
export function calculateCreditsForOperation(
  operationType: "question_generation" | "distractor_generation" | "explanation_generation" | "grading" | "improvement_suggestion",
  additionalParams?: { questionCount?: number; answerLength?: number }
): number {
  const baseCredits = {
    question_generation: 2,
    distractor_generation: 1,
    explanation_generation: 1,
    grading: 2,
    improvement_suggestion: 1,
  };

  let credits = baseCredits[operationType];

  // Adjust based on additional parameters
  if (operationType === "question_generation" && additionalParams?.questionCount) {
    credits *= additionalParams.questionCount;
  }

  if (operationType === "grading" && additionalParams?.answerLength) {
    // Charge more for longer answers
    if (additionalParams.answerLength > 500) {
      credits += 1;
    }
    if (additionalParams.answerLength > 1000) {
      credits += 1;
    }
  }

  return credits;
}
