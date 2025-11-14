import { CheckCircle, AlertCircle, Circle } from "lucide-react";
import { cn } from "~/lib/utils";
import { AnimatedNumber } from "~/components/shared";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

interface QuestionNavigatorProps {
  fields: Doc<"fields">[];
  responses: Doc<"responses">[];
  currentFieldId?: Id<"fields">;
  onQuestionClick: (fieldId: Id<"fields">) => void;
  earnedMarks: number;
  totalMarks: number;
}

export function QuestionNavigator({
  fields,
  responses,
  currentFieldId,
  onQuestionClick,
  earnedMarks,
  totalMarks,
}: QuestionNavigatorProps) {
  const percentage = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0;

  const getResponseStatus = (fieldId: Id<"fields">) => {
    const response = responses.find((r) => r.fieldId === fieldId);
    if (!response) return "not-marked";
    
    if (response.marksAwarded !== undefined && response.maxMarks !== undefined) {
      return "marked";
    }
    
    return "not-marked";
  };

  const getResponseMarks = (fieldId: Id<"fields">) => {
    const response = responses.find((r) => r.fieldId === fieldId);
    if (!response || response.marksAwarded === undefined) return null;
    return {
      awarded: response.marksAwarded,
      max: response.maxMarks || 0,
    };
  };

  return (
    <div className="flex w-80 flex-col border-r bg-muted/20">
      {/* Question List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
            Questions
          </h3>
          <div className="space-y-2">
            {fields.map((field, index) => {
              const status = getResponseStatus(field._id);
              const marks = getResponseMarks(field._id);
              const isActive = currentFieldId === field._id;

              return (
                <button
                  key={field._id}
                  onClick={() => onQuestionClick(field._id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                    isActive
                      ? "border-primary bg-primary/10"
                      : "border-transparent hover:bg-muted/50"
                  )}
                >
                  {/* Status Icon */}
                  <div className="mt-0.5">
                    {status === "marked" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Question Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Question {index + 1}
                      </span>
                      {marks && (
                        <span className="text-xs font-medium">
                          {marks.awarded.toFixed(1)}/{marks.max.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm font-medium">
                      {field.question}
                    </p>
                    {field.marks && (
                      <p className="text-xs text-muted-foreground">
                        {field.marks} mark{field.marks !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Total Score */}
      <div className="border-t p-4">
        <div className="text-center">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Total Score
          </p>
          <div className="mb-1 text-3xl font-bold">
            <AnimatedNumber value={percentage} decimals={0} suffix="%" />
          </div>
          <p className="text-sm text-muted-foreground">
            {earnedMarks.toFixed(1)} / {totalMarks.toFixed(1)} marks
          </p>
        </div>
      </div>
    </div>
  );
}

