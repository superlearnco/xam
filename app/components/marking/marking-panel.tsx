import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
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
          {isAutoGraded && (
            <Badge variant="secondary" className="text-xs">
              Auto-graded
            </Badge>
          )}
          {/* AI Suggest Button - Phase 12 */}
          <Button variant="ghost" size="sm" disabled>
            <Sparkles className="mr-2 h-3 w-3" />
            AI Suggest
          </Button>
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

