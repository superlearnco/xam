import { useState, useEffect } from "react";
import { redirect } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import type { Route } from "./+types/editor";
import type { Id } from "../../../convex/_generated/dataModel";
import { EditorNavigation } from "~/components/editor/editor-navigation";
import { FieldPalette } from "~/components/editor/field-palette";
import { FormBuilder, type Field } from "~/components/editor/form-builder";
import { PropertyPanel } from "~/components/editor/property-panel";
import { useAutoSave } from "~/hooks/use-auto-save";

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
      projectId,
    };
  } catch (error) {
    console.error("Error loading project:", error);
    throw redirect("/dashboard");
  }
}

export default function ProjectEditor(props: Route.ComponentProps) {
  const { project: initialProject, projectId } = props.loaderData;

  // Real-time data from Convex
  const project = useQuery(api.projects.get, {
    projectId: projectId as Id<"projects">,
  });
  const fieldsData = useQuery(api.fields.list, {
    projectId: projectId as Id<"projects">,
  });

  // Mutations
  const createField = useMutation(api.fields.create);
  const updateField = useMutation(api.fields.update);
  const deleteField = useMutation(api.fields.deleteField);
  const reorderFields = useMutation(api.fields.reorder);

  // Local state
  const [selectedFieldId, setSelectedFieldId] = useState<Id<"fields"> | null>(
    null
  );
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, Partial<Field>>
  >({});

  // Auto-save hook
  const { isSaving, lastSaved, markDirty } = useAutoSave({
    onSave: async () => {
      // Save all pending changes
      for (const [fieldId, changes] of Object.entries(pendingChanges)) {
        await updateField({
          fieldId: fieldId as Id<"fields">,
          ...changes,
        });
      }
      setPendingChanges({});
    },
    delay: 1000,
  });

  const fields = (fieldsData || []) as Field[];
  const currentProject = project || initialProject;

  const handleAddField = async (fieldType: string) => {
    try {
      const fieldId = await createField({
        projectId: projectId as Id<"projects">,
        type: fieldType as any,
        question: "Untitled Question",
        required: true,
        marks: currentProject.type === "survey" ? undefined : 1,
      });
      setSelectedFieldId(fieldId);
    } catch (error) {
      console.error("Failed to create field:", error);
    }
  };

  const handleUpdateField = (fieldId: Id<"fields">, updates: Partial<Field>) => {
    setPendingChanges((prev) => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], ...updates },
    }));
    markDirty();
  };

  const handleDeleteField = async (fieldId: Id<"fields">) => {
    try {
      await deleteField({ fieldId });
      if (selectedFieldId === fieldId) {
        setSelectedFieldId(null);
      }
    } catch (error) {
      console.error("Failed to delete field:", error);
    }
  };

  const handleReorder = async (newOrder: Field[]) => {
    try {
      await reorderFields({
        projectId: projectId as Id<"projects">,
        fieldIds: newOrder.map((f) => f._id),
      });
    } catch (error) {
      console.error("Failed to reorder fields:", error);
    }
  };

  const selectedField = selectedFieldId
    ? fields.find((f) => f._id === selectedFieldId) || null
    : null;

  return (
    <div className="flex h-screen flex-col">
      <EditorNavigation
        projectId={projectId as Id<"projects">}
        projectName={currentProject.name}
        projectStatus={currentProject.status}
        currentTab="edit"
        isSaving={isSaving}
        lastSaved={lastSaved || undefined}
      />

      <div className="flex flex-1 overflow-hidden">
        <FieldPalette
          projectType={currentProject.type}
          onAddField={handleAddField}
        />

        <FormBuilder
          fields={fields}
          projectId={projectId as Id<"projects">}
          projectType={currentProject.type}
          selectedFieldId={selectedFieldId}
          onSelectField={setSelectedFieldId}
          onReorder={handleReorder}
          onUpdate={handleUpdateField}
          onDelete={handleDeleteField}
        />

        <PropertyPanel
          field={selectedField}
          projectType={currentProject.type}
          onUpdate={handleUpdateField}
        />
      </div>
    </div>
  );
}
