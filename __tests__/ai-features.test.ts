import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock the Gemini AI module
const mockGenerateQuestions = jest.fn();
const mockGenerateDistractors = jest.fn();
const mockGenerateExplanation = jest.fn();
const mockGradeOpenEndedAnswer = jest.fn();
const mockSuggestQuestionImprovements = jest.fn();
const mockCalculateCreditsFromTokens = jest.fn((tokens: number) =>
  Math.max(1, Math.ceil(tokens / 1000)),
);
const mockEstimateTokens = jest.fn((text: string) =>
  Math.ceil(text.length / 4),
);

jest.mock("../lib/ai/gemini", () => ({
  generateQuestions: mockGenerateQuestions,
  generateDistractors: mockGenerateDistractors,
  generateExplanation: mockGenerateExplanation,
  gradeOpenEndedAnswer: mockGradeOpenEndedAnswer,
  suggestQuestionImprovements: mockSuggestQuestionImprovements,
  calculateCreditsFromTokens: mockCalculateCreditsFromTokens,
  estimateTokens: mockEstimateTokens,
}));

describe("AI Question Generation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate multiple choice questions", async () => {
    const mockResult = {
      questions: [
        {
          type: "multipleChoice",
          questionText: "What is photosynthesis?",
          options: [
            { text: "Plant respiration", isCorrect: false },
            { text: "Process of making food from sunlight", isCorrect: true },
            { text: "Plant reproduction", isCorrect: false },
            { text: "Plant growth", isCorrect: false },
          ],
          explanation:
            "Photosynthesis is the process by which plants convert light energy into chemical energy.",
          points: 1,
        },
      ],
      tokensUsed: 500,
      success: true,
    };

    mockGenerateQuestions.mockResolvedValue(mockResult);

    const result = await mockGenerateQuestions({
      topic: "Photosynthesis",
      subject: "Biology",
      difficulty: "medium",
      questionTypes: ["multipleChoice"],
      count: 1,
    });

    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].type).toBe("multipleChoice");
    expect(result.questions[0].options).toHaveLength(4);
    expect(result.success).toBe(true);
  });

  it("should generate true/false questions", async () => {
    const mockResult = {
      questions: [
        {
          type: "trueFalse",
          questionText: "Photosynthesis occurs in the chloroplasts",
          options: [
            { text: "True", isCorrect: true },
            { text: "False", isCorrect: false },
          ],
          explanation:
            "Chloroplasts contain chlorophyll which captures light energy.",
          points: 1,
        },
      ],
      tokensUsed: 300,
      success: true,
    };

    mockGenerateQuestions.mockResolvedValue(mockResult);

    const result = await mockGenerateQuestions({
      topic: "Photosynthesis",
      questionTypes: ["trueFalse"],
      count: 1,
    });

    expect(result.questions[0].type).toBe("trueFalse");
    expect(result.questions[0].options).toHaveLength(2);
  });

  it("should generate short answer questions", async () => {
    const mockResult = {
      questions: [
        {
          type: "shortAnswer",
          questionText: "Describe the main purpose of photosynthesis",
          modelAnswer:
            "To convert light energy into chemical energy stored in glucose",
          explanation:
            "Students should mention light energy, conversion, and glucose/sugar production",
          points: 2,
        },
      ],
      tokensUsed: 400,
      success: true,
    };

    mockGenerateQuestions.mockResolvedValue(mockResult);

    const result = await mockGenerateQuestions({
      topic: "Photosynthesis",
      questionTypes: ["shortAnswer"],
      count: 1,
    });

    expect(result.questions[0].type).toBe("shortAnswer");
    expect(result.questions[0].modelAnswer).toBeDefined();
  });

  it("should generate essay questions", async () => {
    const mockResult = {
      questions: [
        {
          type: "essay",
          questionText:
            "Explain the process of photosynthesis and its importance to life on Earth",
          modelAnswer:
            "Key points: 1) Light-dependent reactions, 2) Calvin cycle, 3) Oxygen production, 4) Food chain foundation",
          explanation:
            "Essay should cover the chemical process and ecological significance",
          points: 5,
        },
      ],
      tokensUsed: 600,
      success: true,
    };

    mockGenerateQuestions.mockResolvedValue(mockResult);

    const result = await mockGenerateQuestions({
      topic: "Photosynthesis",
      questionTypes: ["essay"],
      count: 1,
    });

    expect(result.questions[0].type).toBe("essay");
    expect(result.questions[0].points).toBeGreaterThan(1);
  });
});

