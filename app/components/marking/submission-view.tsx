import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { MarkingPanel } from "./marking-panel";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

interface SubmissionViewProps {
  fields: Doc<"fields">[];
  responses: Doc<"responses">[];
  currentFieldId?: Id<"fields">;
  onFieldChange: (fieldId: Id<"fields">) => void;
  onMarkSaved?: () => void;
}

export function SubmissionView({
  fields,
  responses,
  currentFieldId,
  onFieldChange,
  onMarkSaved,
}: SubmissionViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Update current index when currentFieldId changes
  useEffect(() => {
    if (currentFieldId) {
      const index = fields.findIndex((f) => f._id === currentFieldId);
      if (index !== -1) {
        setCurrentIndex(index);
        // Scroll to the question
        const ref = questionRefs.current[currentFieldId];
        if (ref) {
          ref.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  }, [currentFieldId, fields]);

  const currentField = fields[currentIndex];
  const currentResponse = responses.find((r) => r.fieldId === currentField?._id);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onFieldChange(fields[newIndex]._id);
    }
  };

  const goToNext = () => {
    if (currentIndex < fields.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onFieldChange(fields[newIndex]._id);
    }
  };

  const getResponseDisplay = (field: Doc<"fields">) => {
    const response = responses.find((r) => r.fieldId === field._id);
    if (!response || response.value === null || response.value === undefined) {
      return <p className="italic text-muted-foreground">No answer provided</p>;
    }

    // Handle different field types
    if (field.type === "multiple_choice" || field.type === "dropdown") {
      return <p className="font-medium">{String(response.value)}</p>;
    }

    if (field.type === "checkbox") {
      const values = Array.isArray(response.value)
        ? response.value
        : [response.value];
      return (
        <ul className="list-inside list-disc space-y-1">
          {values.map((val, idx) => (
            <li key={idx} className="font-medium">
              {String(val)}
            </li>
          ))}
        </ul>
      );
    }

    if (field.type === "long_text") {
      return (
        <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-4">
          {String(response.value)}
        </div>
      );
    }

    if (field.type === "file_upload" && response.fileUrl) {
      return (
        <a
          href={response.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          View uploaded file
        </a>
      );
    }

    if (field.type === "rating") {
      return (
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{String(response.value)}</span>
          <span className="text-muted-foreground">
            / {field.ratingScale || 5}
          </span>
        </div>
      );
    }

    return <p className="font-medium">{String(response.value)}</p>;
  };

  const getCorrectAnswerDisplay = (field: Doc<"fields">) => {
    if (!field.correctAnswer) return null;

    if (Array.isArray(field.correctAnswer)) {
      return (
        <ul className="list-inside list-disc space-y-1">
          {field.correctAnswer.map((val, idx) => (
            <li key={idx} className="text-green-700 dark:text-green-400">
              {val}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p className="font-medium text-green-700 dark:text-green-400">
        {field.correctAnswer}
      </p>
    );
  };

  if (!currentField || !currentResponse) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No field selected</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Current Question Card */}
          <div
            ref={(el) => {
              if (currentField) {
                questionRefs.current[currentField._id] = el;
              }
            }}
          >
            <Card>
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Question {currentIndex + 1} of {fields.length}
                      </Badge>
                      {currentField.marks && (
                        <Badge variant="secondary">
                          {currentField.marks} mark
                          {currentField.marks !== 1 ? "s" : ""}
                        </Badge>
                      )}
                      {currentField.required && (
                        <Badge variant="destructive">Required</Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold">
                      {currentField.question}
                    </h3>
                    {currentField.description && (
                      <p className="text-sm text-muted-foreground">
                        {currentField.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Student Answer */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Student Answer
                  </h4>
                  <div className="rounded-lg border bg-muted/20 p-4">
                    {getResponseDisplay(currentField)}
                  </div>
                </div>

                {/* Correct Answer (if applicable) */}
                {currentField.correctAnswer && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Correct Answer
                    </h4>
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                      {getCorrectAnswerDisplay(currentField)}
                    </div>
                  </div>
                )}

                {/* Marking Panel */}
                <MarkingPanel
                  response={currentResponse}
                  field={currentField}
                  onMarkSaved={onMarkSaved}
                />
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t pt-6">
            <Button
              variant="outline"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous Question
            </Button>

            <span className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {fields.length}
            </span>

            <Button
              variant="outline"
              onClick={goToNext}
              disabled={currentIndex === fields.length - 1}
            >
              Next Question
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

