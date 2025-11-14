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

import { EditorNavigation } from "~/components/editor/editor-navigation";
import { PageContainer } from "~/components/shared";
import { AnalyticsOverview } from "~/components/marking/analytics-overview";
import { GradeDistributionChart } from "~/components/marking/grade-distribution-chart";
import { AIMarkingButton } from "~/components/marking/ai-marking-button";
import { SubmissionsTable } from "~/components/marking/submissions-table";

export default function ProjectMarking(props: Route.ComponentProps) {
  const { project, submissions, statistics } = props.loaderData;

  const unmarkedCount = statistics.submitted - statistics.marked;

  return (
    <div className="flex h-screen flex-col">
      <EditorNavigation
        projectId={project._id}
        projectName={project.name}
        currentTab="marking"
        status={project.status}
      />
      <PageContainer maxWidth="2xl" className="overflow-y-auto py-8">
        <div className="space-y-8">
          {/* Analytics Overview */}
          <AnalyticsOverview statistics={statistics} />

          {/* Grade Distribution Chart */}
          <GradeDistributionChart
            gradeDistribution={statistics.gradeDistribution}
          />

          {/* AI Marking (Phase 12 - Placeholder) */}
          {unmarkedCount > 0 && (
            <AIMarkingButton unmarkedCount={unmarkedCount} />
          )}

          {/* Submissions Table */}
          <SubmissionsTable
            projectId={project._id}
            submissions={submissions}
          />
        </div>
      </PageContainer>
    </div>
  );
}
