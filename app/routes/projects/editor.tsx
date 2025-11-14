import { redirect } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/editor";

export async function loader(args: Route.LoaderArgs) {
  const { params } = args;
  const { projectId } = params;

  if (!projectId) {
    throw redirect("/dashboard");
  }

  // Check authentication
  const { userId } = await getAuth(args);
  if (!userId) {
    throw redirect("/sign-in?redirect_url=/projects/" + projectId + "/editor");
  }

  try {
    // Fetch project data - this will check authorization internally
    // @ts-ignore - API will regenerate with convex dev
    const [project, fields] = await Promise.all([
      // @ts-ignore - API will regenerate with convex dev
      fetchQuery(api.projects.get, { projectId: projectId as any }),
      // @ts-ignore - API will regenerate with convex dev
      fetchQuery(api.fields.list, { projectId: projectId as any }),
    ]);

    if (!project) {
      throw redirect("/dashboard");
    }

    return {
      project,
      fields,
    };
  } catch (error) {
    console.error("Error loading project:", error);
    throw redirect("/dashboard");
  }
}

export default function ProjectEditor(props: Route.ComponentProps) {
  const { project, fields } = props.loaderData;
  return (
    <div className="flex h-screen flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Editor: {project?.name}</h1>
        <p className="text-sm text-muted-foreground">
          Project Editor - Phase 8 Implementation
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {fields.length} fields
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Editor view coming soon...</p>
      </div>
    </div>
  );
}
