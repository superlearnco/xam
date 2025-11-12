"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Sparkles, Loader2, Check, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AIGradingButtonProps {
  answerId: Id<"answers">;
  questionId: Id<"questions">;
  questionText: string;
  modelAnswer: string;
  studentAnswer: string;
  maxPoints: number;
  questionType: string;
  rubric?: Array<{ criterion: string; points: number; description: string }>;
  projectId: Id<"projects">;
  onGradingComplete?: (grading: any) => void;
  disabled?: boolean;
}

interface GradingResult {
  pointsEarned: number;
  percentage: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  keyPointsCovered: string[];
  keyPointsMissed: string[];
  confidence: number;
}

export function AIGradingButton({
  answerId,
  questionId,
  questionText,
  modelAnswer,
  studentAnswer,
  maxPoints,
  questionType,
  rubric,
  projectId,
  onGradingComplete,
  disabled = false,
}: AIGradingButtonProps) {
  const [isGrading, setIsGrading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);

  const gradeAnswer = useAction(api.ai.gradeAnswerAction);

  const estimatedCredits = studentAnswer.length > 1000 ? 6 : studentAnswer.length > 500 ? 4 : 3;

  const handleGrade = async () => {
    if (!studentAnswer.trim()) {
      toast.error("No answer to grade");
      return;
    }

    setIsGrading(true);

    try {
      const result = await gradeAnswer({
        answerId,
        questionId,
        questionText,
        modelAnswer,
        studentAnswer,
        maxPoints,
        questionType,
        rubric,
        projectId,
      });

      setGradingResult(result.grading);
      setShowResults(true);

      toast.success(
        `AI grading complete (${result.creditsUsed} credit${result.creditsUsed !== 1 ? "s" : ""} used)`
      );

      onGradingComplete?.(result.grading);
    } catch (error: any) {
      console.error("Error grading answer:", error);
      toast.error(error.message || "Failed to grade answer");
    } finally {
      setIsGrading(false);
    }
  };

  const handleAccept = () => {
    setShowResults(false);
    toast.success("AI grading accepted");
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGrade}
              disabled={disabled || isGrading}
              className="gap-2"
            >
              {isGrading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Grading...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI Grade
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Use AI to grade this answer (~{estimatedCredits} credits)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Grading Results
            </DialogTitle>
            <DialogDescription>
              Review the AI-generated grade and feedback
            </DialogDescription>
          </DialogHeader>

          {gradingResult && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Score Overview */}
                <div className="rounded-lg border bg-muted/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-3xl font-bold">
                        {gradingResult.pointsEarned} / {maxPoints}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Percentage</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {gradingResult.percentage}%
                      </p>
                    </div>
                  </div>
                  <Progress value={gradingResult.percentage} className="h-2" />
                </div>

                {/* Confidence */}
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    AI Confidence: {Math.round(gradingResult.confidence)}%
                  </span>
                </div>

                {/* Feedback */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Overall Feedback</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {gradingResult.feedback}
                  </p>
                </div>

                {/* Strengths */}
                {gradingResult.strengths && gradingResult.strengths.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {gradingResult.strengths.map((strength, i) => (
                        <li
                          key={i}
                          className="text-sm text-green-700 dark:text-green-400 flex items-start gap-2"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-600 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {gradingResult.improvements && gradingResult.improvements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {gradingResult.improvements.map((improvement, i) => (
                        <li
                          key={i}
                          className="text-sm text-orange-700 dark:text-orange-400 flex items-start gap-2"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-600 flex-shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Points Covered */}
                {gradingResult.keyPointsCovered &&
                  gradingResult.keyPointsCovered.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Key Points Covered</h4>
                      <div className="flex flex-wrap gap-2">
                        {gradingResult.keyPointsCovered.map((point, i) => (
                          <Badge key={i} variant="secondary" className="bg-green-100 dark:bg-green-900/20">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Key Points Missed */}
                {gradingResult.keyPointsMissed &&
                  gradingResult.keyPointsMissed.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Key Points Missed</h4>
                      <div className="flex flex-wrap gap-2">
                        {gradingResult.keyPointsMissed.map((point, i) => (
                          <Badge key={i} variant="secondary" className="bg-orange-100 dark:bg-orange-900/20">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Warning */}
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> AI grading is a helpful tool but should be
                    reviewed by a teacher. You can accept this grade or modify it as needed.
                  </p>
                </div>
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setShowResults(false)}>
              Close
            </Button>
            <Button onClick={handleAccept}>
              <Check className="mr-2 h-4 w-4" />
              Accept Grade
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
