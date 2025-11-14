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

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MarkingHeader } from "~/components/marking/marking-header";
import { QuestionNavigator } from "~/components/marking/question-navigator";
import { SubmissionView } from "~/components/marking/submission-view";
import type { Id } from "../../../convex/_generated/dataModel";

export default function SubmissionMarking(props: Route.ComponentProps) {
  const { project, submission: initialSubmission, fields, responses: initialResponses } = props.loaderData;

  // Real-time updates
  const submission = useQuery(api.submissions.get, {
    submissionId: initialSubmission._id,
  }) || initialSubmission;

  const responses = useQuery(api.responses.list, {
    submissionId: initialSubmission._id,
  }) || initialResponses;

  const [currentFieldId, setCurrentFieldId] = useState<Id<"fields"> | undefined>(
    fields[0]?._id
  );

  // Calculate earned and total marks
  const { earnedMarks, totalMarks } = useMemo(() => {
    let earned = 0;
    let total = 0;

    fields.forEach((field) => {
      const response = responses.find((r) => r.fieldId === field._id);
      if (response && response.marksAwarded !== undefined) {
        earned += response.marksAwarded;
      }
      if (field.marks) {
        total += field.marks;
      }
    });

    return { earnedMarks: earned, totalMarks: total };
  }, [fields, responses]);

  // Update submission marks when responses change
  useEffect(() => {
    // This will be handled by the marking panel's save action
    // which will trigger the recalculation
  }, [earnedMarks, totalMarks]);

  const handleMarkSaved = () => {
    // Trigger re-fetch of submission data
    // The real-time queries will handle this automatically
  };

  return (
    <div className="flex h-screen flex-col">
      <MarkingHeader
        submission={submission}
        projectId={project._id}
        earnedMarks={earnedMarks}
        totalMarks={totalMarks}
      />
      <div className="flex flex-1 overflow-hidden">
        <QuestionNavigator
          fields={fields}
          responses={responses}
          currentFieldId={currentFieldId}
          onQuestionClick={setCurrentFieldId}
          earnedMarks={earnedMarks}
          totalMarks={totalMarks}
        />
        <SubmissionView
          fields={fields}
          responses={responses}
          currentFieldId={currentFieldId}
          onFieldChange={setCurrentFieldId}
          onMarkSaved={handleMarkSaved}
        />
      </div>
    </div>
  );
}
