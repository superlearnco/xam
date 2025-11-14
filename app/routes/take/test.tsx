import { redirect, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { fetchQuery } from "convex/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/test";
import { TestHeader } from "~/components/test-taking/test-header";
import { ProgressBar } from "~/components/test-taking/progress-bar";
import { TestForm } from "~/components/test-taking/test-form";
import { TestFooter } from "~/components/test-taking/test-footer";
import { SubmitDialog } from "~/components/test-taking/submit-dialog";

export async function loader(args: Route.LoaderArgs) {
  const { params } = args;
  const { projectId, submissionId } = params;

  if (!projectId || !submissionId) {
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

    // Fetch submission, fields, responses, and options
    const [submission, fields, responses, options] = await Promise.all([
      fetchQuery(api.submissions.get, { submissionId: submissionId as any }),
      fetchQuery(api.fields.list, { projectId: project._id }),
      fetchQuery(api.responses.list, { submissionId: submissionId as any }),
      fetchQuery(api.projectOptions.get, { projectId: project._id }),
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
      options,
      submissionId,
    };
  } catch (error) {
    console.error("Error loading test:", error);
    throw redirect("/");
  }
}

export default function TakeTest(props: Route.ComponentProps) {
  const { project, submission, fields: initialFields, responses: initialResponses, options, submissionId } = props.loaderData;
  const navigate = useNavigate();

  // Real-time data sync
  const fields = useQuery(api.fields.list, { projectId: project._id }) || initialFields;
  const responses = useQuery(api.responses.list, { submissionId: submissionId as any }) || initialResponses;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const submitSubmission = useMutation(api.submissions.submit);

  // Build response map for easy access
  const responseMap = new Map(
    responses.map((r) => [r.fieldId, r.value])
  );

  // Count answered questions
  const answeredCount = responses.filter((r) => {
    const value = r.value;
    return value !== null && value !== "" && !(Array.isArray(value) && value.length === 0);
  }).length;

  const handleNext = () => {
    if (currentQuestionIndex < fields.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmitClick = () => {
    setShowSubmitDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitSubmission({ submissionId: submissionId as any });
      navigate(`/take/${project.publishedUrl}/${submissionId}/success`, {
        replace: true,
      });
    } catch (error) {
      console.error("Error submitting test:", error);
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    // Auto-submit when time is up
    handleConfirmSubmit();
  };

  const handleResponseChange = () => {
    // Callback when response is saved
  };

  const isLastQuestion = currentQuestionIndex === fields.length - 1;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <TestHeader
        testName={project.name}
        headerTitle={options?.headerTitle}
        headerColor={options?.headerColor}
        logo={options?.logo}
        timeLimit={options?.timeLimit}
        startTime={startTime}
        isSaving={isSaving}
        onTimeUp={handleTimeUp}
      />

      {/* Progress Bar */}
      {options?.showProgressBar && (
        <ProgressBar current={answeredCount} total={fields.length} />
      )}

      {/* Form */}
      <div className="flex-1">
        <TestForm
          fields={fields}
          submissionId={submissionId as any}
          existingResponses={responses}
          currentQuestionIndex={currentQuestionIndex}
          onResponseChange={handleResponseChange}
          onSavingChange={setIsSaving}
        />
      </div>

      {/* Footer */}
      <TestFooter
        currentQuestion={currentQuestionIndex}
        totalQuestions={fields.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmitClick}
        canGoNext={true}
        isLastQuestion={isLastQuestion}
      />

      {/* Submit Confirmation Dialog */}
      <SubmitDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onConfirm={handleConfirmSubmit}
        fields={fields}
        responses={responseMap}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
