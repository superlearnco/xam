"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
    <div className="flex-1 bg-slate-50/50 p-4 md:p-8 flex justify-center">
      <div className="max-w-3xl w-full flex flex-col relative mx-auto">
        <div
          ref={setNodeRef}
          className={cn(
            "flex-1 space-y-6 pb-24",
            isOver && "bg-slate-100/50 ring-2 ring-primary/20 ring-inset rounded-xl transition-all duration-200"
          )}
        >
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              <div className="text-slate-400 mb-2">
                <p className="text-lg font-medium">This test is empty</p>
                <p className="text-sm mt-1">
                  Drag questions from the sidebar to build your test
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
    </div>
  );
}