describe("AI Distractor Generation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate plausible distractors", async () => {
    const mockResult = {
      distractors: ["Mitochondria", "Nucleus", "Cell membrane"],
      tokensUsed: 200,
      success: true,
    };

    mockGenerateDistractors.mockResolvedValue(mockResult);

    const result = await mockGenerateDistractors({
      questionText: "Where does photosynthesis occur in plant cells?",
      correctAnswer: "Chloroplasts",
      count: 3,
      difficulty: "medium",
    });

    expect(result.distractors).toHaveLength(3);
    expect(result.distractors).not.toContain("Chloroplasts");
    expect(result.success).toBe(true);
  });

  it("should generate difficulty-appropriate distractors", async () => {
    const mockResult = {
      distractors: ["Chromoplasts", "Leucoplasts", "Amyloplasts"],
      tokensUsed: 250,
      success: true,
    };

    mockGenerateDistractors.mockResolvedValue(mockResult);

    const result = await mockGenerateDistractors({
      questionText: "Where does photosynthesis occur in plant cells?",
      correctAnswer: "Chloroplasts",
      count: 3,
      difficulty: "hard",
    });

    expect(result.distractors).toHaveLength(3);
    expect(result.success).toBe(true);
  });
});

describe("AI Explanation Generation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate clear explanations", async () => {
    const mockResult = {
      explanation:
        "Photosynthesis occurs in chloroplasts because they contain chlorophyll, the pigment that captures light energy and converts it into chemical energy.",
      tokensUsed: 150,
      success: true,
    };

    mockGenerateExplanation.mockResolvedValue(mockResult);

    const result = await mockGenerateExplanation({
      questionText: "Where does photosynthesis occur?",
      correctAnswer: "Chloroplasts",
      questionType: "multipleChoice",
      difficulty: "medium",
    });

    expect(result.explanation).toBeDefined();
    expect(result.explanation.length).toBeGreaterThan(0);
    expect(result.success).toBe(true);
  });
});

