import { redirect } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/marking-submission";

export async function loader(args: Route.LoaderArgs) {
  const { params } = args;
  const { projectId, submissionId } = params;

  if (!projectId || !submissionId) {
    throw redirect("/dashboard");
  }

  // Check authentication
  const { userId } = await getAuth(args);
  if (!userId) {
    throw redirect(
      "/sign-in?redirect_url=/projects/" +
        projectId +
        "/marking/" +
        submissionId
    );
  }

  try {
    // Fetch all required data - authorization checked internally
    // @ts-ignore - API will regenerate with convex dev
    const [project, submission, fields] = await Promise.all([
      // @ts-ignore - API will regenerate with convex dev
      fetchQuery(api.projects.get, { projectId: projectId as any }),
      // @ts-ignore - API will regenerate with convex dev
      fetchQuery(api.submissions.get, { submissionId: submissionId as any }),
      // @ts-ignore - API will regenerate with convex dev
      fetchQuery(api.fields.list, { projectId: projectId as any }),
    ]);

    if (!project || !submission) {
      throw redirect("/dashboard");
    }

    // Fetch responses for the submission
    // @ts-ignore - API will regenerate with convex dev
    const responses = await fetchQuery(api.responses.list, {
      submissionId: submissionId as any,
    });

    return {
      project,
      submission,
      fields,
      responses,
    };
  } catch (error) {
    console.error("Error loading submission marking data:", error);
    throw redirect("/dashboard");
  }
}

export default function SubmissionMarking(props: Route.ComponentProps) {
  const { project, submission, fields, responses } = props.loaderData;

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Mark Submission: {project?.name}</h1>
        <p className="text-sm text-muted-foreground">
          Individual Submission Marking - Phase 11 Implementation
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {fields.length} fields, {responses.length} responses
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">
          Individual marking view coming soon...
        </p>
      </div>
    </div>
  );
}
