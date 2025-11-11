"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Flag,
  Save,
  Send,
  Sparkles,
  Loader2,
} from "lucide-react";
import { AppNavbar } from "@/components/app-navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

type QuestionWithAnswer = {
  questionId: Id<"questions">;
  questionText: string;
  type: string;
  points: number;
  options: Array<{ text: string; imageUrl: string | null; isCorrect: boolean }>;
  correctAnswer?: string | null;
  answerId: Id<"answers">;
  studentAnswer: string | null;
  selectedOption: string | null;
  selectedOptions: string[];
  isCorrect: boolean | null;
  pointsAwarded: number;
  feedback: string | null;
  aiEvaluation: any;
};

export default function MarkSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as Id<"projects">;
  const submissionId = params.submissionId as Id<"submissions">;

  const [overallFeedback, setOverallFeedback] = useState("");
  const [questionGrades, setQuestionGrades] = useState<
    Record<string, { points: number; feedback: string }>
  >({});
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiGradingQuestionId, setAiGradingQuestionId] = useState<string | null>(
    null,
  );

  // Load data
  const project = useQuery(api.projects.getProject, { projectId });
  const submission = useQuery(api.submissions.getSubmission, { submissionId });
  const answers = useQuery(api.submissions.getSubmissionWithAnswers, {
    submissionId,
  });
  const questions = useQuery(api.questions.getProjectQuestions, { projectId });

  // Mutations
  const gradeAnswer = useMutation(api.answers.gradeAnswer);
  const bulkGradeAnswers = useMutation(api.answers.bulkGradeAnswers);
  const updateSubmissionGrades = useMutation(
    api.submissions.updateSubmissionGrades,
  );
  const returnSubmission = useMutation(api.submissions.returnSubmission);
  const flagSubmission = useMutation(api.submissions.flagSubmission);

  // Combine questions with answers
  const questionsWithAnswers: QuestionWithAnswer[] = useMemo(() => {
    if (!questions || !answers?.answers) return [];

    return questions
      .map((q) => {
        const answer = answers.answers.find((a) => a.questionId === q._id);
        if (!answer) return null;

        return {
          questionId: q._id,
          questionText: q.questionText,
          type: q.type,
          points: q.points || 0,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          answerId: answer._id,
          studentAnswer: answer.textAnswer,
          selectedOption: answer.selectedOption,
          selectedOptions: answer.selectedOptions || [],
          isCorrect: answer.isCorrect,
          pointsAwarded: answer.pointsAwarded || 0,
          feedback: answer.feedback,
          aiEvaluation: answer.aiEvaluation,
        };
      })
      .filter(Boolean) as QuestionWithAnswer[];
  }, [questions, answers]);

  // Initialize question grades from existing data
  useEffect(() => {
    if (
      questionsWithAnswers.length > 0 &&
      Object.keys(questionGrades).length === 0
    ) {
      const initialGrades: Record<
        string,
        { points: number; feedback: string }
      > = {};
      questionsWithAnswers.forEach((q) => {
        initialGrades[q.questionId] = {
          points: q.pointsAwarded,
          feedback: q.feedback || "",
        };
      });
      setQuestionGrades(initialGrades);
    }
  }, [questionsWithAnswers, questionGrades]);

  // Initialize overall feedback
  useEffect(() => {
    if (submission && !overallFeedback) {
      setOverallFeedback(submission.feedback || "");
    }
  }, [submission, overallFeedback]);

  // Calculate totals
  const { totalPoints, awardedPoints, percentage, letterGrade } =
    useMemo(() => {
      const total = questionsWithAnswers.reduce((sum, q) => sum + q.points, 0);
      const awarded = Object.values(questionGrades).reduce(
        (sum, g) => sum + g.points,
        0,
      );
      const pct = total > 0 ? (awarded / total) * 100 : 0;

      let grade = "F";
      if (pct >= 90) grade = "A";
      else if (pct >= 80) grade = "B";
      else if (pct >= 70) grade = "C";
      else if (pct >= 60) grade = "D";

      return {
        totalPoints: total,
        awardedPoints: awarded,
        percentage: pct,
        letterGrade: grade,
      };
    }, [questionsWithAnswers, questionGrades]);

  // Update question grade
  const updateQuestionGrade = (
    questionId: string,
    points: number,
    feedback?: string,
  ) => {
    setQuestionGrades((prev) => ({
      ...prev,
      [questionId]: {
        points,
        feedback: feedback ?? prev[questionId]?.feedback ?? "",
      },
    }));
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save all answer grades
      const grades = questionsWithAnswers.map((q) => ({
        answerId: q.answerId,
        pointsAwarded: questionGrades[q.questionId]?.points || 0,
        feedback: questionGrades[q.questionId]?.feedback || "",
        isCorrect:
          q.type === "multipleChoice" || q.type === "multipleSelect"
            ? q.isCorrect
            : undefined,
      }));

      await bulkGradeAnswers({ grades });

      // Update submission with overall feedback
      await updateSubmissionGrades({
        submissionId,
        awardedMarks: awardedPoints,
        totalMarks: totalPoints,
        feedback: overallFeedback || undefined,
      });

      toast.success("Marks saved successfully");
    } catch (error) {
      console.error("Failed to save marks:", error);
      toast.error("Failed to save marks");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle return to student
  const handleReturn = async () => {
    setShowReturnDialog(false);
    setIsSaving(true);

    try {
      // First save all grades
      const grades = questionsWithAnswers.map((q) => ({
        answerId: q.answerId,
        pointsAwarded: questionGrades[q.questionId]?.points || 0,
        feedback: questionGrades[q.questionId]?.feedback || "",
      }));

      await bulkGradeAnswers({ grades });
      await updateSubmissionGrades({
        submissionId,
        awardedMarks: awardedPoints,
        totalMarks: totalPoints,
        feedback: overallFeedback || undefined,
      });

      // Return submission
      await returnSubmission({ submissionId });

      toast.success("Submission returned to student");
      router.push(`/app/${projectId}/mark`);
    } catch (error) {
      console.error("Failed to return submission:", error);
      toast.error("Failed to return submission");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle AI grading (placeholder for now)
  const handleAIGrade = async (questionId: string) => {
    setAiGradingQuestionId(questionId);
    try {
      // TODO: Implement AI grading
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.info("AI grading not yet implemented");
    } catch (error) {
      toast.error("AI grading failed");
    } finally {
      setAiGradingQuestionId(null);
    }
  };

  // Handle flag submission
  const handleToggleFlag = async () => {
    if (!submission) return;

    try {
      await flagSubmission({
        submissionId,
        flagged: !submission.flagged,
        reason: !submission.flagged ? "Flagged by instructor" : undefined,
      });
      toast.success(submission.flagged ? "Flag removed" : "Submission flagged");
    } catch (error) {
      toast.error("Failed to update flag");
    }
  };

  if (!project || !submission || !questionsWithAnswers.length) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/app/${projectId}/mark`}>
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{project.title}</span>
                <span>/</span>
                <span className="text-foreground font-medium">
                  {submission.studentName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2 bg-transparent"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </Button>
              <Button
                onClick={() => setShowReturnDialog(true)}
                disabled={isSaving}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Return to Student
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {questionsWithAnswers.map((question, index) => (
              <Card key={question.questionId} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Question {index + 1}
                      </span>
                      <Badge variant="outline">{question.points} marks</Badge>
                      {(question.type === "multipleChoice" ||
                        question.type === "multipleSelect") &&
                        question.isCorrect !== null && (
                          <Badge
                            className={
                              question.isCorrect
                                ? "gap-1 bg-green-500/10 text-green-700 border-green-500/20"
                                : "gap-1 bg-red-500/10 text-red-700 border-red-500/20"
                            }
                          >
                            {question.isCorrect ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Correct
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                Incorrect
                              </>
                            )}
                          </Badge>
                        )}
                    </div>
                    <h3 className="text-lg font-medium mb-4">
                      {question.questionText}
                    </h3>
                  </div>
                </div>

                {/* Multiple Choice */}
                {question.type === "multipleChoice" && (
                  <div className="space-y-3 mb-4">
                    {question.options.map((option, optIndex) => {
                      const isCorrect = option.isCorrect;
                      const isSelected =
                        question.selectedOption === optIndex.toString();

                      return (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg border-2 ${
                            isCorrect
                              ? "border-green-500 bg-green-500/5"
                              : isSelected
                                ? "border-red-500 bg-red-500/5"
                                : "border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.text}</span>
                            {isCorrect && (
                              <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                                Correct
                              </Badge>
                            )}
                            {isSelected && !isCorrect && (
                              <Badge className="bg-red-500/10 text-red-700 border-red-500/20">
                                Student's Answer
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Multiple Select */}
                {question.type === "multipleSelect" && (
                  <div className="space-y-3 mb-4">
                    {question.options.map((option, optIndex) => {
                      const isCorrect = option.isCorrect;
                      const isSelected = question.selectedOptions.includes(
                        optIndex.toString(),
                      );

                      return (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg border-2 ${
                            isCorrect && isSelected
                              ? "border-green-500 bg-green-500/5"
                              : isCorrect && !isSelected
                                ? "border-orange-500 bg-orange-500/5"
                                : isSelected
                                  ? "border-red-500 bg-red-500/5"
                                  : "border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.text}</span>
                            <div className="flex items-center gap-2">
                              {isCorrect && (
                                <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                                  Correct
                                </Badge>
                              )}
                              {isSelected && (
                                <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                                  Selected
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Text Answers */}
                {(question.type === "shortText" ||
                  question.type === "longText" ||
                  question.type === "paragraph") && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">
                      Student's Answer:
                    </Label>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">
                        {question.studentAnswer || (
                          <span className="text-muted-foreground italic">
                            No answer provided
                          </span>
                        )}
                      </p>
                    </div>
                    {question.type === "shortText" &&
                      question.correctAnswer && (
                        <div className="mt-2 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                          <Label className="text-sm font-medium mb-1 block text-green-700">
                            Expected Answer:
                          </Label>
                          <p className="text-sm text-green-700">
                            {question.correctAnswer}
                          </p>
                        </div>
                      )}
                    {(question.type === "longText" ||
                      question.type === "paragraph") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 gap-2"
                        onClick={() => handleAIGrade(question.questionId)}
                        disabled={aiGradingQuestionId === question.questionId}
                      >
                        {aiGradingQuestionId === question.questionId ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            AI Grading...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            AI Grade
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {/* AI Evaluation Display */}
                {question.aiEvaluation && (
                  <div className="mb-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <Label className="text-sm font-medium mb-2 block text-blue-700">
                      AI Evaluation:
                    </Label>
                    <p className="text-sm mb-2">
                      Score: {question.aiEvaluation.score}/{question.points}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {question.aiEvaluation.reasoning}
                    </p>
                  </div>
                )}

                {/* Marks Input */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <Label className="text-sm font-medium">Marks:</Label>
                    <Input
                      type="number"
                      min="0"
                      max={question.points}
                      step="0.5"
                      value={questionGrades[question.questionId]?.points ?? 0}
                      onChange={(e) =>
                        updateQuestionGrade(
                          question.questionId,
                          Math.min(
                            question.points,
                            Math.max(0, parseFloat(e.target.value) || 0),
                          ),
                        )
                      }
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      / {question.points}
                    </span>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Feedback (optional):
                    </Label>
                    <Textarea
                      placeholder="Add specific feedback for this question..."
                      value={
                        questionGrades[question.questionId]?.feedback || ""
                      }
                      onChange={(e) =>
                        updateQuestionGrade(
                          question.questionId,
                          questionGrades[question.questionId]?.points || 0,
                          e.target.value,
                        )
                      }
                      className="min-h-20"
                    />
                  </div>
                </div>
              </Card>
            ))}

            {/* Overall Feedback */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Overall Feedback</h3>
              <Textarea
                placeholder="Add overall feedback for the student..."
                value={overallFeedback}
                onChange={(e) => setOverallFeedback(e.target.value)}
                className="min-h-32"
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Info */}
            <Card className="p-6">
              <h3 className="text-sm font-medium mb-4">Student Information</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>
                    {submission.studentName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{submission.studentName}</div>
                  <div className="text-sm text-muted-foreground">
                    {submission.studentEmail}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span>
                    {submission.submittedAt
                      ? new Date(submission.submittedAt).toLocaleString()
                      : "In progress"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Taken:</span>
                  <span>
                    {submission.timeSpent
                      ? `${Math.floor(submission.timeSpent / 60000)}m ${Math.floor((submission.timeSpent % 60000) / 1000)}s`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Attempt:</span>
                  <span>#{submission.attemptNumber}</span>
                </div>
                {(submission.tabSwitches > 0 ||
                  submission.copyPasteAttempts > 0) && (
                  <div className="pt-2 space-y-1">
                    {submission.tabSwitches > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Tab switches:</span>
                        <span>{submission.tabSwitches}</span>
                      </div>
                    )}
                    {submission.copyPasteAttempts > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Copy/paste attempts:</span>
                        <span>{submission.copyPasteAttempts}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant={submission.flagged ? "default" : "outline"}
                size="sm"
                className="w-full mt-4 gap-2"
                onClick={handleToggleFlag}
              >
                <Flag className="w-4 h-4" />
                {submission.flagged ? "Remove Flag" : "Flag Submission"}
              </Button>
              {submission.flagged && submission.flagReason && (
                <p className="text-xs text-orange-600 mt-2">
                  {submission.flagReason}
                </p>
              )}
            </Card>

            {/* Grade Summary */}
            <Card className="p-6">
              <h3 className="text-sm font-medium mb-4">Grade Summary</h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold">
                  {awardedPoints.toFixed(1)}/{totalPoints}
                </div>
                <div className="text-2xl font-medium text-muted-foreground mt-1">
                  {percentage.toFixed(1)}%
                </div>
                <Badge className="mt-2" variant="outline">
                  Grade: {letterGrade}
                </Badge>
              </div>
              <div className="space-y-2 text-sm border-t border-border pt-4">
                {questionsWithAnswers.map((q, i) => (
                  <div key={q.questionId} className="flex justify-between">
                    <span className="text-muted-foreground">Q{i + 1}:</span>
                    <span>
                      {questionGrades[q.questionId]?.points?.toFixed(1) || 0}/
                      {q.points}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Return Dialog */}
      <AlertDialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Return submission to student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will save all marks and feedback, update the submission
              status to "returned", and notify the student via email (if
              configured). The student will be able to view their results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReturn}>
              Return to Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
