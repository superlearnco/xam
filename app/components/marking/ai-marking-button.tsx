import { useState } from "react";
import { Sparkles, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Progress } from "~/components/ui/progress";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";

interface AIMarkingButtonProps {
  projectId: Id<"projects">;
  submissions: Array<{ _id: Id<"submissions">; respondentName: string; status: string }>;
  unmarkedCount: number;
  onComplete?: () => void;
}

export function AIMarkingButton({
  projectId,
  submissions,
  unmarkedCount,
  onComplete,
}: AIMarkingButtonProps) {
  const [isMarking, setIsMarking] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Array<{ success: boolean; name: string; error?: string }>>([]);

  const bulkGradeAction = useMutation(api.ai.actions.bulkGradeSubmission);
  const credits = useQuery(api.credits.getCredits);

  const estimatedCredits = unmarkedCount * 1.5; // Rough estimate per submission

  const handleStartMarking = async () => {
    // Check credits
    if (credits && credits.balance < estimatedCredits) {
      toast.error(
        `Insufficient credits. You have ${credits.balance.toFixed(
          2
        )} credits but need approximately ${estimatedCredits.toFixed(2)} credits.`
      );
      return;
    }

    // Filter unmarked submissions
    const unmarkedSubmissions = submissions.filter(
      (s) => s.status === "submitted"
    );

    if (unmarkedSubmissions.length === 0) {
      toast.error("No unmarked submissions to grade");
      return;
    }

    setIsMarking(true);
    setShowDialog(true);
    setCurrentIndex(0);
    setResults([]);

    let successCount = 0;
    let failCount = 0;

    // Grade each submission
    for (let i = 0; i < unmarkedSubmissions.length; i++) {
      const submission = unmarkedSubmissions[i];
      setCurrentIndex(i + 1);

      try {
        const result = await bulkGradeAction({
          submissionId: submission._id,
        });

        setResults((prev) => [
          ...prev,
          {
            success: true,
            name: submission.respondentName,
          },
        ]);
        successCount++;
      } catch (error) {
        console.error(`Error grading submission ${submission._id}:`, error);
        setResults((prev) => [
          ...prev,
          {
            success: false,
            name: submission.respondentName,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
        failCount++;
      }
    }

    setIsMarking(false);

    if (successCount > 0) {
      toast.success(
        `Successfully graded ${successCount} submission(s)${
          failCount > 0 ? ` (${failCount} failed)` : ""
        }`
      );
      onComplete?.();
    } else {
      toast.error("Failed to grade any submissions");
    }
  };

  const handleClose = () => {
    if (!isMarking) {
      setShowDialog(false);
      setCurrentIndex(0);
      setResults([]);
    }
  };

  const unmarkedSubmissions = submissions.filter((s) => s.status === "submitted");
  const progress = unmarkedSubmissions.length > 0
    ? (currentIndex / unmarkedSubmissions.length) * 100
    : 0;

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">AI Auto-Marking</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically grade all text responses with AI. Estimated cost:{" "}
                {estimatedCredits.toFixed(2)} credits
              </p>
              <p className="text-xs text-muted-foreground">
                Current balance: {credits ? credits.balance.toFixed(2) : "0"}{" "}
                credits
              </p>
            </div>
            <Button
              size="lg"
              disabled={unmarkedCount === 0 || isMarking}
              onClick={handleStartMarking}
            >
              {isMarking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isMarking ? "Marking..." : "AI Mark All"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>AI Marking in Progress</DialogTitle>
            <DialogDescription>
              Grading {unmarkedSubmissions.length} submission(s)...
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>
                  {currentIndex} / {unmarkedSubmissions.length}
                </span>
              </div>
              <Progress value={progress} />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm p-2 rounded border"
                >
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.name}</p>
                    {result.error && (
                      <p className="text-xs text-red-600 truncate">
                        {result.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {!isMarking && (
                <Button onClick={handleClose} className="w-full">
                  Close
                </Button>
              )}
              {isMarking && (
                <p className="text-sm text-muted-foreground text-center w-full">
                  Please wait while AI grades the submissions...
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

