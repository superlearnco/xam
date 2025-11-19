"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { FieldRenderer, type TestField } from "./field-renderer";

// Re-export TestField so it can be imported from this module
export type { TestField };
import { cn } from "~/lib/utils";
import type { RefObject } from "react";

interface TestBuilderProps {
  testName: string;
  testDescription: string;
  fields: TestField[];
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onFieldUpdate: (field: TestField) => void;
  onFieldDelete: (fieldId: string) => void;
  fieldRefs?: RefObject<Map<string, HTMLDivElement>>;
  onFieldSettingsClick?: (field: TestField) => void;
}

export function TestBuilder({
  testName,
  testDescription,
  fields,
  onNameChange,
  onDescriptionChange,
  onFieldUpdate,
  onFieldDelete,
  fieldRefs,
  onFieldSettingsClick,
}: TestBuilderProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "test-builder-drop-zone",
  });

  const fieldIds = fields.map((field) => field.id);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-name">Test Name</Label>
          <Input
            id="test-name"
            value={testName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter test name"
            className="text-lg font-semibold"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="test-description">Description</Label>
          <Textarea
            id="test-description"
            value={testDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Enter test description"
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 overflow-y-auto p-6 space-y-4",
          isOver && "bg-accent/50"
        )}
      >
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-muted-foreground mb-2">
              <p className="text-lg font-medium">No fields yet</p>
              <p className="text-sm">
                Drag field types from the left sidebar to get started
              </p>
            </div>
          </div>
        ) : (
          <SortableContext
            items={fieldIds}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                onUpdate={onFieldUpdate}
                onDelete={onFieldDelete}
                onSettingsClick={onFieldSettingsClick}
                fieldRef={(el) => {
                  if (fieldRefs?.current && el) {
                    fieldRefs.current.set(field.id, el);
                  } else if (fieldRefs?.current && !el) {
                    fieldRefs.current.delete(field.id);
                  }
                }}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}

