import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { AlertCircle } from "lucide-react";
import type { Doc } from "../../../convex/_generated/dataModel";

interface SubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  fields: Doc<"fields">[];
  responses: Map<string, any>;
  isSubmitting: boolean;
}

export function SubmitDialog({
  open,
  onOpenChange,
  onConfirm,
  fields,
  responses,
  isSubmitting,
}: SubmitDialogProps) {
  // Find unanswered required questions
  const unansweredRequired = fields.filter((field) => {
    if (!field.required) return false;
    const value = responses.get(field._id);
    return !value || (Array.isArray(value) && value.length === 0);
  });

  const hasUnanswered = unansweredRequired.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {hasUnanswered ? "Incomplete Submission" : "Submit Test"}
          </DialogTitle>
          <DialogDescription>
            {hasUnanswered
              ? "Some required questions have not been answered."
              : "Are you sure you want to submit your test? You won't be able to make changes after submission."}
          </DialogDescription>
        </DialogHeader>

        {hasUnanswered && (
          <div className="space-y-2 rounded-md border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Unanswered Required Questions:</span>
            </div>
            <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
              {unansweredRequired.slice(0, 5).map((field, index) => (
                <li key={field._id}>
                  Question {fields.indexOf(field) + 1}: {field.question}
                </li>
              ))}
              {unansweredRequired.length > 5 && (
                <li>...and {unansweredRequired.length - 5} more</li>
              )}
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {hasUnanswered ? "Go Back" : "Cancel"}
          </Button>
          {!hasUnanswered && (
            <Button onClick={onConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

