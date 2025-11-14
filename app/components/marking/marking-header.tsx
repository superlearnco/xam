import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { AnimatedNumber } from "~/components/shared";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

interface MarkingHeaderProps {
  submission: Doc<"submissions">;
  projectId: Id<"projects">;
  earnedMarks: number;
  totalMarks: number;
}

export function MarkingHeader({
  submission,
  projectId,
  earnedMarks,
  totalMarks,
}: MarkingHeaderProps) {
  const navigate = useNavigate();

  const percentage = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0;

  const goBack = () => {
    navigate(`/projects/${projectId}/marking`);
  };

  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between">
        {/* Left side - Info */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marking
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h2 className="text-lg font-semibold">
              {submission.respondentName || "Anonymous"}'s Submission
            </h2>
            <p className="text-xs text-muted-foreground">
              {submission.submittedAt
                ? `Submitted ${format(
                    new Date(submission.submittedAt),
                    "MMM d, yyyy 'at' h:mm a"
                  )}`
                : "Not submitted yet"}
            </p>
          </div>
        </div>

        {/* Right side - Score */}
        <div className="text-right">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">
              <AnimatedNumber value={earnedMarks} decimals={1} />
            </span>
            <span className="text-xl text-muted-foreground">
              / {totalMarks.toFixed(1)}
            </span>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            <AnimatedNumber value={percentage} decimals={0} suffix="%" />
          </div>
        </div>
      </div>
    </div>
  );
}

