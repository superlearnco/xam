"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Sparkles, Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AIQuestionGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: Id<"projects">;
  onQuestionsGenerated?: (questions: any[]) => void;
}

interface GeneratedQuestion {
  type: string;
  questionText: string;
  options?: Array<{ text: string; isCorrect: boolean; imageUrl?: null }>;
  explanation?: string;
  modelAnswer?: string;
  points: number;
}

const QUESTION_TYPES = [
  { value: "multipleChoice", label: "Multiple Choice" },
  { value: "trueFalse", label: "True/False" },
  { value: "shortAnswer", label: "Short Answer" },
  { value: "essay", label: "Essay" },
];

export function AIQuestionGenerationModal({
  open,
  onOpenChange,
  projectId,
  onQuestionsGenerated,
}: AIQuestionGenerationModalProps) {
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [count, setCount] = useState(5);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["multipleChoice"]);
  const [additionalContext, setAdditionalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [step, setStep] = useState<"input" | "review">("input");
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());

  const generateQuestions = useAction(api.ai.generateQuestionsAction);

  const estimatedCredits = count * 2;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    if (selectedTypes.length === 0) {
      toast.error("Please select at least one question type");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateQuestions({
        topic,
        subject: subject || undefined,
        difficulty,
        questionTypes: selectedTypes,
        count,
        additionalContext: additionalContext || undefined,
        projectId,
      });

      setGeneratedQuestions(result.questions);
      setSelectedQuestions(new Set(result.questions.map((_, i) => i)));
      setStep("review");

      toast.success(
        `Generated ${result.questions.length} questions (${result.creditsUsed} credits used)`
      );
    } catch (error: any) {
      console.error("Error generating questions:", error);
      toast.error(error.message || "Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertQuestions = () => {
    const questionsToInsert = generatedQuestions.filter((_, i) =>
      selectedQuestions.has(i)
    );

    if (questionsToInsert.length === 0) {
      toast.error("Please select at least one question to insert");
      return;
    }

    onQuestionsGenerated?.(questionsToInsert);
    handleClose();
    toast.success(`Inserted ${questionsToInsert.length} questions`);
  };

  const handleClose = () => {
    setTopic("");
    setSubject("");
    setDifficulty("medium");
    setCount(5);
    setSelectedTypes(["multipleChoice"]);
    setAdditionalContext("");
    setGeneratedQuestions([]);
    setStep("input");
    setSelectedQuestions(new Set());
    onOpenChange(false);
  };

  const toggleQuestionSelection = (index: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
  };

  const toggleQuestionType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Generate Questions with AI
          </DialogTitle>
          <DialogDescription>
            {step === "input"
              ? "Use AI to generate high-quality questions for your project"
              : "Review and select questions to insert"}
          </DialogDescription>
        </DialogHeader>

        {step === "input" ? (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Topic */}
              <div className="space-y-2">
                <Label htmlFor="topic">
                  Topic <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g., Photosynthesis, World War II, Quadratic Equations"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Biology, History, Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Questions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="count">Number of Questions</Label>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <Slider
                  id="count"
                  min={1}
                  max={20}
                  step={1}
                  value={[count]}
                  onValueChange={(v) => setCount(v[0])}
                />
              </div>

              {/* Question Types */}
              <div className="space-y-2">
                <Label>Question Types</Label>
                <div className="grid grid-cols-2 gap-3">
                  {QUESTION_TYPES.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.value}
                        checked={selectedTypes.includes(type.value)}
                        onCheckedChange={() => toggleQuestionType(type.value)}
                      />
                      <label
                        htmlFor={type.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Context */}
              <div className="space-y-2">
                <Label htmlFor="context">Additional Context (Optional)</Label>
                <Textarea
                  id="context"
                  placeholder="Add any specific requirements, learning objectives, or context for the questions..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Credit Estimate */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estimated Cost</span>
                  <span className="text-lg font-bold text-purple-600">
                    ~{estimatedCredits} credits
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Actual cost may vary based on complexity
                </p>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedQuestions.size} of {generatedQuestions.length} questions selected
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedQuestions(
                        new Set(generatedQuestions.map((_, i) => i))
                      )
                    }
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedQuestions(new Set())}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              <Separator />

              {generatedQuestions.map((question, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-4 transition-colors ${
                    selectedQuestions.has(index)
                      ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20"
                      : "hover:border-muted-foreground/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedQuestions.has(index)}
                      onCheckedChange={() => toggleQuestionSelection(index)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-muted">
                          {question.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {question.points} {question.points === 1 ? "point" : "points"}
                        </span>
                      </div>
                      <p className="font-medium">{question.questionText}</p>

                      {question.options && question.options.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`flex items-center gap-2 text-sm p-2 rounded ${
                                option.isCorrect
                                  ? "bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-100"
                                  : "bg-muted/50"
                              }`}
                            >
                              {option.isCorrect ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span>{option.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {question.modelAnswer && (
                        <div className="text-sm mt-2">
                          <span className="font-medium text-muted-foreground">
                            Model Answer:{" "}
                          </span>
                          <span>{question.modelAnswer}</span>
                        </div>
                      )}

                      {question.explanation && (
                        <div className="text-sm text-muted-foreground mt-2 italic">
                          {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-between pt-4 border-t">
          {step === "input" ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Questions
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("input");
                  setGeneratedQuestions([]);
                }}
              >
                Back
              </Button>
              <Button onClick={handleInsertQuestions}>
                Insert {selectedQuestions.size} Question
                {selectedQuestions.size !== 1 ? "s" : ""}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
