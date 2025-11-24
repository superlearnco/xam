"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { useAuth } from "@clerk/react-router";
import { Bug, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "../../../convex/_generated/api";

type BugReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BugReportDialog({
  open,
  onOpenChange,
}: BugReportDialogProps) {
  const { user } = useAuth();
  const submitFeedback = useAction(api.feedback.submitFeedback);
  const [type, setType] = useState<"bug" | "feature">("bug");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const userEmail = user?.emailAddresses?.[0]?.emailAddress || "unknown";
      const userName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName || user?.fullName || "Unknown User";

      await submitFeedback({
        type,
        message: message.trim(),
        userEmail,
        userName,
      });
      toast.success(
        type === "bug"
          ? "Bug report submitted! Thank you for helping us improve."
          : "Feature suggestion submitted! We appreciate your input."
      );
      setMessage("");
      setType("bug");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Report a Bug or Suggest a Feature
          </DialogTitle>
          <DialogDescription>
            Help us improve by sharing your feedback. We read every submission.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value: "bug" | "feature") => setType(value)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Suggestion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">
                {type === "bug" ? "Describe the bug" : "Describe your feature idea"}
              </Label>
              <Textarea
                id="message"
                placeholder={
                  type === "bug"
                    ? "What happened? What did you expect to happen?"
                    : "What feature would you like to see? How would it help you?"
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !message.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

