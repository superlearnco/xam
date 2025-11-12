# AI Features Implementation Guide

This document describes the AI features implemented in Xam using Google Gemini 2.0 Flash.

## Overview

The AI features use Google's Gemini 2.0 Flash model to provide intelligent assistance for:
- Question generation
- Distractor (incorrect option) generation
- Explanation generation
- Open-ended answer grading
- Question improvement suggestions

## Setup

### 1. API Key Configuration

Add your Gemini API key to `.env.local`:

```bash
GEMINI_API_KEY=your_api_key_here
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

### 2. Credit System

- Users start with 50 free credits (welcome bonus)
- 1 credit ≈ 1000 tokens
- Minimum charge is 1 credit per operation
- Credit costs:
  - Question generation: ~2 credits per question
  - Distractor generation: ~1 credit
  - Explanation generation: ~1 credit
  - Answer grading: 3-6 credits (depending on length)
  - Question improvement: ~2 credits

## Architecture

### Backend (Convex)

**File: `convex/ai.ts`**

Contains all AI-related Convex actions:

- `generateQuestionsAction` - Bulk question generation
- `generateDistractorsAction` - Generate plausible wrong answers
- `generateExplanationAction` - Generate educational explanations
- `gradeAnswerAction` - Grade a single open-ended answer
- `batchGradeAnswersAction` - Grade multiple answers at once
- `improveQuestionAction` - Get improvement suggestions

**File: `lib/ai/gemini.ts`**

Core Gemini integration with helper functions:
- Model configuration (temperature, safety settings)
- JSON extraction utilities
- Token estimation
- Credit calculation

### Frontend Components

**1. AI Question Generation Modal**
- File: `components/ai-question-generation-modal.tsx`
- Usage: Bulk generate questions with customizable parameters
- Features:
  - Topic and subject input
  - Difficulty selection (easy/medium/hard)
  - Question type selection (multiple choice, true/false, short answer, essay)
  - Quantity slider (1-20 questions)
  - Preview and edit before inserting

**2. AI Distractor Button**
- File: `components/ai-distractor-button.tsx`
- Usage: Generate incorrect options for multiple choice questions
- Integrates into question editor

**3. AI Explanation Button**
- File: `components/ai-explanation-button.tsx`
- Usage: Generate educational explanations for correct answers
- Integrates into question editor

**4. AI Grading Button**
- File: `components/ai-grading-button.tsx`
- Usage: Grade open-ended answers (short answer, essay)
- Features:
  - Detailed feedback with strengths and improvements
  - Rubric-based grading support
  - Confidence score
  - Key points covered/missed analysis
  - Accept or override AI grade

## Usage Examples

### 1. Generate Questions

```typescript
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

const generateQuestions = useAction(api.ai.generateQuestionsAction);

const result = await generateQuestions({
  topic: "Photosynthesis",
  subject: "Biology",
  difficulty: "medium",
  questionTypes: ["multipleChoice", "trueFalse"],
  count: 5,
  projectId: projectId, // optional
});

// result.questions contains the generated questions
// result.creditsUsed shows how many credits were charged
```

### 2. Generate Distractors

```typescript
const generateDistractors = useAction(api.ai.generateDistractorsAction);

const result = await generateDistractors({
  questionText: "What is the powerhouse of the cell?",
  correctAnswer: "Mitochondria",
  count: 3,
  difficulty: "medium",
});

// result.distractors: ["Nucleus", "Ribosome", "Chloroplast"]
```

### 3. Grade Open-Ended Answer

```typescript
const gradeAnswer = useAction(api.ai.gradeAnswerAction);

const result = await gradeAnswer({
  answerId: answerId,
  questionId: questionId,
  questionText: "Explain photosynthesis",
  modelAnswer: "Photosynthesis converts light energy into chemical energy...",
  studentAnswer: "Plants make food using sunlight...",
  maxPoints: 10,
  questionType: "shortAnswer",
  rubric: [ /* optional rubric */ ],
  projectId: projectId,
});

// result.grading contains:
// - pointsEarned
// - percentage
// - feedback
// - strengths
// - improvements
// - keyPointsCovered
// - keyPointsMissed
// - confidence
```

### 4. Batch Grade Answers

```typescript
const batchGrade = useAction(api.ai.batchGradeAnswersAction);

const result = await batchGrade({
  submissionId: submissionId,
  projectId: projectId,
  answers: [
    {
      answerId: id1,
      questionId: qid1,
      questionText: "Question 1",
      modelAnswer: "Answer 1",
      studentAnswer: "Student's answer 1",
      maxPoints: 10,
      questionType: "shortAnswer",
    },
    // ... more answers
  ],
});

