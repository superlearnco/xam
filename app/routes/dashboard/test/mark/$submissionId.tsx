"use client";

import type { Route } from "./+types/$submissionId";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ArrowLeft, Loader2, Check, ChevronLeft, ChevronRight, AlertCircle, Zap, X, Keyboard } from "lucide-react";
import { toast } from "sonner";
import type { TestField } from "~/components/test-editor/test-builder";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { Toggle } from "~/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { LatexTextRenderer } from "~/components/test-editor/latex-text-renderer";
import katex from "katex";
import "katex/dist/katex.min.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mark Submission | XAM" },
  ];
}

export default function MarkingPage() {
  const params = useParams();
  const navigate = useNavigate();
  const submissionId = params.submissionId as Id<"testSubmissions">;

  const submissionData = useQuery(
    api.tests.getSubmissionForMarking,
    submissionId ? { submissionId } : "skip"
  );
  const updateMarks = useMutation(api.tests.updateSubmissionMarks);

  const [fieldMarks, setFieldMarks] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isAdvancedMarking, setIsAdvancedMarking] = useState(false);

  // Initialize field marks when data loads
  useEffect(() => {
    if (submissionData?.test.fields && submissionData?.submission.responses) {
      // Start with existing fieldMarks if they exist, otherwise start with empty object
      const existingMarks = submissionData.submission.fieldMarks || {};
      const initialMarks: Record<string, number> = { ...existingMarks };
      const responses = submissionData.submission.responses;
      
      submissionData.test.fields.forEach((field) => {
        // Include all field types that support marks
        if (field.marks && field.marks > 0) {
          // Only auto-fill if mark is not already set (or is 0)
          const existingMark = initialMarks[field.id];
          if (existingMark === undefined || existingMark === 0 || existingMark === null) {
            let mark = 0;
            
            // Auto-mark correct answers for multiple choice, dropdown, and checkboxes
            if (field.correctAnswers && field.correctAnswers.length > 0) {
              const userResponse = responses[field.id];
              
              if (userResponse !== undefined && userResponse !== null && userResponse !== "") {
                let isCorrect = false;
                
                if (field.type === "multipleChoice" || field.type === "dropdown") {
                  // Single answer - check if response matches any correct answer
                  const responseIndex = typeof userResponse === "string" ? parseInt(userResponse, 10) : userResponse;
                  isCorrect = field.correctAnswers.includes(responseIndex);
                } else if (field.type === "checkboxes" || field.type === "imageChoice") {
                  // Multiple answers - check if all correct answers are selected
                  const selectedIndices = Array.isArray(userResponse)
                    ? userResponse.map((v) => (typeof v === "string" ? parseInt(v, 10) : v))
                    : [typeof userResponse === "string" ? parseInt(userResponse, 10) : userResponse];
                  
                  const correctSet = new Set(field.correctAnswers);
                  const selectedSet = new Set(selectedIndices);
                  
                  // All correct answers must be selected
                  const allCorrectSelected = field.correctAnswers.every((idx) => selectedSet.has(idx));
                  // No extra incorrect answers
                  const noExtraAnswers = selectedIndices.every((idx) => correctSet.has(idx));
                  
                  isCorrect = allCorrectSelected && noExtraAnswers;
                } else if (field.type === "shortInput" || field.type === "longInput") {
                  // Text input - compare with correct answers
                  if (field.options && field.options.length > 0) {
                    const responseText = String(userResponse).toLowerCase().trim();
                    isCorrect = field.correctAnswers.some((idx) => {
                      const correctOption = field.options?.[idx];
                      return correctOption && correctOption.toLowerCase().trim() === responseText;
                    });
                  }
                }
                
                if (isCorrect) {
                  mark = field.marks;
                }
              }
            }
            
            initialMarks[field.id] = mark;
          }
        }
      });
      setFieldMarks(initialMarks);
    }
  }, [submissionData]);

  const markableFields = useMemo(() => {
    if (!submissionData?.test.fields) return [];
    return submissionData.test.fields.filter((f) => f.type !== "pageBreak" && f.type !== "infoBlock");
  }, [submissionData?.test.fields]);

  // Set initial selected field
  useEffect(() => {
    if (markableFields.length > 0 && !selectedFieldId) {
      setSelectedFieldId(markableFields[0].id);
    }
  }, [markableFields, selectedFieldId]);

  const selectedField = markableFields.find(f => f.id === selectedFieldId);
  const selectedFieldIndex = markableFields.findIndex(f => f.id === selectedFieldId);

  const handleMarkChange = useCallback((fieldId: string, value: number) => {
    const field = markableFields.find((f) => f.id === fieldId);
    if (!field || !field.marks) return;

    const maxMark = field.marks;
    const validValue = Math.max(0, Math.min(value, maxMark));
    setFieldMarks((prev) => ({ ...prev, [fieldId]: validValue }));
  }, [markableFields]);

  const handleNext = useCallback(() => {
    if (selectedFieldIndex < markableFields.length - 1) {
      setSelectedFieldId(markableFields[selectedFieldIndex + 1].id);
    }
  }, [selectedFieldIndex, markableFields]);

  const handlePrevious = useCallback(() => {
    if (selectedFieldIndex > 0) {
      setSelectedFieldId(markableFields[selectedFieldIndex - 1].id);
    }
  }, [selectedFieldIndex, markableFields]);

  // Keyboard shortcuts for Advanced Marking
  useEffect(() => {
    if (!isAdvancedMarking) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input (unless it's a modifier key combo, but let's keep it simple)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          handleNext();
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          handlePrevious();
          break;
        case "c":
        case "C":
          if (selectedField && selectedField.marks) {
            handleMarkChange(selectedField.id, selectedField.marks);
          }
          break;
        case "x":
        case "X":
          if (selectedField && selectedField.marks) {
            handleMarkChange(selectedField.id, 0);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAdvancedMarking, selectedField, handleNext, handlePrevious, handleMarkChange]);

  if (!submissionData) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { submission, test } = submissionData;

  // Calculate current score and max score
  let currentScore = 0;
  let maxScore = 0;
  markableFields.forEach((field) => {
    if (field.marks && field.marks > 0) {
      maxScore += field.marks;
      const mark = fieldMarks[field.id] || 0;
      currentScore += mark;
    }
  });
  const percentage = maxScore > 0 ? Math.round((currentScore / maxScore) * 100) : 0;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMarks({
        submissionId,
        fieldMarks,
      });
      toast.success("Marks saved successfully");
      if (submissionData?.test._id) {
        navigate(`/dashboard/test/new?testId=${submissionData.test._id}&tab=marking`);
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error("Failed to save marks:", error);
      toast.error("Failed to save marks");
    } finally {
      setIsSaving(false);
    }
  };

  const renderResponse = (field: TestField) => {
    const response = submission.responses[field.id];
    if (response === undefined || response === null || response === "") {
      return <span className="text-muted-foreground italic">No response</span>;
    }

    switch (field.type) {
      case "shortInput":
      case "longInput":
        return <div className="whitespace-pre-wrap">{String(response)}</div>;
      case "multipleChoice":
      case "dropdown": {
        const selectedIndex = typeof response === "string" ? parseInt(response, 10) : response;
        const options = field.options || [];
        const correctAnswers = field.correctAnswers || [];
        return (
          <div className="space-y-2">
            {options.map((option, index) => {
              const isSelected = index === selectedIndex;
              const isCorrect = correctAnswers.includes(index);
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-muted bg-muted/30"
                  }`}
                >
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  }`}>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                  <span className={isSelected ? "font-medium text-foreground" : "text-muted-foreground"}>
                    <LatexTextRenderer text={option || `Option ${index + 1}`} />
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    {isCorrect && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white">
                              <Check className="w-4 h-4" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Correct Answer</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {isSelected && (
                      <Badge variant="default">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
      case "checkboxes": {
        const selectedIndices = Array.isArray(response)
          ? response.map((v) => (typeof v === "string" ? parseInt(v, 10) : v))
          : [typeof response === "string" ? parseInt(response, 10) : response];
        const options = field.options || [];
        const correctAnswers = field.correctAnswers || [];
        return (
          <div className="space-y-2">
            {options.map((option, index) => {
              const isSelected = selectedIndices.includes(index);
              const isCorrect = correctAnswers.includes(index);
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-muted bg-muted/30"
                  }`}
                >
                  <div className={`flex items-center justify-center w-5 h-5 rounded border-2 ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className={isSelected ? "font-medium text-foreground" : "text-muted-foreground"}>
                    <LatexTextRenderer text={option || `Option ${index + 1}`} />
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    {isCorrect && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white">
                              <Check className="w-4 h-4" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Correct Answer</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {isSelected && (
                      <Badge variant="default">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
      case "imageChoice": {
        const selectedIndices = Array.isArray(response)
          ? response.map((v) => (typeof v === "string" ? parseInt(v, 10) : v))
          : [typeof response === "string" ? parseInt(response, 10) : response];
        const options = field.options || [];
        const correctAnswers = field.correctAnswers || [];
        return (
          <div className="grid grid-cols-2 gap-4">
            {options.map((option, index) => {
              const isSelected = selectedIndices.includes(index);
              const isCorrect = correctAnswers.includes(index);
              const imageUrl = option && option.startsWith("http") ? option : undefined;
              return (
                <div
                  key={index}
                  className={`relative border-2 rounded-lg p-2 aspect-square overflow-hidden transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2"
                      : "border-muted bg-muted/30"
                  }`}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`Choice ${index + 1}`}
                      className="w-full h-full object-contain"
                      />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                      Image {index + 1}
                    </div>
                  )}
                  {isCorrect && (
                    <div className="absolute top-2 right-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Correct Answer</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                  {isSelected && !isCorrect && (
                    <div className="absolute top-2 right-2">
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="default">Selected</Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }
      default:
        return <div>{String(response)}</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              Marking: {submission.respondentName || "Anonymous"}
            </h1>
            {submission.respondentEmail && (
              <p className="text-xs text-muted-foreground">
                {submission.respondentEmail}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4 border-r pr-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={isAdvancedMarking}
                    onPressedChange={setIsAdvancedMarking}
                    aria-label="Toggle advanced marking"
                    className={cn("gap-2", isAdvancedMarking && "bg-primary/10 text-primary")}
                  >
                    <Zap className="h-4 w-4" />
                    <span className="hidden sm:inline">Advanced Marking</span>
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs bg-popover text-popover-foreground border">
                  <p className="font-semibold mb-2">Keyboard Shortcuts:</p>
                  <ul className="text-xs space-y-1">
                    <li><kbd className="bg-muted px-1 rounded">Arrow Right/Down</kbd> Next Question</li>
                    <li><kbd className="bg-muted px-1 rounded">Arrow Left/Up</kbd> Previous Question</li>
                    <li><kbd className="bg-muted px-1 rounded">C</kbd> Mark Correct (Full Marks)</li>
                    <li><kbd className="bg-muted px-1 rounded">X</kbd> Mark Incorrect (0 Marks)</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="text-right mr-4 hidden md:block">
            <div className="text-sm font-medium">
              Score: {currentScore} / {maxScore}
            </div>
            <div className="text-xs text-muted-foreground">
              {percentage}%
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Marks"
            )}
          </Button>
        </div>
      </header>

      {/* Tab Switch Warning */}
      {submission.tabSwitchCount !== undefined && submission.tabSwitchCount > 0 && (
        <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Warning: This test taker switched tabs {submission.tabSwitchCount} time{submission.tabSwitchCount !== 1 ? 's' : ''} during the assessment.
            </span>
          </div>
        </div>
      )}
      {/* Copy/Paste Warning */}
      {submission.copyPasteCount !== undefined && submission.copyPasteCount > 0 && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Warning: This test taker attempted to copy/paste {submission.copyPasteCount} time{submission.copyPasteCount !== 1 ? 's' : ''} during the assessment.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <aside className="w-80 border-r bg-muted/10 flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-muted/20">
            <h2 className="font-semibold mb-2">Questions</h2>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{markableFields.filter(f => (fieldMarks[f.id] ?? 0) > 0).length} / {markableFields.length} marked</span>
            </div>
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(markableFields.filter(f => (fieldMarks[f.id] ?? 0) > 0).length / markableFields.length) * 100}%` }}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {markableFields.map((field, index) => {
                const isSelected = field.id === selectedFieldId;
                const mark = fieldMarks[field.id] ?? 0;
                const maxMark = field.marks || 0;
                const isMarked = mark > 0;

                return (
                  <button
                    key={field.id}
                    onClick={() => setSelectedFieldId(field.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all hover:bg-accent",
                      isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-transparent bg-card",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={cn("text-sm font-medium line-clamp-2", isSelected ? "text-primary" : "text-foreground")}>
                        {index + 1}. <LatexTextRenderer text={field.label} />
                      </span>
                      {maxMark > 0 && (
                        <Badge variant={isMarked ? "default" : "secondary"} className="shrink-0 text-[10px] h-5">
                          {mark}/{maxMark}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content - Active Question */}
        <main className="flex-1 flex flex-col overflow-hidden bg-muted/5">
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            {selectedField ? (
              <div className="max-w-3xl mx-auto space-y-6">
                <Card className="border-2 shadow-sm">
                  <CardHeader className="bg-muted/30 border-b pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Badge variant="outline">Question {selectedFieldIndex + 1}</Badge>
                          <span>{selectedField.type}</span>
                        </div>
                        <CardTitle className="text-xl leading-tight">
                          <LatexTextRenderer text={selectedField.label} />
                        </CardTitle>
                        {selectedField.helpText && (
                          <CardDescription>{selectedField.helpText}</CardDescription>
                        )}
                      </div>
                      {selectedField.marks && selectedField.marks > 0 && (
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-sm font-medium text-muted-foreground">Max Score</span>
                          <Badge variant="secondary" className="text-base px-3 py-1">
                            {selectedField.marks} pts
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-8">
                    {selectedField.latexContent && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 overflow-x-auto">
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: katex.renderToString(selectedField.latexContent, { 
                              throwOnError: false,
                              displayMode: true 
                            }) 
                          }}
                        />
                      </div>
                    )}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                        Student Response
                      </Label>
                      <div className="p-5 bg-muted/50 rounded-lg border min-h-[100px]">
                        {renderResponse(selectedField)}
                      </div>
                    </div>

                    {selectedField.marks && selectedField.marks > 0 && (
                      <div className="space-y-4 pt-6 border-t">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`mark-${selectedField.id}`} className="text-base font-semibold text-foreground">
                            Awarded Marks
                          </Label>
                          <div className="flex items-center gap-2">
                            {isAdvancedMarking && (
                              <div className="flex gap-2 mr-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 h-8"
                                  onClick={() => handleMarkChange(selectedField.id, selectedField.marks || 0)}
                                  title="Mark Correct (C)"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Correct
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-8"
                                  onClick={() => handleMarkChange(selectedField.id, 0)}
                                  title="Mark Incorrect (X)"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Incorrect
                                </Button>
                              </div>
                            )}
                            <span className="text-sm text-muted-foreground">
                              Enter a value between 0 and {selectedField.marks}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
                          <Input
                            id={`mark-${selectedField.id}`}
                            type="number"
                            min="0"
                            max={selectedField.marks}
                            value={fieldMarks[selectedField.id] ?? 0}
                            onChange={(e) =>
                              handleMarkChange(selectedField.id, parseFloat(e.target.value) || 0)
                            }
                            className="max-w-[150px] text-lg font-medium h-12 text-center"
                          />
                          <div className="text-xl text-muted-foreground font-light">/</div>
                          <div className="text-xl font-medium">{selectedField.marks}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
                <p>Select a question to start marking</p>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="border-t bg-background p-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={selectedFieldIndex <= 0}
                className="w-[120px]"
                title={isAdvancedMarking ? "Previous (Arrow Left)" : undefined}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Question {selectedFieldIndex + 1} of {markableFields.length}
              </div>

              <Button
                onClick={handleNext}
                disabled={selectedFieldIndex >= markableFields.length - 1}
                className="w-[120px]"
                title={isAdvancedMarking ? "Next (Arrow Right)" : undefined}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