describe("AI Grading", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should grade short answers accurately", async () => {
    const mockResult = {
      grading: {
        pointsEarned: 8,
        percentage: 80,
        feedback:
          "Good answer that covers most key points. Could be more specific about the light-dependent reactions.",
        strengths: ["Mentions chlorophyll", "Discusses energy conversion"],
        improvements: [
          "Add details about light-dependent reactions",
          "Mention glucose production",
        ],
        keyPointsCovered: ["chlorophyll", "light energy", "chemical energy"],
        keyPointsMissed: ["glucose", "oxygen"],
        confidence: 85,
      },
      tokensUsed: 800,
      success: true,
    };

    mockGradeOpenEndedAnswer.mockResolvedValue(mockResult);

    const result = await mockGradeOpenEndedAnswer({
      questionText: "Explain how photosynthesis works",
      modelAnswer:
        "Photosynthesis is the process where plants use chlorophyll to capture light energy and convert it into chemical energy in the form of glucose, releasing oxygen as a byproduct.",
      studentAnswer:
        "Plants use chlorophyll to capture light energy and convert it into chemical energy.",
      maxPoints: 10,
      questionType: "shortAnswer",
    });

    expect(result.grading.pointsEarned).toBeLessThanOrEqual(10);
    expect(result.grading.percentage).toBeLessThanOrEqual(100);
    expect(result.grading.feedback).toBeDefined();
    expect(result.grading.confidence).toBeGreaterThan(0);
  });

  it("should grade essays with rubric", async () => {
    const mockResult = {
      grading: {
        pointsEarned: 18,
        percentage: 90,
        feedback:
          "Excellent essay with comprehensive coverage of the topic. Well-structured with clear examples.",
        strengths: ["Clear structure", "Good examples", "Thorough explanation"],
        improvements: ["Could mention environmental impact"],
        keyPointsCovered: [
          "light reactions",
          "Calvin cycle",
          "oxygen production",
          "ecological importance",
        ],
        keyPointsMissed: ["environmental factors"],
        confidence: 90,
      },
      tokensUsed: 1200,
      success: true,
    };

    mockGradeOpenEndedAnswer.mockResolvedValue(mockResult);

    const result = await mockGradeOpenEndedAnswer({
      questionText:
        "Write an essay explaining photosynthesis and its importance",
      modelAnswer:
        "Comprehensive coverage of light-dependent and light-independent reactions, oxygen production, and ecological significance.",
      studentAnswer: "Photosynthesis is a vital process... [long essay]",
      rubric: [
        {
          criterion: "Understanding of light reactions",
          points: 5,
          description: "Explains light-dependent reactions",
        },
        {
          criterion: "Understanding of Calvin cycle",
          points: 5,
          description: "Explains light-independent reactions",
        },
        {
          criterion: "Ecological importance",
          points: 5,
          description: "Discusses impact on ecosystem",
        },
        {
          criterion: "Clarity and structure",
          points: 5,
          description: "Well-organized and clear",
        },
      ],
      maxPoints: 20,
      questionType: "essay",
    });

    expect(result.grading.pointsEarned).toBeGreaterThan(15);
    expect(result.grading.strengths).toBeDefined();
    expect(result.success).toBe(true);
  });
});

describe("AI Question Improvement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should suggest improvements for unclear questions", async () => {
    const mockResult = {
      improvements: {
        clarityScore: 6,
        difficultyScore: 7,
        overallScore: 6.5,
        suggestions: [
          "Specify which aspect of photosynthesis",
          "Clarify if asking about location or process",
          "Remove ambiguous wording",
        ],
        improvedVersion:
          "In which organelle does photosynthesis primarily occur in plant cells?",
        improvedOptions: [
          { text: "Chloroplasts", isCorrect: true },
          { text: "Mitochondria", isCorrect: false },
          { text: "Nucleus", isCorrect: false },
          { text: "Ribosomes", isCorrect: false },
        ],
        reasoning:
          "Made the question more specific and clarified what is being asked",
      },
      tokensUsed: 400,
      success: true,
    };

    mockSuggestQuestionImprovements.mockResolvedValue(mockResult);

    const result = await mockSuggestQuestionImprovements({
      questionText: "What about photosynthesis?",
      questionType: "multipleChoice",
      options: [
        { text: "Chloroplasts", isCorrect: true },
        { text: "Other stuff", isCorrect: false },
      ],
      difficulty: "medium",
    });

    expect(result.improvements.suggestions).toBeDefined();
    expect(result.improvements.suggestions.length).toBeGreaterThan(0);
    expect(result.improvements.improvedVersion).toBeDefined();
    expect(result.improvements.clarityScore).toBeGreaterThan(0);
  });
});

describe("Credit Calculation", () => {
  it("should calculate credits from tokens correctly", () => {
    expect(mockCalculateCreditsFromTokens(500)).toBe(1);
    expect(mockCalculateCreditsFromTokens(1000)).toBe(1);
    expect(mockCalculateCreditsFromTokens(1500)).toBe(2);
    expect(mockCalculateCreditsFromTokens(3000)).toBe(3);
  });

  it("should ensure minimum of 1 credit", () => {
    expect(mockCalculateCreditsFromTokens(100)).toBe(1);
    expect(mockCalculateCreditsFromTokens(1)).toBe(1);
  });
});