// result contains:
// - results array with grading for each answer
// - totalCreditsUsed
// - successCount
// - failureCount
```

## Integration Steps

### Step 1: Add AI Generation to Project Editor

```tsx
import { AIQuestionGenerationModal } from "@/components/ai-question-generation-modal";

function ProjectEditor() {
  const [showAIModal, setShowAIModal] = useState(false);

  const handleQuestionsGenerated = (questions: any[]) => {
    // Insert questions into your project
    questions.forEach(q => {
      // Add question to project
    });
  };

  return (
    <>
      <Button onClick={() => setShowAIModal(true)}>
        <Sparkles className="mr-2 h-4 w-4" />
        Generate with AI
      </Button>

      <AIQuestionGenerationModal
        open={showAIModal}
        onOpenChange={setShowAIModal}
        projectId={projectId}
        onQuestionsGenerated={handleQuestionsGenerated}
      />
    </>
  );
}
```

### Step 2: Add Distractor Generation to Question Editor

```tsx
import { AIDistractorButton } from "@/components/ai-distractor-button";

function QuestionEditor({ question }) {
  const handleDistractors = (distractors: string[]) => {
    // Add distractors as options
    const newOptions = distractors.map(text => ({
      text,
      isCorrect: false,
      imageUrl: null,
    }));
    // Update question options
  };

  return (
    <div>
      <AIDistractorButton
        questionText={question.text}
        correctAnswer={getCorrectAnswer(question)}
        difficulty={question.difficulty}
        onDistractorsGenerated={handleDistractors}
      />
    </div>
  );
}
```

### Step 3: Add AI Grading to Marking Interface

```tsx
import { AIGradingButton } from "@/components/ai-grading-button";

function AnswerGrading({ answer, question }) {
  return (
    <div>
      <AIGradingButton
        answerId={answer._id}
        questionId={question._id}
        questionText={question.questionText}
        modelAnswer={question.modelAnswer}
        studentAnswer={answer.textAnswer}
        maxPoints={question.points}
        questionType={question.type}
        rubric={question.rubric}
        projectId={projectId}
        onGradingComplete={(grading) => {
          // Handle grading complete
        }}
      />
    </div>
  );
}
```

## Testing

Comprehensive test suite in `__tests__/ai-features.test.ts`:

```bash
pnpm test ai-features.test.ts
```

Tests cover:
- Question generation (all types)
- Distractor generation
- Explanation generation
- Answer grading (short answer and essay)
- Question improvement suggestions
- Credit calculation

All 12 tests passing ✅

## Model Configuration

The Gemini model is configured in `lib/ai/gemini.ts`:

```typescript
{
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.7,     // Balance creativity and consistency
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
  safetySettings: [
    // Block inappropriate content for educational use
  ],
}
```

## Credit Management

Credits are managed through internal mutations:

1. **Check Credits**: Before each operation
2. **Deduct Credits**: After successful operation based on actual tokens used
3. **Log Operation**: Record in `aiGenerations` table with metadata
4. **Handle Errors**: Log failed operations without deducting credits

## Best Practices

1. **Always check credit balance** before showing AI features
2. **Show estimated costs** to users before operations
3. **Allow editing** of AI-generated content
4. **Provide feedback** on credit usage after operations
5. **Implement retry logic** for network failures
6. **Log all operations** for analytics and debugging
7. **Use appropriate difficulty levels** for better results
8. **Provide context** in prompts for better generation

## Error Handling

All AI actions include comprehensive error handling:

```typescript
try {
  const result = await aiOperation(...);
  // Success: deduct credits and log
} catch (error) {
  // Log failed attempt (no credit deduction)
  // Show user-friendly error message
  toast.error(error.message || "Failed to process request");
}
```

## Future Enhancements

Potential improvements:
- [ ] Add streaming responses for real-time generation
- [ ] Implement question bank with AI-generated content
- [ ] Add multi-language support
- [ ] Integrate with more advanced models (Gemini Pro, GPT-4)
- [ ] Add AI-powered analytics and insights
- [ ] Implement automatic question difficulty assessment
- [ ] Add plagiarism detection for student answers

## Troubleshooting

### Issue: "Insufficient credits"
**Solution**: User needs to purchase more credits through billing system

### Issue: "Failed to generate questions"
**Solution**: 
- Check API key is set correctly
- Verify internet connection
- Check Gemini API status
- Review error logs in `aiGenerations` table

### Issue: TypeScript errors with `internal.ai`
**Solution**: Run `npx convex dev` to regenerate type definitions

### Issue: Poor quality generations
**Solution**:
- Provide more specific topics and context
- Adjust difficulty level
- Use additional context field for requirements
- Review and edit generated content before using

## Support

For issues or questions:
1. Check the error logs in Convex dashboard
2. Review `aiGenerations` table for operation history
3. Test with the provided test suite
4. Verify API key and credit balance