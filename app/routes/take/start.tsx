import { redirect } from "react-router";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/start";

export async function loader(args: Route.LoaderArgs) {
  const { params } = args;
  const { projectId } = params;

  if (!projectId) {
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

    // Fetch project options
    // @ts-ignore - API will regenerate with convex dev
    const options = await fetchQuery(api.projectOptions.get, {
      projectId: project._id,
    });

    return {
      project,
      options,
    };
  } catch (error) {
    console.error("Error loading test:", error);
    throw redirect("/");
  }
}

export default function TakeTestStart(props: Route.ComponentProps) {
  const { project, options } = props.loaderData;

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Start Test: {project?.name}</h1>
        <p className="text-sm text-muted-foreground">
          Test Start Screen - Phase 10 Implementation
        </p>
        {project?.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {project.description}
          </p>
        )}
      </div>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Test start view coming soon...</p>
      </div>
    </div>
  );
}
