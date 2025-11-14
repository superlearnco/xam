import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { TestFieldRenderer } from "./test-field-renderer";
import { Card } from "~/components/ui/card";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

interface TestFormProps {
  fields: Doc<"fields">[];
  submissionId: Id<"submissions">;
  existingResponses: Doc<"responses">[];
  currentQuestionIndex: number;
  onResponseChange: () => void;
  onSavingChange: (isSaving: boolean) => void;
}

export function TestForm({
  fields,
  submissionId,
  existingResponses,
  currentQuestionIndex,
  onResponseChange,
  onSavingChange,
}: TestFormProps) {
  const [responses, setResponses] = useState<Map<string, any>>(new Map());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const createOrUpdateResponse = useMutation(api.responses.create);

  // Initialize responses from existing data
  useEffect(() => {
    const responseMap = new Map();
    existingResponses.forEach((response) => {
      responseMap.set(response.fieldId, response.value);
    });
    setResponses(responseMap);
  }, [existingResponses]);

  // Auto-save handler with debouncing
  const saveResponse = useCallback(
    async (fieldId: Id<"fields">, value: any) => {
      try {
        onSavingChange(true);
        await createOrUpdateResponse({
          submissionId,
          fieldId,
          value: value === "" ? null : value,
        });
        onResponseChange();
      } catch (error) {
        console.error("Error saving response:", error);
      } finally {
        onSavingChange(false);
      }
    },
    [submissionId, createOrUpdateResponse, onResponseChange, onSavingChange]
  );

  const handleFieldChange = (fieldId: Id<"fields">, value: any) => {
    // Update local state immediately
    setResponses((prev) => {
      const newResponses = new Map(prev);
      newResponses.set(fieldId, value);
      return newResponses;
    });

    // Clear any previous timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      saveResponse(fieldId, value);
    }, 1000);

    setSaveTimeout(timeout);
  };

  const currentField = fields[currentQuestionIndex];

  if (!currentField) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card className="p-6 md:p-8">
        {/* Question number indicator */}
        <div className="mb-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Question {currentQuestionIndex + 1} of {fields.length}
          </div>
        </div>

        {/* Field renderer */}
        <TestFieldRenderer
          field={currentField}
          value={responses.get(currentField._id) || ""}
          onChange={(value) => handleFieldChange(currentField._id, value)}
          error={errors.get(currentField._id)}
        />
      </Card>
    </div>
  );
}

