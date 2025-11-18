"use client";

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import type { TestField } from "~/components/test-editor/test-builder";

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

  // Initialize field marks when data loads
  useEffect(() => {
    if (submissionData?.submission.fieldMarks) {
      setFieldMarks(submissionData.submission.fieldMarks);
    } else if (submissionData?.test.fields) {
      // Initialize with zeros for all fields that can have marks (including imageChoice)
      const initialMarks: Record<string, number> = {};
      submissionData.test.fields.forEach((field) => {
        // Include all field types that support marks: shortInput, longInput, multipleChoice, 
        // checkboxes, dropdown, and imageChoice
        if (field.marks && field.marks > 0) {
          initialMarks[field.id] = 0;
        }
      });
      setFieldMarks(initialMarks);
    }
  }, [submissionData]);

  if (!submissionData) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { submission, test } = submissionData;
  const fields = test.fields || [];

  // Calculate current score and max score
  let currentScore = 0;
  let maxScore = 0;
  fields.forEach((field) => {
    // Include all field types that can have marks (including imageChoice)
    if (field.marks && field.marks > 0) {
      maxScore += field.marks;
      const mark = fieldMarks[field.id] || 0;
      currentScore += mark;
    }
  });
  const percentage = maxScore > 0 ? Math.round((currentScore / maxScore) * 100) : 0;

  const handleMarkChange = (fieldId: string, value: number) => {
    const field = fields.find((f) => f.id === fieldId);
    // Allow marks for all field types including imageChoice
    if (!field || !field.marks) return;

    const maxMark = field.marks;
    const validValue = Math.max(0, Math.min(value, maxMark));
    setFieldMarks((prev) => ({ ...prev, [fieldId]: validValue }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMarks({
        submissionId,
        fieldMarks,
      });
      toast.success("Marks saved successfully");
      navigate(-1);
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
        return (
          <div className="space-y-2">
            {options.map((option, index) => {
              const isSelected = index === selectedIndex;
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
                    {option || `Option ${index + 1}`}
                  </span>
                  {isSelected && (
                    <Badge variant="default" className="ml-auto">
                      Selected
                    </Badge>
                  )}
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
        return (
          <div className="space-y-2">
            {options.map((option, index) => {
              const isSelected = selectedIndices.includes(index);
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
                    {option || `Option ${index + 1}`}
                  </span>
                  {isSelected && (
                    <Badge variant="default" className="ml-auto">
                      Selected
                    </Badge>
                  )}
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
        return (
          <div className="grid grid-cols-2 gap-4">
            {options.map((option, index) => {
              const isSelected = selectedIndices.includes(index);
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
                  {isSelected && (
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
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">
                Marking: {submission.respondentName || "Anonymous"}
              </h1>
              {submission.respondentEmail && (
                <p className="text-sm text-muted-foreground mt-1">
                  {submission.respondentEmail}
                </p>
              )}
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} size="lg">
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
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left side - Fields with enhanced focus */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-4xl mx-auto p-8 space-y-8">
            {fields
              .filter((f) => f.type !== "pageBreak" && f.type !== "infoBlock")
              .map((field) => {
                const maxMark = field.marks || 0;
                const currentMark = fieldMarks[field.id] || 0;

                return (
                  <Card 
                    key={field.id}
                    className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-card"
                  >
                    <CardHeader className="bg-muted/50 border-b">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold">{field.label}</CardTitle>
                          {field.helpText && (
                            <CardDescription className="mt-2 text-sm">
                              {field.helpText}
                            </CardDescription>
                          )}
                        </div>
                        {maxMark > 0 && (
                          <Badge variant="secondary" className="ml-4 text-sm font-semibold px-3 py-1">
                            Max: {maxMark}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-foreground">
                          Student Response:
                        </Label>
                        <div className="p-5 bg-muted/80 rounded-lg border-2 border-muted-foreground/20 min-h-[80px]">
                          {renderResponse(field)}
                        </div>
                      </div>
                      {maxMark > 0 && (
                        <div className="space-y-3 pt-4 border-t">
                          <Label htmlFor={`mark-${field.id}`} className="text-base font-semibold text-foreground">
                            Marks:
                          </Label>
                          <div className="flex items-center gap-4">
                            <Input
                              id={`mark-${field.id}`}
                              type="number"
                              min="0"
                              max={maxMark}
                              value={currentMark}
                              onChange={(e) =>
                                handleMarkChange(field.id, parseFloat(e.target.value) || 0)
                              }
                              className="max-w-[200px] text-lg font-medium h-12"
                            />
                            <span className="text-sm text-muted-foreground">
                              / {maxMark} points
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* Right side - Grade Visualizer (sticky) */}
        <div className="w-96 border-l bg-muted/30 p-6 flex flex-col">
          <div className="sticky top-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Grade Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-4xl font-bold">{percentage}%</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {currentScore} / {maxScore} points
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Score</span>
                    <span className="font-medium">{currentScore}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Max Score</span>
                    <span className="font-medium">{maxScore}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-medium">
                    <span>Percentage</span>
                    <span>{percentage}%</span>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="h-4 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

