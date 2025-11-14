import { redirect } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/marking";

export async function loader(args: Route.LoaderArgs) {
  const { params } = args;
  const { projectId } = params;

  if (!projectId) {
    throw redirect("/dashboard");
  }

  // Check authentication
  const { userId } = await getAuth(args);
  if (!userId) {
    throw redirect("/sign-in?redirect_url=/projects/" + projectId + "/marking");
  }

  try {
    // Fetch project data, submissions, and statistics - authorization checked internally
    // @ts-ignore - API will regenerate with convex dev
    const [project, submissions, statistics] = await Promise.all([
      // @ts-ignore - API will regenerate with convex dev
      fetchQuery(api.projects.get, { projectId: projectId as any }),
      // @ts-ignore - API will regenerate with convex dev
      fetchQuery(api.submissions.list, { projectId: projectId as any }),
      // @ts-ignore - API will regenerate with convex dev
      fetchQuery(api.submissions.getStatistics, {
        projectId: projectId as any,
      }),
    ]);

    if (!project) {
      throw redirect("/dashboard");
    }

    return {
      project,
      submissions,
      statistics,
    };
  } catch (error) {
    console.error("Error loading marking data:", error);
    throw redirect("/dashboard");
  }
}

export default function ProjectMarking(props: Route.ComponentProps) {
  const { project, submissions, statistics } = props.loaderData;

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">
          Marking Overview: {project?.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Submission Marking and Analytics - Phase 11 Implementation
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {submissions.length} submissions
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Marking view coming soon...</p>
      </div>
    </div>
  );
}
