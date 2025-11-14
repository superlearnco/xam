import { redirect } from "react-router";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/start";
import { TestStartScreen } from "~/components/test-taking/test-start-screen";

export async function loader(args: Route.LoaderArgs) {
  const { params } = args;
  const { projectId } = params;

  if (!projectId) {
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

    // Fetch project options and fields
    const [options, fields] = await Promise.all([
      fetchQuery(api.projectOptions.get, {
        projectId: project._id,
      }),
      fetchQuery(api.fields.list, {
        projectId: project._id,
      }),
    ]);

    // Check if test is closed
    if (options?.closeDate && Date.now() > options.closeDate) {
      throw redirect("/");
    }

    return {
      project,
      options,
      fieldsCount: fields.length,
    };
  } catch (error) {
    console.error("Error loading test:", error);
    throw redirect("/");
  }
}

export default function TakeTestStart(props: Route.ComponentProps) {
  const { project, options, fieldsCount } = props.loaderData;

  return (
    <TestStartScreen
      project={project}
      options={options}
      fieldsCount={fieldsCount}
    />
  );
}
