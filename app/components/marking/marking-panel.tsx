import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { toast } from "sonner";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

interface MarkingPanelProps {
  response: Doc<"responses">;
  field: Doc<"fields">;
  onMarkSaved?: () => void;
}

export function MarkingPanel({
  response,
  field,
  onMarkSaved,
}: MarkingPanelProps) {
  const markResponse = useMutation(api.responses.mark);
  const recalculateMarks = useMutation(api.submissions.recalculateMarks);
  const gradeResponseAction = useMutation(api.ai.actions.gradeResponse);
  const credits = useQuery(api.credits.getCredits);

  const maxMarks = field.marks || 1;
  
  const [marks, setMarks] = useState<string>(
    response.marksAwarded !== undefined
      ? response.marksAwarded.toString()
      : ""
  );
  const [feedback, setFeedback] = useState(response.feedback || "");
  const [status, setStatus] = useState<"correct" | "partial" | "incorrect">(
    response.isCorrect === true
      ? "correct"
      : response.isCorrect === false
      ? "incorrect"
      : "partial"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    marks: number;
    feedback: string;
    reasoning: string;
    cost: number;
  } | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Update local state when response changes
  useEffect(() => {
    if (response.marksAwarded !== undefined) {
      setMarks(response.marksAwarded.toString());
    }
    if (response.feedback) {
      setFeedback(response.feedback);
    }
    if (response.isCorrect !== undefined) {
      setStatus(response.isCorrect ? "correct" : "incorrect");
    }
  }, [response]);

  // Check if this is an auto-graded field
  const isAutoGraded =
    field.type === "multiple_choice" ||
    field.type === "checkbox" ||
    field.type === "dropdown";

  const handleAISuggest = async () => {
    // Check if response has text content
    if (!response.value || typeof response.value !== "string") {
      toast.error("AI grading only works for text responses");
      return;
    }

    // Check credits
    if (credits && credits.balance < 1) {
      toast.error("Insufficient credits. Please purchase more credits.");
      return;
    }

    setIsGrading(true);
    setShowSuggestion(false);

    try {
      const result = await gradeResponseAction({
        responseId: response._id,
      });

      if (result.success) {
        setAiSuggestion({
          marks: result.marks,
          feedback: result.feedback,
          reasoning: result.reasoning,
          cost: result.cost,
        });
        setShowSuggestion(true);
        toast.success(`AI suggestion generated (${result.cost.toFixed(2)} credits used)`);
      }
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to get AI suggestion"
      );
    } finally {
      setIsGrading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (aiSuggestion) {
      setMarks(aiSuggestion.marks.toString());
      setFeedback(aiSuggestion.feedback);
      setStatus(
        aiSuggestion.marks >= maxMarks * 0.7
          ? "correct"
          : aiSuggestion.marks > 0
          ? "partial"
          : "incorrect"
      );
      setShowSuggestion(false);
      toast.success("AI suggestion applied");
    }
  };

  const handleSave = async () => {
    const marksValue = parseFloat(marks);
    if (isNaN(marksValue)) {
      toast.error("Please enter a valid marks value");
      return;
    }

    if (marksValue < 0 || marksValue > maxMarks) {
      toast.error(`Marks must be between 0 and ${maxMarks}`);
      return;
    }

    setIsSaving(true);
    try {
      await markResponse({
        responseId: response._id,
        marksAwarded: marksValue,
        maxMarks,
        feedback: feedback || undefined,
        isCorrect:
          status === "correct" ? true : status === "incorrect" ? false : undefined,
      });
      
      // Recalculate submission marks
      await recalculateMarks({
        submissionId: response.submissionId,
      });
      
      toast.success("Marks saved successfully");
      onMarkSaved?.();
    } catch (error) {
      console.error("Error saving marks:", error);
      toast.error("Failed to save marks");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Marking</h4>
          <div className="flex items-center gap-2">
            {isAutoGraded && (
              <Badge variant="secondary" className="text-xs">
                Auto-graded
              </Badge>
            )}
            {/* AI Suggest Button */}
            {!isAutoGraded &&
              response.value &&
              typeof response.value === "string" && (
                <Popover open={showSuggestion} onOpenChange={setShowSuggestion}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isGrading}
                      onClick={handleAISuggest}
                    >
                      {isGrading ? (
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-3 w-3" />
                      )}
                      {isGrading ? "Grading..." : "AI Suggest"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96" align="end">
                    {aiSuggestion && (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">
                            AI Suggestion
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Cost: {aiSuggestion.cost.toFixed(2)} credits
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-medium">Marks:</span>
                            <span className="text-lg font-bold text-primary">
                              {aiSuggestion.marks} / {maxMarks}
                            </span>
                          </div>

                          <div>
                            <span className="text-sm font-medium">Feedback:</span>
                            <p className="text-sm text-muted-foreground mt-1">
                              {aiSuggestion.feedback}
                            </p>
                          </div>

                          <div>
                            <span className="text-sm font-medium">Reasoning:</span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {aiSuggestion.reasoning}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleAcceptSuggestion}
                            className="flex-1"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowSuggestion(false)}
                            className="flex-1"
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Marks Input */}
          <div className="space-y-2">
            <Label>Marks Awarded</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                max={maxMarks}
                min={0}
                step={0.5}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                / {maxMarks}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMarks(maxMarks.toString())}
              >
                Full Marks
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMarks((maxMarks / 2).toString())}
              >
                Half Marks
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMarks("0")}
              >
                Zero
              </Button>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="space-y-2">
            <Label>Status</Label>
            <ToggleGroup
              type="single"
              value={status}
              onValueChange={(value) => {
                if (value) setStatus(value as typeof status);
              }}
            >
              <ToggleGroupItem value="correct" className="flex-1">
                Correct
              </ToggleGroupItem>
              <ToggleGroupItem value="partial" className="flex-1">
                Partial
              </ToggleGroupItem>
              <ToggleGroupItem value="incorrect" className="flex-1">
                Incorrect
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label>Feedback (optional)</Label>
            <Textarea
              placeholder="Add comments for the student..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Save Mark"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

