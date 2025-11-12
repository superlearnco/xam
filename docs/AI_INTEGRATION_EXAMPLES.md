# AI Features Integration Examples

This guide provides practical examples for integrating AI features into the Xam platform.

## Table of Contents

1. [Project Editor Integration](#project-editor-integration)
2. [Question Editor Integration](#question-editor-integration)
3. [Marking Interface Integration](#marking-interface-integration)
4. [Dashboard Integration](#dashboard-integration)

---

## Project Editor Integration

### Add AI Question Generation Button

```tsx
// File: app/app/[projectId]/edit/page.tsx

import { useState } from "react";
import { AIQuestionGenerationModal } from "@/components/ai-question-generation-modal";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ProjectEditor() {
  const [showAIModal, setShowAIModal] = useState(false);
  const createQuestion = useMutation(api.questions.createQuestion);

  const handleQuestionsGenerated = async (questions: any[]) => {
    // Insert each generated question into the project
    for (const question of questions) {
      await createQuestion({
        projectId: projectId,
        type: question.type,
        questionText: question.questionText,
        options: question.options || [],
        explanation: question.explanation,
        modelAnswer: question.modelAnswer,
        points: question.points || 1,
        difficulty: question.difficulty || "medium",
        generatedByAI: true,
      });
    }
    
    toast.success(`Added ${questions.length} AI-generated questions!`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1>Edit Project</h1>
        
        <Button onClick={() => setShowAIModal(true)}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate with AI
        </Button>
      </div>

      {/* Rest of your editor UI */}

      <AIQuestionGenerationModal
        open={showAIModal}
        onOpenChange={setShowAIModal}
        projectId={projectId}
        onQuestionsGenerated={handleQuestionsGenerated}
      />
    </div>
  );
}
```

---

## Question Editor Integration

### Multiple Choice Question with AI Distractors

```tsx
// File: components/question-editor.tsx

import { useState } from "react";
import { AIDistractorButton } from "@/components/ai-distractor-button";
import { AIExplanationButton } from "@/components/ai-explanation-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";

interface Option {
  text: string;
  isCorrect: boolean;
  imageUrl?: string | null;
}

export function MultipleChoiceEditor({ question, onUpdate }: any) {
  const [options, setOptions] = useState<Option[]>(question.options || []);
  const [questionText, setQuestionText] = useState(question.questionText || "");
  const [explanation, setExplanation] = useState(question.explanation || "");

  const correctAnswer = options.find(o => o.isCorrect)?.text || "";

  const handleDistractorsGenerated = (distractors: string[]) => {
    // Add distractors as new options
    const newOptions = distractors.map(text => ({
      text,
      isCorrect: false,
      imageUrl: null,
    }));
    
    setOptions([...options, ...newOptions]);
  };

  const handleExplanationGenerated = (newExplanation: string) => {
    setExplanation(newExplanation);
    onUpdate({ explanation: newExplanation });
  };

  const addOption = () => {
    setOptions([
      ...options,
      { text: "", isCorrect: false, imageUrl: null },
    ]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, updates: Partial<Option>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    setOptions(newOptions);
  };

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Question</label>
        <Input
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question..."
        />
      </div>

      {/* Answer Options */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Answer Options</label>
          
          {/* AI Generate Distractors Button */}
          {correctAnswer && (
            <AIDistractorButton
              questionText={questionText}
              correctAnswer={correctAnswer}
              difficulty={question.difficulty}
              projectId={question.projectId}
              onDistractorsGenerated={handleDistractorsGenerated}
            />
          )}
        </div>

        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={option.text}
              onChange={(e) => updateOption(index, { text: e.target.value })}
              placeholder={`Option ${index + 1}`}
            />
            
            <Button
              type="button"
              variant={option.isCorrect ? "default" : "outline"}
              onClick={() => updateOption(index, { isCorrect: !option.isCorrect })}
            >
              {option.isCorrect ? "Correct" : "Mark Correct"}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeOption(index)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addOption}>
          <Plus className="mr-2 h-4 w-4" />
          Add Option
        </Button>
      </div>

      {/* Explanation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Explanation (Optional)</label>
          
          {/* AI Generate Explanation Button */}
          {correctAnswer && (
            <AIExplanationButton
              questionText={questionText}
              correctAnswer={correctAnswer}
              questionType="multipleChoice"
              difficulty={question.difficulty}
              projectId={question.projectId}
              onExplanationGenerated={handleExplanationGenerated}
            />
          )}
        </div>
        
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Add an explanation for why the answer is correct..."
          className="w-full min-h-[100px] p-2 border rounded"
        />
      </div>
    </div>
  );
}
```

---

## Marking Interface Integration

### Single Answer Grading with AI

```tsx
// File: app/app/[projectId]/mark/[submissionId]/page.tsx

import { useState } from "react";
import { AIGradingButton } from "@/components/ai-grading-button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SubmissionMarkingPage({ params }: any) {
  const submission = useQuery(api.submissions.getSubmission, {
    submissionId: params.submissionId,
  });
  
  const answers = useQuery(api.answers.getSubmissionAnswers, {
    submissionId: params.submissionId,
  });
  
  const questions = useQuery(api.questions.getProjectQuestions, {
    projectId: params.projectId,
  });

  const updateAnswer = useMutation(api.answers.updateAnswer);

  if (!submission || !answers || !questions) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1>Marking Submission</h1>

      {answers.map((answer) => {
        const question = questions.find(q => q._id === answer.questionId);
        if (!question) return null;

        // Only show AI grading for open-ended questions
        const isOpenEnded = ["shortAnswer", "essay", "longText"].includes(
          question.type
        );

        return (
          <div key={answer._id} className="border rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold">{question.questionText}</h3>
              <p className="text-sm text-muted-foreground">
                {question.points} points
              </p>
            </div>

            {/* Student Answer */}
            <div className="bg-muted/50 rounded p-4">
              <p className="text-sm font-medium mb-2">Student Answer:</p>
              <p>{answer.textAnswer}</p>
            </div>

            {/* Grading Controls */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm">Points Awarded</label>
                <input
                  type="number"
                  min={0}
                  max={question.points}
                  value={answer.pointsAwarded}
                  onChange={(e) => {
                    updateAnswer({
                      answerId: answer._id,
                      pointsAwarded: Number(e.target.value),
                    });
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* AI Grading Button for open-ended questions */}
              {isOpenEnded && question.modelAnswer && (
                <div className="pt-6">
                  <AIGradingButton
                    answerId={answer._id}
                    questionId={question._id}
                    questionText={question.questionText}
                    modelAnswer={question.modelAnswer}
                    studentAnswer={answer.textAnswer || ""}
                    maxPoints={question.points}
                    questionType={question.type}
                    rubric={question.rubric}
                    projectId={params.projectId}
                    onGradingComplete={(grading) => {
                      // Optionally auto-apply the AI grade
                      console.log("AI grading complete:", grading);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Feedback */}
            <div>
              <label className="text-sm font-medium">Feedback</label>
              <textarea
                value={answer.feedback || ""}
                onChange={(e) => {
                  updateAnswer({
                    answerId: answer._id,
                    feedback: e.target.value,
                  });
                }}
                placeholder="Provide feedback to the student..."
                className="w-full min-h-[100px] p-2 border rounded mt-1"
              />
            </div>

            {/* Show AI evaluation if available */}
            {answer.aiEvaluation && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-4 space-y-2">
                <p className="text-sm font-medium">AI Evaluation</p>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Score:</strong> {answer.aiEvaluation.score}
                  </p>
                  <p>
                    <strong>Confidence:</strong>{" "}
                    {Math.round(answer.aiEvaluation.confidence)}%
                  </p>
                  <p>
                    <strong>Reasoning:</strong> {answer.aiEvaluation.reasoning}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### Batch AI Grading

```tsx
// File: components/batch-ai-grading.tsx

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function BatchAIGrading({ 
  submissionId, 
  projectId, 
  openEndedAnswers 
}: any) {
  const [isGrading, setIsGrading] = useState(false);
  const batchGrade = useAction(api.ai.batchGradeAnswersAction);

  const handleBatchGrade = async () => {
    setIsGrading(true);
    
    try {
      const result = await batchGrade({
        submissionId,
        projectId,
        answers: openEndedAnswers.map((a: any) => ({
          answerId: a.answer._id,
          questionId: a.question._id,
          questionText: a.question.questionText,
          modelAnswer: a.question.modelAnswer || "",
          studentAnswer: a.answer.textAnswer || "",
          maxPoints: a.question.points,
          questionType: a.question.type,
          rubric: a.question.rubric,
        })),
      });

      toast.success(
        `Graded ${result.successCount} answers using ${result.totalCreditsUsed} credits`
      );
      
      if (result.failureCount > 0) {
        toast.warning(`${result.failureCount} answers failed to grade`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to grade answers");
    } finally {
      setIsGrading(false);
    }
  };

  if (openEndedAnswers.length === 0) {
    return null;
  }

  return (
    <Button
      onClick={handleBatchGrade}
      disabled={isGrading}
      className="gap-2"
    >
      {isGrading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Grading {openEndedAnswers.length} answers...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          AI Grade All ({openEndedAnswers.length} questions)
        </>
      )}
    </Button>
  );
}
```

---

## Dashboard Integration

### Show AI Usage Stats

```tsx
// File: app/app/page.tsx

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function Dashboard() {
  const user = useQuery(api.users.getCurrentUserQuery);
  const aiStats = useQuery(api.ai.getAIGenerationHistory, {
    userId: user?._id!,
    limit: 10,
  });

  if (!user) return <div>Loading...</div>;

  const totalCreditsUsed = aiStats?.reduce(
    (sum, gen) => sum + gen.creditsDeducted,
    0
  ) || 0;

  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Credits Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              AI Credits
            </CardTitle>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.credits}</div>
            <p className="text-xs text-muted-foreground">
              {totalCreditsUsed} used this month
            </p>
          </CardContent>
        </Card>

        {/* AI Generations Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              AI Generations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiStats?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Recent operations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent AI Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent AI Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {aiStats?.slice(0, 5).map((gen) => (
              <div
                key={gen._id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="text-sm font-medium capitalize">
                    {gen.type.replace("_", " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(gen.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {gen.creditsDeducted} credits
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {gen.tokensUsed} tokens
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Credit Check Utility

```tsx
// File: lib/utils/ai-helpers.ts

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAICredits() {
  const user = useQuery(api.users.getCurrentUserQuery);
  
  const hasEnoughCredits = (required: number) => {
    return (user?.credits || 0) >= required;
  };

  const canUseAI = (user?.credits || 0) > 0;

  return {
    credits: user?.credits || 0,
    hasEnoughCredits,
    canUseAI,
  };
}

// Usage in components:
// const { credits, hasEnoughCredits, canUseAI } = useAICredits();
// 
// if (!canUseAI) {
//   return <NeedCreditsMessage />;
// }
```

---

## Error Handling Example

```tsx
// File: components/ai-error-boundary.tsx

import { Component, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>AI Feature Error</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || "An error occurred with the AI feature."}
            Please try again or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// Usage:
// <AIErrorBoundary>
//   <AIQuestionGenerationModal ... />
// </AIErrorBoundary>
```

---

## Tips & Best Practices

1. **Always check credits** before showing AI features
2. **Show loading states** during AI operations
3. **Provide feedback** on credit usage
4. **Allow editing** of AI-generated content
5. **Implement error boundaries** for graceful failures
6. **Log operations** for analytics
7. **Test with various inputs** to ensure quality
8. **Provide fallbacks** when AI is unavailable

## Support

For more information, see:
- [AI Features Documentation](./AI_FEATURES.md)
- [Implementation Summary](./AI_IMPLEMENTATION_SUMMARY.md)