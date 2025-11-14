import { redirect } from "react-router";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/success";

export async function loader(args: Route.LoaderArgs) {
  const { params } = args;
  const { projectId, submissionId } = params;

  if (!projectId || !submissionId) {
    throw redirect("/");
  }

  try {
    // Public access - no authentication required
    // Fetch project using public getter
    // @ts-ignore - API will regenerate with convex dev
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

    // Fetch submission
    // @ts-ignore - API will regenerate with convex dev
    const submission = await fetchQuery(api.submissions.get, {
      submissionId: submissionId as any,
    });

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
    };
  } catch (error) {
    console.error("Error loading success page:", error);
    throw redirect("/");
  }
}

export default function TestSuccess(props: Route.ComponentProps) {
  const { project, submission } = props.loaderData;

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">
          Submission Complete: {project?.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Success Confirmation - Phase 10 Implementation
        </p>
        {submission?.submittedAt && (
          <p className="text-xs text-muted-foreground mt-2">
            Submitted at {new Date(submission.submittedAt).toLocaleString()}
          </p>
        )}
      </div>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Success view coming soon...</p>
      </div>
    </div>
  );
}
