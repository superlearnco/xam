import { redirect } from "react-router";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/test";

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

    // Fetch submission, fields, and responses
    // @ts-ignore - API will regenerate with convex dev
    const [submission, fields, responses] = await Promise.all([
      // @ts-ignore - API will regenerate with convex dev
      fetchQuery(api.submissions.get, { submissionId: submissionId as any }),
      // @ts-ignore - API will regenerate with convex dev
      fetchQuery(api.fields.list, { projectId: project._id }),
      // @ts-ignore - API will regenerate with convex dev
      fetchQuery(api.responses.list, { submissionId: submissionId as any }),
    ]);

    if (!submission) {
      throw redirect(`/take/${projectId}`);
    }

    // Check if submission is already completed
    if (submission.status === "submitted" || submission.status === "marked") {
      throw redirect(`/take/${projectId}/${submissionId}/success`);
    }

    return {
      project,
      submission,
      fields,
      responses,
    };
  } catch (error) {
    console.error("Error loading test:", error);
    throw redirect("/");
  }
}

export default function TakeTest(props: Route.ComponentProps) {
  const { project, submission, fields, responses } = props.loaderData;

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Take Test: {project?.name}</h1>
        <p className="text-sm text-muted-foreground">
          Test Taking Interface - Phase 10 Implementation
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {fields.length} questions, {responses.length} responses saved
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Test taking view coming soon...</p>
      </div>
    </div>
  );
}
