"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type Stage = "pre-test" | "test" | "submitted";

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const testId = params.testId as string;

  const [stage, setStage] = useState<Stage>("pre-test");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [password, setPassword] = useState("");
  const [honorCode, setHonorCode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [submissionId, setSubmissionId] = useState<Id<"submissions"> | null>(
    null,
  );
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copyPasteCount, setCopyPasteCount] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load project by access code
  const project = useQuery(
    api.projects.getProjectByAccessCode,
    testId ? { accessCode: testId } : "skip",
  );
  const projectWithQuestions = useQuery(
    api.projects.getProjectWithQuestions,
    project ? { projectId: project._id } : "skip",
  );
  const canSubmitCheck = useQuery(
    api.submissions.canStudentSubmit,
    project && studentEmail ? { projectId: project._id, studentEmail } : "skip",
  );

  // Mutations
  const createSubmission = useMutation(api.submissions.createSubmission);
  const updateAnswer = useMutation(api.answers.updateAnswer);
  const submitTest = useMutation(api.submissions.submitTest);
  const trackViolation = useMutation(api.submissions.trackViolation);
  const autoGradeSubmission = useMutation(api.submissions.autoGradeSubmission);
  const incrementViewCount = useMutation(api.projects.incrementViewCount);

  // Track view on load
  useEffect(() => {
    if (project && stage === "pre-test") {
      incrementViewCount({ projectId: project._id });
    }
  }, [project, stage, incrementViewCount]);

  // Timer
  useEffect(() => {
    if (stage === "test" && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 0) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0) {
      handleAutoSubmit();
    }
  }, [stage, timeRemaining]);

  // Auto-save answers
  useEffect(() => {
    if (stage !== "test" || !submissionId) return;

    const timeoutId = setTimeout(() => {
      saveCurrentAnswer();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [answers, currentQuestion, submissionId, stage]);

  // Browser restrictions
  useEffect(() => {
    if (stage !== "test" || !project) return;

    const handleVisibilityChange = () => {
      if (
        document.hidden &&
        project.settings.blockTabSwitching &&
        submissionId
      ) {
        setTabSwitchCount((prev) => prev + 1);
        trackViolation({ submissionId, type: "tab_switch" });
        toast({
          title: "Warning",
          description: "Tab switching is being tracked.",
          variant: "destructive",
        });
      }
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      if (project.settings.disableCopyPaste && submissionId) {
        e.preventDefault();
        setCopyPasteCount((prev) => prev + 1);
        trackViolation({ submissionId, type: "copy_paste" });
        toast({
          title: "Action blocked",
          description: "Copy/paste is disabled for this test.",
          variant: "destructive",
        });
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (project.settings.disableCopyPaste) {
        e.preventDefault();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("contextmenu", handleContextMenu);

    // Request fullscreen
    if (project.settings.fullScreenRequired && stage === "test") {
      document.documentElement.requestFullscreen?.().catch(() => {
        toast({
          title: "Fullscreen required",
          description: "Please enable fullscreen mode to take this test.",
          variant: "destructive",
        });
      });
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [stage, project, submissionId, trackViolation, toast]);

  // Save to localStorage as backup
  useEffect(() => {
    if (stage === "test" && submissionId) {
      localStorage.setItem(
        `test_${submissionId}`,
        JSON.stringify({ answers, currentQuestion, timeRemaining }),
      );
    }
  }, [answers, currentQuestion, timeRemaining, submissionId, stage]);

  // Restore from localStorage
  useEffect(() => {
    if (stage === "test" && submissionId) {
      const saved = localStorage.getItem(`test_${submissionId}`);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setAnswers(data.answers || {});
          setCurrentQuestion(data.currentQuestion || 0);
          if (data.timeRemaining && timeRemaining === null) {
            setTimeRemaining(data.timeRemaining);
          }
        } catch (e) {
          console.error("Failed to restore from localStorage", e);
        }
      }
    }
  }, [submissionId, stage]);

  const saveCurrentAnswer = useCallback(async () => {
    if (!submissionId || !projectWithQuestions) return;

    const question = projectWithQuestions.questions[currentQuestion];
    if (!question) return;

    const answer = answers[question._id];
    if (answer === undefined) return;

    try {
      await updateAnswer({
        submissionId,
        questionId: question._id,
        textAnswer:
          question.type === "shortText" || question.type === "longText"
            ? answer
            : null,
        selectedOption: question.type === "multipleChoice" ? answer : null,
        selectedOptions:
          question.type === "multipleSelect" ? answer : undefined,
        scaleValue: question.type === "linearScale" ? answer : null,
      });
    } catch (error) {
      console.error("Failed to save answer", error);
    }
  }, [
    submissionId,
    projectWithQuestions,
    currentQuestion,
    answers,
    updateAnswer,
  ]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartTest = async () => {
    if (!project || !projectWithQuestions) return;

    // Validate inputs
    if (!studentName.trim() || !studentEmail.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your name and email.",
        variant: "destructive",
      });
      return;
    }

    if (!honorCode) {
      toast({
        title: "Honor code required",
        description: "Please accept the honor code to continue.",
        variant: "destructive",
      });
      return;
    }

    // Check password
    if (
      project.settings.passwordProtected &&
      password !== project.settings.password
    ) {
      toast({
        title: "Incorrect password",
        description: "Please enter the correct password.",
        variant: "destructive",
      });
      return;
    }

    // Check attempts
    if (canSubmitCheck && !canSubmitCheck.canSubmit) {
      toast({
        title: "Cannot start test",
        description: canSubmitCheck.reason,
        variant: "destructive",
      });
      return;
    }

    try {
      const newSubmissionId = await createSubmission({
        projectId: project._id,
        studentName,
        studentEmail,
      });

      setSubmissionId(newSubmissionId);
      setStage("test");

      // Set timer if duration is specified
      if (project.settings.duration) {
        setTimeRemaining(project.settings.duration * 60);
      }

      toast({
        title: "Test started",
        description: "Good luck!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start test. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAutoSubmit = async () => {
    if (!submissionId) return;

    toast({
      title: "Time's up!",
      description: "Your test is being submitted automatically.",
    });

    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (!submissionId || !project || !projectWithQuestions) return;

    setIsSubmitting(true);

    try {
      // Save current answer
      await saveCurrentAnswer();

      // Calculate time spent
      const timeSpent = project.settings.duration
        ? project.settings.duration * 60 - (timeRemaining || 0)
        : Date.now() - (submissionId ? 0 : Date.now());

      // Submit test
      await submitTest({
        submissionId,
        timeSpent,
      });

      // Auto-grade if enabled
      if (project.settings.autoGrade) {
        await autoGradeSubmission({ submissionId });
      }

      // Clear localStorage
      localStorage.removeItem(`test_${submissionId}`);

      setStage("submitted");

      toast({
        title: "Test submitted",
        description: "Your answers have been recorded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQuestion)) {
      newFlagged.delete(currentQuestion);
    } else {
      newFlagged.add(currentQuestion);
    }
    setFlagged(newFlagged);
  };

  const renderQuestionField = (question: any) => {
    const answer = answers[question._id];

    switch (question.type) {
      case "multipleChoice":
        return (
          <RadioGroup
            value={answer}
            onValueChange={(value) => handleAnswer(question._id, value)}
          >
            <div className="space-y-3">
              {question.options.map((option: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <RadioGroupItem
                    value={idx.toString()}
                    id={`${question._id}-${idx}`}
                  />
                  <Label
                    htmlFor={`${question._id}-${idx}`}
                    className="cursor-pointer flex-1"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "multipleSelect":
        return (
          <div className="space-y-3">
            {question.options.map((option: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors cursor-pointer"
              >
                <Checkbox
                  id={`${question._id}-${idx}`}
                  checked={answer?.includes(idx.toString())}
                  onCheckedChange={(checked) => {
                    const current = answer || [];
                    handleAnswer(
                      question._id,
                      checked
                        ? [...current, idx.toString()]
                        : current.filter((o: string) => o !== idx.toString()),
                    );
                  }}
                />
                <Label
                  htmlFor={`${question._id}-${idx}`}
                  className="cursor-pointer flex-1"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        );

      case "shortText":
        return (
          <Input
            value={answer || ""}
            onChange={(e) => handleAnswer(question._id, e.target.value)}
            placeholder="Type your answer here..."
            className="max-w-2xl"
            maxLength={question.maxLength || undefined}
          />
        );

      case "longText":
        return (
          <Textarea
            value={answer || ""}
            onChange={(e) => handleAnswer(question._id, e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-48"
            rows={8}
            maxLength={question.maxLength || undefined}
          />
        );

      case "dropdown":
        return (
          <Select
            value={answer}
            onValueChange={(value) => handleAnswer(question._id, value)}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option: any, idx: number) => (
                <SelectItem key={idx} value={idx.toString()}>
                  {option.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "linearScale":
        return (
          <div className="space-y-4">
            <Slider
              value={[
                answer ||
                  Math.floor(
                    ((question.scaleMin || 1) + (question.scaleMax || 5)) / 2,
                  ),
              ]}
              onValueChange={(value) => handleAnswer(question._id, value[0])}
              min={question.scaleMin || 1}
              max={question.scaleMax || 5}
              step={1}
              className="w-full max-w-md"
            />
            <div className="flex justify-between text-sm text-muted-foreground max-w-md">
              <span>{question.scaleMinLabel || question.scaleMin || 1}</span>
              <span className="font-semibold text-foreground">
                {answer ||
                  Math.floor(
                    ((question.scaleMin || 1) + (question.scaleMax || 5)) / 2,
                  )}
              </span>
              <span>{question.scaleMaxLabel || question.scaleMax || 5}</span>
            </div>
          </div>
        );

      case "ratingScale":
        return (
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleAnswer(question._id, rating)}
                className={`w-12 h-12 rounded-full border-2 transition-all ${
                  answer === rating
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground hover:border-primary hover:bg-primary/10"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case "sectionHeader":
        return (
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{question.questionText}</h2>
            {question.description && (
              <p className="text-muted-foreground">{question.description}</p>
            )}
          </div>
        );

      case "pageBreak":
        return (
          <div className="border-t-4 border-dashed border-muted-foreground/30 py-4">
            <p className="text-center text-sm text-muted-foreground">
              Page Break
            </p>
          </div>
        );

      case "infoBlock":
        return (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">i</span>
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  {question.description || question.questionText}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <p className="text-sm text-muted-foreground">
            Question type not supported: {question.type}
          </p>
        );
    }
  };

  // Loading state
  if (!project || !projectWithQuestions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Check if test is published
  if (project.status !== "published") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Test Not Available</h1>
          <p className="text-muted-foreground">
            This test is not currently published. Please contact your
            instructor.
          </p>
        </Card>
      </div>
    );
  }

  const questions = projectWithQuestions.questions;
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  // Pre-test screen
  if (stage === "pre-test") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-8">
            <h1 className="text-2xl font-bold mb-2 text-center">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-muted-foreground mb-6 text-center">
                {project.description}
              </p>
            )}

            <div className="space-y-4 mb-6">
              {project.settings.duration && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Duration</span>
                  <span className="text-sm">
                    {project.settings.duration} minutes
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Questions</span>
                <span className="text-sm">
                  {questions.length}{" "}
                  {questions.length === 1 ? "question" : "questions"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Total Points</span>
                <span className="text-sm">{totalPoints} marks</span>
              </div>
              {canSubmitCheck && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Attempts Used</span>
                  <span className="text-sm">
                    {canSubmitCheck.attemptsUsed} / {canSubmitCheck.maxAttempts}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="student-name">Full Name *</Label>
                <Input
                  id="student-name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-2"
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="student-email">Email *</Label>
                <Input
                  id="student-email"
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="mt-2"
                />
              </div>

              {project.settings.passwordProtected && (
                <div>
                  <Label htmlFor="password">Test Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter test password"
                    className="mt-2"
                  />
                </div>
              )}

              <div className="flex items-start gap-2">
                <Checkbox
                  id="honor-code"
                  checked={honorCode}
                  onCheckedChange={(checked) => setHonorCode(!!checked)}
                />
                <label
                  htmlFor="honor-code"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  I will complete this test honestly and independently
                </label>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleStartTest}
              disabled={
                !studentName.trim() ||
                !studentEmail.trim() ||
                !honorCode ||
                (project.settings.passwordProtected && !password) ||
                (canSubmitCheck && !canSubmitCheck.canSubmit)
              }
            >
              Start Test
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Submitted screen
  if (stage === "submitted") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </motion.div>

            <h1 className="text-3xl font-bold mb-2">
              Test Submitted Successfully!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your submission has been recorded. Thank you for completing the
              test.
            </p>

            {project.settings.instantFeedback && (
              <div className="mb-8">
                <p className="text-sm text-muted-foreground mb-4">
                  Your results will be available shortly.
                </p>
              </div>
            )}

            {!project.settings.instantFeedback && (
              <div className="mb-8">
                <p className="text-sm text-muted-foreground">
                  Your instructor will grade your submission and you'll be
                  notified when your results are available.
                </p>
              </div>
            )}

            <Button size="lg" onClick={() => router.push("/")}>
              Return to Home
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Test interface
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isNonQuestion =
    question.type === "sectionHeader" ||
    question.type === "pageBreak" ||
    question.type === "infoBlock";

  const unansweredQuestions = questions.filter(
    (q, idx) =>
      q.type !== "sectionHeader" &&
      q.type !== "pageBreak" &&
      q.type !== "infoBlock" &&
      answers[q._id] === undefined,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-semibold truncate max-w-[200px] md:max-w-none">
            {project.name}
          </h1>

          <div className="flex items-center gap-4">
            {timeRemaining !== null && (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  timeRemaining < 300
                    ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                    : timeRemaining < 600
                      ? "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                      : "bg-muted"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="font-mono font-medium">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}

            <div className="text-sm text-muted-foreground hidden sm:block">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Question Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8">
              {!isNonQuestion && (
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline">
                      Question {currentQuestion + 1}
                    </Badge>
                    <Badge variant="secondary">{question.points} marks</Badge>
                    {question.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFlag}
                    className={
                      flagged.has(currentQuestion) ? "text-orange-600" : ""
                    }
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {!isNonQuestion && (
                <h2 className="text-2xl font-semibold mb-2">
                  {question.questionText}
                </h2>
              )}

              {!isNonQuestion && question.description && (
                <p className="text-sm text-muted-foreground mb-6">
                  {question.description}
                </p>
              )}

              <div className="mt-6">{renderQuestionField(question)}</div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={() => setShowSubmitDialog(true)}
              size="lg"
              className="gap-2"
            >
              Submit Test
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <Card className="mt-8 p-6">
          <h3 className="font-semibold mb-4">Question Navigator</h3>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = answers[q._id] !== undefined;
              const isCurrent = idx === currentQuestion;
              const isFlagged = flagged.has(idx);
              const isNonQ =
                q.type === "sectionHeader" ||
                q.type === "pageBreak" ||
                q.type === "infoBlock";

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`aspect-square rounded-lg border-2 text-sm font-medium transition-all ${
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : isAnswered
                        ? "border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                        : isFlagged
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                          : isNonQ
                            ? "border-muted bg-muted/50 text-muted-foreground"
                            : "border-border hover:border-primary/50"
                  }`}
                  title={
                    isNonQ
                      ? `${q.type}`
                      : isCurrent
                        ? "Current"
                        : isAnswered
                          ? "Answered"
                          : isFlagged
                            ? "Flagged"
                            : "Not answered"
                  }
                >
                  {isNonQ ? "•" : idx + 1}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-6 mt-4 text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-primary bg-primary" />
              <span className="text-muted-foreground">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-50 dark:bg-green-950" />
              <span className="text-muted-foreground">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-orange-500 bg-orange-50 dark:bg-orange-950" />
              <span className="text-muted-foreground">Flagged</span>
            </div>
          </div>
        </Card>

        {/* Warnings */}
        {(tabSwitchCount > 0 || copyPasteCount > 0) && (
          <Card className="mt-8 p-4 border-orange-500 bg-orange-50 dark:bg-orange-950/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                  Activity Warning
                </p>
                <p className="text-orange-800 dark:text-orange-200">
                  {tabSwitchCount > 0 &&
                    `Tab switches detected: ${tabSwitchCount}`}
                  {tabSwitchCount > 0 && copyPasteCount > 0 && " • "}
                  {copyPasteCount > 0 &&
                    `Copy/paste attempts: ${copyPasteCount}`}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Test?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your test? You won't be able to
              change your answers after submission.
            </DialogDescription>
          </DialogHeader>
          {unansweredQuestions.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2">
                Unanswered Questions
              </p>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                You have {unansweredQuestions.length} unanswered{" "}
                {unansweredQuestions.length === 1 ? "question" : "questions"}.
                You can still submit, but you may want to review your answers.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
            >
              Review Answers
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
