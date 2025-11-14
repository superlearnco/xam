import { redirect } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/options";

export async function loader(args: Route.LoaderArgs) {
  const { params } = args;
  const { projectId } = params;

  if (!projectId) {
    throw redirect("/dashboard");
  }

  // Check authentication
  const { userId } = await getAuth(args);
  if (!userId) {
    throw redirect("/sign-in?redirect_url=/projects/" + projectId + "/options");
  }

  try {
    // Fetch project data and options - authorization checked internally
    // @ts-ignore - API will regenerate with convex dev
    const [project, options] = await Promise.all([
      // @ts-ignore - API will regenerate with convex dev
      fetchQuery(api.projects.get, { projectId: projectId as any }),
      // @ts-ignore - API will regenerate with convex dev
      fetchQuery(api.projectOptions.get, { projectId: projectId as any }),
    ]);

    if (!project) {
      throw redirect("/dashboard");
    }

    return {
      project,
      options,
    };
  } catch (error) {
    console.error("Error loading project options:", error);
    throw redirect("/dashboard");
  }
}

export default function ProjectOptions(props: Route.ComponentProps) {
  const { project, options } = props.loaderData;

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Project Options: {project?.name}</h1>
        <p className="text-sm text-muted-foreground">
          Project Options Configuration - Phase 9 Implementation
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Options view coming soon...</p>
      </div>
    </div>
  );
}
