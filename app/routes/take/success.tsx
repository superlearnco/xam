import { redirect } from "react-router";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/success";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { SuccessAnimation } from "~/components/test-taking/success-animation";
import { AnimatedNumber } from "~/components/shared/animated-number";

export async function loader(args: Route.LoaderArgs) {
  const { params } = args;
  const { projectId, submissionId } = params;

  if (!projectId || !submissionId) {
    throw redirect("/");
  }

  try {
    // Public access - no authentication required
    // Fetch project using public getter
    const project = await fetchQuery(api.projects.getByPublishedUrl, {
      publishedUrl: projectId,
    });

    if (!project) {
      throw redirect("/");
    }

    // Check if project is published
    if (project.status !== "published") {
      throw redirect("/");
    }

    // Fetch submission and options
    const [submission, options] = await Promise.all([
      fetchQuery(api.submissions.get, {
        submissionId: submissionId as any,
      }),
      fetchQuery(api.projectOptions.get, {
        projectId: project._id,
      }),
    ]);

    if (!submission) {
      throw redirect("/");
    }

    // Verify submission is completed
    if (submission.status === "in_progress") {
      throw redirect(`/take/${projectId}/${submissionId}`);
    }

    return {
      project,
      submission,
      options,
    };
  } catch (error) {
    console.error("Error loading success page:", error);
    throw redirect("/");
  }
}

export default function TestSuccess(props: Route.ComponentProps) {
  const { project, submission, options } = props.loaderData;

  const showFeedback =
    options?.instantFeedback &&
    submission.totalMarks !== undefined &&
    submission.earnedMarks !== undefined;

  const percentage = submission.percentage || 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <SuccessAnimation />
          <h1 className="text-2xl font-bold">Test Submitted Successfully!</h1>
          <p className="text-muted-foreground">
            Your responses have been recorded.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Display (if instant feedback enabled) */}
          {showFeedback && (
            <div className="space-y-4 rounded-lg border bg-secondary/50 p-6">
              <div className="text-center">
                <p className="mb-2 text-sm text-muted-foreground">Your Score</p>
                <div className="flex items-center justify-center gap-2">
                  <AnimatedNumber
                    value={percentage}
                    decimals={1}
                    suffix="%"
                    className="text-5xl font-bold text-primary"
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {submission.earnedMarks} / {submission.totalMarks} marks
                </p>
              </div>

              {/* Grade */}
              {submission.grade && (
                <div className="text-center">
                  <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                    Grade: {submission.grade}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Custom Confirmation Message */}
          {options?.showSubmissionConfirmation &&
            options?.confirmationMessage && (
              <div className="rounded-lg border bg-background p-4">
                <p className="text-sm text-muted-foreground">
                  {options.confirmationMessage}
                </p>
              </div>
            )}

          {/* Submission Details */}
          <div className="space-y-2 rounded-lg border bg-secondary/50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Test Name:</span>
              <span className="font-medium">{project.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submitted By:</span>
              <span className="font-medium">{submission.respondentName}</span>
            </div>
            {submission.submittedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted At:</span>
                <span className="font-medium">
                  {new Date(submission.submittedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Additional Info */}
          {!showFeedback && (
            <p className="text-center text-sm text-muted-foreground">
              Your submission will be reviewed and graded by your instructor.
            </p>
          )}

          {/* Close Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.close()}
          >
            Close Window
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
