"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { FieldTypesSidebar, type FieldType } from "~/components/test-editor/field-types";
import { TestBuilder, type TestField } from "~/components/test-editor/test-builder";
import { FieldPropertiesPanel } from "~/components/test-editor/field-properties-panel";
import { DashboardNav } from "~/components/dashboard/dashboard-nav";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

function generateFieldId(): string {
  return `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function TestEditorPage() {
  const [testNameParam, setTestNameParam] = useState("");
  const [testTypeParam, setTestTypeParam] = useState("test");

  // Get search params from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const testIdParam = params.get("testId");
    if (testIdParam) {
      setTestId(testIdParam as Id<"tests">);
    }
    setTestNameParam(params.get("name") || "");
    setTestTypeParam(params.get("type") || "test");
  }, []);

  const [testId, setTestId] = useState<Id<"tests"> | null>(null);
  const [testName, setTestName] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [fields, setFields] = useState<TestField[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const fieldRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [selectedFieldForProperties, setSelectedFieldForProperties] = useState<TestField | null>(null);
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");

  const createTest = useMutation(api.tests.createTest);
  const updateTest = useMutation(api.tests.updateTest);
  const test = useQuery(
    api.tests.getTest,
    testId ? { testId } : "skip"
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Create test on mount if we have name from URL params
  useEffect(() => {
    if (!testId && testNameParam && !isCreating) {
      setIsCreating(true);
      createTest({
        name: testNameParam,
        type: testTypeParam as "test" | "survey" | "essay",
      })
        .then((id) => {
          setTestId(id);
          setTestName(testNameParam);
        })
        .catch((error) => {
          console.error("Failed to create test:", error);
        })
        .finally(() => {
          setIsCreating(false);
        });
    }
  }, [testId, testNameParam, testTypeParam, createTest, isCreating]);

  // Load test data when testId is available
  useEffect(() => {
    if (test && testId) {
      setTestName(test.name);
      setTestDescription(test.description || "");
      setFields(
        (test.fields || []).sort((a, b) => a.order - b.order) as TestField[]
      );
    }
  }, [test, testId]);

  // Debounced auto-save
  const debouncedUpdate = useCallback(
    debounce(
      async (
        id: Id<"tests">,
        name: string,
        description: string,
        fields: TestField[]
      ) => {
        try {
          await updateTest({
            testId: id,
            name,
            description,
            fields: fields.map((f, index) => ({
              ...f,
              order: index,
            })),
          });
        } catch (error) {
          console.error("Failed to update test:", error);
        }
      },
      500
    ),
    [updateTest]
  );

  // Auto-save when test data changes
  useEffect(() => {
    if (testId && test) {
      debouncedUpdate(testId, testName, testDescription, fields);
    }
  }, [testId, testName, testDescription, fields, debouncedUpdate, test]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Handle dropping a field type from sidebar
    if (
      active.data.current?.type === "field-type" &&
      (over.id === "test-builder-drop-zone" || typeof over.id === "string" && over.id.startsWith("field-"))
    ) {
      const fieldType = active.data.current.fieldType as FieldType;
      const newField: TestField = {
        id: generateFieldId(),
        type: fieldType,
        label: "",
        required: false,
        options:
          fieldType === "multipleChoice" ||
          fieldType === "checkboxes" ||
          fieldType === "dropdown" ||
          fieldType === "imageChoice"
            ? [""]
            : undefined,
        order: fields.length,
        marks: 1,
      };
      
      // If dropped on a specific field, insert before it
      if (typeof over.id === "string" && over.id.startsWith("field-")) {
        const targetIndex = fields.findIndex((f) => f.id === over.id);
        if (targetIndex !== -1) {
          const newFields = [...fields];
          newFields.splice(targetIndex, 0, newField);
          setFields(newFields.map((f, index) => ({ ...f, order: index })));
        } else {
          setFields([...fields, newField].map((f, index) => ({ ...f, order: index })));
        }
      } else {
        setFields([...fields, newField].map((f, index) => ({ ...f, order: index })));
      }
      return;
    }

    // Handle reordering fields
    if (active.id !== over.id && typeof active.id === "string" && typeof over.id === "string") {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = [...fields];
        const [movedField] = newFields.splice(oldIndex, 1);
        newFields.splice(newIndex, 0, movedField);
        setFields(
          newFields.map((f, index) => ({ ...f, order: index }))
        );
      }
    }
  };

  const handleFieldUpdate = (updatedField: TestField) => {
    setFields(
      fields.map((f) => (f.id === updatedField.id ? updatedField : f))
    );
  };

  const handleFieldDelete = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId).map((f, index) => ({ ...f, order: index })));
    fieldRefs.current.delete(fieldId);
  };

  const handleFieldTypeClick = (fieldType: FieldType) => {
    const newField: TestField = {
      id: generateFieldId(),
      type: fieldType,
      label: "",
      required: false,
      options:
        fieldType === "multipleChoice" ||
        fieldType === "checkboxes" ||
        fieldType === "dropdown" ||
        fieldType === "imageChoice"
          ? [""]
          : undefined,
      order: fields.length,
      marks: 1,
    };
    
    setFields([...fields, newField].map((f, index) => ({ ...f, order: index })));
    
    // Scroll to the new field after a short delay to ensure it's rendered
    setTimeout(() => {
      const fieldElement = fieldRefs.current.get(newField.id);
      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleFieldSettingsClick = (field: TestField) => {
    setSelectedFieldForProperties(field);
    setPropertiesPanelOpen(true);
  };

  const handlePropertiesPanelUpdate = (updatedField: TestField) => {
    setFields(
      fields.map((f) => (f.id === updatedField.id ? updatedField : f))
    );
    setSelectedFieldForProperties(updatedField);
  };

  const tabs = [
    {
      value: "editor",
      label: "Editor",
      active: activeTab === "editor",
      onClick: () => setActiveTab("editor"),
    },
    {
      value: "options",
      label: "Options",
      active: activeTab === "options",
      onClick: () => setActiveTab("options"),
    },
    {
      value: "publish",
      label: "Publish",
      active: activeTab === "publish",
      onClick: () => setActiveTab("publish"),
    },
  ];

  // Show loading state while creating new test or loading existing test
  if (isCreating) {
    return (
      <>
        <DashboardNav tabs={tabs} />
        <div className="flex flex-1 flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Creating test...</p>
        </div>
      </>
    );
  }

  if (testId && test === undefined) {
    return (
      <>
        <DashboardNav tabs={tabs} />
        <div className="flex flex-1 flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading test...</p>
        </div>
      </>
    );
  }

  if (!testId) {
    return (
      <>
        <DashboardNav tabs={tabs} />
        <div className="flex flex-1 flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Creating test...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNav tabs={tabs} />
      <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Test Editor</h1>
        </div>
      </div>
      {activeTab === "editor" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 overflow-hidden">
            <FieldTypesSidebar onFieldTypeClick={handleFieldTypeClick} />
            <TestBuilder
              testName={testName}
              testDescription={testDescription}
              fields={fields}
              onNameChange={setTestName}
              onDescriptionChange={setTestDescription}
              onFieldUpdate={handleFieldUpdate}
              onFieldDelete={handleFieldDelete}
              fieldRefs={fieldRefs}
              onFieldSettingsClick={handleFieldSettingsClick}
            />
          </div>
          <FieldPropertiesPanel
            field={selectedFieldForProperties}
            open={propertiesPanelOpen}
            onOpenChange={setPropertiesPanelOpen}
            onUpdate={handlePropertiesPanelUpdate}
          />
          <DragOverlay>
            {activeId ? (
              <div className="opacity-50">
                {activeId.startsWith("field-type-") ? (
                  <div className="p-3 rounded-lg border-2 border-primary bg-card">
                    Dragging field type...
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border-2 border-primary bg-card">
                    Moving field...
                  </div>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      {activeTab === "options" && (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Options</p>
            <p className="text-sm mt-2">Options coming soon</p>
          </div>
        </div>
      )}
      {activeTab === "publish" && (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Publish</p>
            <p className="text-sm mt-2">Publish coming soon</p>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
