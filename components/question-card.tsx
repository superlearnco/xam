"use client";

import { useState } from "react";
import {
  GripVertical,
  Trash2,
  Copy,
  Sparkles,
  Plus,
  X,
  Check,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

interface QuestionCardProps {
  question: {
    _id: Id<"questions">;
    projectId: Id<"projects">;
    order: number;
    type: string;
    questionText: string;
    description: string | null;
    imageUrl: string | null;
    videoUrl: string | null;
    points: number;
    required: boolean;
    options: Array<{
      text: string;
      imageUrl: string | null;
      isCorrect: boolean;
    }>;
    correctAnswers: string[];
    correctAnswer: string | null;
    modelAnswer: string | null;
    rubric: Array<{
      criterion: string;
      points: number;
      description: string;
    }>;
    explanation: string | null;
    randomizeOptions: boolean;
    allowOther: boolean;
    minLength: number | null;
    maxLength: number | null;
    fileTypes: string[];
    maxFileSize: number | null;
    scaleMin: number | null;
    scaleMax: number | null;
    scaleMinLabel: string | null;
    scaleMaxLabel: string | null;
    matrixRows: string[];
    matrixColumns: string[];
    createdAt: number;
    updatedAt: number;
    generatedByAI: boolean;
    aiGenerationId: Id<"aiGenerations"> | null;
    fromQuestionBank: boolean;
    tags: string[];
    difficulty: "easy" | "medium" | "hard" | null;
  };
  index: number;
  onUpdate: (questionId: Id<"questions">, updates: any) => void;
  onDelete: (questionId: Id<"questions">) => void;
  onDuplicate: (questionId: Id<"questions">) => void;
  onSelect: () => void;
  isSelected: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

export function QuestionCard({
  question,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onSelect,
  isSelected,
  dragHandleProps,
}: QuestionCardProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const addOption = useMutation(api.questions.addOption);
  const updateOption = useMutation(api.questions.updateOption);
  const removeOption = useMutation(api.questions.removeOption);

  const handleGenerateOptions = async () => {
    setIsGenerating(true);
    try {
      // TODO: Implement AI generation
      toast({
        title: "AI Generation",
        description: "AI option generation will be implemented soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate options. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateExplanation = async () => {
    setIsGenerating(true);
    try {
      // TODO: Implement AI generation
      toast({
        title: "AI Generation",
        description: "AI explanation generation will be implemented soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate explanation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddOption = async () => {
    try {
      await addOption({
        questionId: question._id,
        text: `Option ${question.options.length + 1}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add option. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOption = async (optionIndex: number, text: string) => {
    try {
      await updateOption({
        questionId: question._id,
        optionIndex,
        text,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update option. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveOption = async (optionIndex: number) => {
    if (question.options.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "You must have at least 2 options.",
        variant: "destructive",
      });
      return;
    }

    try {
      await removeOption({
        questionId: question._id,
        optionIndex,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove option. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetCorrectAnswer = async (optionIndex: number) => {
    try {
      await updateOption({
        questionId: question._id,
        optionIndex,
        isCorrect: !question.options[optionIndex].isCorrect,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update correct answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      multipleChoice: "Multiple Choice",
      multipleSelect: "Multiple Select",
      shortText: "Short Text",
      longText: "Long Text",
      richText: "Rich Text",
      dropdown: "Dropdown",
      imageChoice: "Image Choice",
      fileUpload: "File Upload",
      ratingScale: "Rating Scale",
      linearScale: "Linear Scale",
      matrix: "Matrix",
      sectionHeader: "Section Header",
      pageBreak: "Page Break",
      infoBlock: "Info Block",
    };
    return labels[type] || type;
  };

  const renderQuestionFields = () => {
    switch (question.type) {
      case "multipleChoice":
      case "multipleSelect":
      case "dropdown":
      case "imageChoice":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Answer Options</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateOptions}
                  disabled={isGenerating || !question.questionText}
                  className="gap-2 bg-transparent"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGenerating ? "Generating..." : "Generate Options"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <button
                    onClick={() => handleSetCorrectAnswer(optionIndex)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                      option.isCorrect
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                    title={
                      option.isCorrect ? "Correct answer" : "Mark as correct"
                    }
                  >
                    {option.isCorrect && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </button>
                  <Input
                    value={option.text}
                    onChange={(e) =>
                      handleUpdateOption(optionIndex, e.target.value)
                    }
                    placeholder={`Option ${optionIndex + 1}`}
                    className="flex-1"
                  />
                  {question.options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(optionIndex)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="gap-2 bg-transparent"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </Button>
          </div>
        );

      case "shortText":
      case "longText":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Min Length</Label>
                <Input
                  type="number"
                  value={question.minLength || ""}
                  onChange={(e) =>
                    onUpdate(question._id, {
                      minLength: e.target.value
                        ? Number.parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="None"
                  min={0}
                />
              </div>
              <div>
                <Label className="text-sm">Max Length</Label>
                <Input
                  type="number"
                  value={question.maxLength || ""}
                  onChange={(e) =>
                    onUpdate(question._id, {
                      maxLength: e.target.value
                        ? Number.parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="None"
                  min={0}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Model Answer (optional)</Label>
              <Textarea
                value={question.modelAnswer || ""}
                onChange={(e) =>
                  onUpdate(question._id, {
                    modelAnswer: e.target.value || null,
                  })
                }
                placeholder="Enter a model answer for reference..."
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
        );

      case "linearScale":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Minimum</Label>
                <Input
                  type="number"
                  value={question.scaleMin || 1}
                  onChange={(e) =>
                    onUpdate(question._id, {
                      scaleMin: Number.parseInt(e.target.value) || 1,
                    })
                  }
                  min={0}
                />
              </div>
              <div>
                <Label className="text-sm">Maximum</Label>
                <Input
                  type="number"
                  value={question.scaleMax || 5}
                  onChange={(e) =>
                    onUpdate(question._id, {
                      scaleMax: Number.parseInt(e.target.value) || 5,
                    })
                  }
                  min={1}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Min Label (optional)</Label>
                <Input
                  value={question.scaleMinLabel || ""}
                  onChange={(e) =>
                    onUpdate(question._id, {
                      scaleMinLabel: e.target.value || null,
                    })
                  }
                  placeholder="e.g., Poor"
                />
              </div>
              <div>
                <Label className="text-sm">Max Label (optional)</Label>
                <Input
                  value={question.scaleMaxLabel || ""}
                  onChange={(e) =>
                    onUpdate(question._id, {
                      scaleMaxLabel: e.target.value || null,
                    })
                  }
                  placeholder="e.g., Excellent"
                />
              </div>
            </div>
          </div>
        );

      case "fileUpload":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm">
                Allowed File Types (comma-separated)
              </Label>
              <Input
                value={question.fileTypes.join(", ")}
                onChange={(e) =>
                  onUpdate(question._id, {
                    fileTypes: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="e.g., pdf, docx, jpg"
              />
            </div>
            <div>
              <Label className="text-sm">Max File Size (MB)</Label>
              <Input
                type="number"
                value={question.maxFileSize || ""}
                onChange={(e) =>
                  onUpdate(question._id, {
                    maxFileSize: e.target.value
                      ? Number.parseInt(e.target.value)
                      : null,
                  })
                }
                placeholder="e.g., 10"
                min={1}
              />
            </div>
          </div>
        );

      case "sectionHeader":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Description (optional)</Label>
              <Textarea
                value={question.description || ""}
                onChange={(e) =>
                  onUpdate(question._id, {
                    description: e.target.value || null,
                  })
                }
                placeholder="Add section description..."
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
        );

      case "infoBlock":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Content</Label>
              <Textarea
                value={question.description || ""}
                onChange={(e) =>
                  onUpdate(question._id, {
                    description: e.target.value || null,
                  })
                }
                placeholder="Enter information to display..."
                className="resize-none"
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      className={`p-6 hover:shadow-md transition-all cursor-pointer ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-4">
        <button
          {...dragHandleProps}
          className="mt-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline">Question {index + 1}</Badge>
              <Badge className="bg-blue-100 text-blue-700">
                {getQuestionTypeLabel(question.type)}
              </Badge>
              {question.generatedByAI && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Generated
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={question.points}
                onChange={(e) =>
                  onUpdate(question._id, {
                    points: Number.parseInt(e.target.value) || 0,
                  })
                }
                className="w-20 text-right"
                placeholder="0"
                min={0}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm text-muted-foreground">marks</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(question._id);
                }}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>

          {/* Question Text */}
          {question.type !== "pageBreak" && (
            <div>
              <Textarea
                value={question.questionText}
                onChange={(e) =>
                  onUpdate(question._id, {
                    questionText: e.target.value,
                  })
                }
                placeholder={
                  question.type === "sectionHeader"
                    ? "Enter section title..."
                    : "Enter your question..."
                }
                className="min-h-[80px] resize-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Type-specific fields */}
          {renderQuestionFields()}

          {/* Explanation field for gradable questions */}
          {(question.type === "multipleChoice" ||
            question.type === "multipleSelect" ||
            question.type === "shortText" ||
            question.type === "longText") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowExplanation(!showExplanation);
                  }}
                  className="gap-2 p-0 h-auto"
                >
                  <Info className="w-4 h-4" />
                  {showExplanation ? "Hide" : "Add"} Explanation
                </Button>
                {!question.explanation && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateExplanation();
                    }}
                    disabled={isGenerating || !question.questionText}
                    className="gap-2 bg-transparent"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                  </Button>
                )}
              </div>
              {(showExplanation || question.explanation) && (
                <Textarea
                  value={question.explanation || ""}
                  onChange={(e) =>
                    onUpdate(question._id, {
                      explanation: e.target.value || null,
                    })
                  }
                  placeholder="Add an explanation for the correct answer..."
                  className="resize-none"
                  rows={3}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          )}

          {/* Quick Settings */}
          {question.type !== "sectionHeader" &&
            question.type !== "pageBreak" &&
            question.type !== "infoBlock" && (
              <div className="flex items-center gap-6 pt-2 border-t border-border flex-wrap">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`required-${question._id}`}
                    checked={question.required}
                    onCheckedChange={(checked) =>
                      onUpdate(question._id, { required: checked })
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Label
                    htmlFor={`required-${question._id}`}
                    className="text-sm cursor-pointer"
                  >
                    Required
                  </Label>
                </div>
                {(question.type === "multipleChoice" ||
                  question.type === "multipleSelect") && (
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`randomize-${question._id}`}
                      checked={question.randomizeOptions}
                      onCheckedChange={(checked) =>
                        onUpdate(question._id, { randomizeOptions: checked })
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Label
                      htmlFor={`randomize-${question._id}`}
                      className="text-sm cursor-pointer"
                    >
                      Randomize Options
                    </Label>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(question._id);
                  }}
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </Button>
              </div>
            )}
        </div>
      </div>
    </Card>
  );
}
