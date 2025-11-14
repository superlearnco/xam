import { redirect } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/options";
import { useQuery } from "convex/react";
import { EditorNavigation } from "~/components/editor/editor-navigation";
import { PageContainer } from "~/components/shared/page-container";
import { BrandingSection } from "~/components/options/branding-section";
import { AccessControlSection } from "~/components/options/access-control-section";
import { TestSettingsSection } from "~/components/options/test-settings-section";
import { FeedbackSettingsSection } from "~/components/options/feedback-settings-section";
import { SubmissionSettingsSection } from "~/components/options/submission-settings-section";

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
      projectId,
    };
  } catch (error) {
    console.error("Error loading project options:", error);
    throw redirect("/dashboard");
  }
}

export default function ProjectOptions(props: Route.ComponentProps) {
  const { project: initialProject, options: initialOptions, projectId } = props.loaderData;

  // Get real-time updates from Convex
  const project = useQuery(api.projects.get, { projectId: projectId as any }) || initialProject;
  const options = useQuery(api.projectOptions.get, { projectId: projectId as any }) || initialOptions;

  if (!project || !options) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <EditorNavigation
        projectId={projectId as any}
        projectName={project.name}
        projectStatus={project.status}
        currentTab="options"
      />

      <div className="flex-1 overflow-y-auto bg-muted/30">
        <PageContainer maxWidth="2xl">
          <div className="py-8 space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
              <p className="text-muted-foreground mt-2">
                Configure how your {project.type} appears and behaves for respondents
              </p>
            </div>

            <BrandingSection projectId={projectId as any} options={options} />

            <AccessControlSection projectId={projectId as any} options={options} />

            <TestSettingsSection
              projectId={projectId as any}
              projectType={project.type}
              options={options}
            />

            <FeedbackSettingsSection
              projectId={projectId as any}
              projectType={project.type}
              options={options}
            />

            <SubmissionSettingsSection projectId={projectId as any} options={options} />
          </div>
        </PageContainer>
      </div>
    </div>
  );
}
