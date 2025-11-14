import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { EmptyState } from "~/components/shared";
import { FileQuestion } from "lucide-react";
import { FieldItem } from "./field-item";
import type { Id } from "../../../convex/_generated/dataModel";

export interface Field {
  _id: Id<"fields">;
  type: string;
  order: number;
  question: string;
  description?: string;
  marks?: number;
  required: boolean;
  options?: string[];
  correctAnswer?: string | string[];
  ratingScale?: { min: number; max: number };
  ratingLabels?: { min: string; max: string };
  allowedFileTypes?: string[];
  maxFileSize?: number;
  minLength?: number;
  maxLength?: number;
  createdAt: number;
  updatedAt: number;
}

interface FormBuilderProps {
  fields: Field[];
  projectId: Id<"projects">;
  projectType: "test" | "essay" | "survey";
  selectedFieldId: Id<"fields"> | null;
  onSelectField: (fieldId: Id<"fields"> | null) => void;
  onReorder: (newOrder: Field[]) => void;
  onUpdate: (fieldId: Id<"fields">, updates: Partial<Field>) => void;
  onDelete: (fieldId: Id<"fields">) => void;
}

export function FormBuilder({
  fields,
  projectId,
  projectType,
  selectedFieldId,
  onSelectField,
  onReorder,
  onUpdate,
  onDelete,
}: FormBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f._id === active.id);
      const newIndex = fields.findIndex((f) => f._id === over.id);

      const newOrder = arrayMove(fields, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  if (fields.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <EmptyState
          icon={FileQuestion}
          title="No fields yet"
          description="Click on a field type from the left panel to add your first field"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-muted/20">
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((f) => f._id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field, index) => (
              <FieldItem
                key={field._id}
                field={field}
                index={index}
                projectType={projectType}
                isSelected={selectedFieldId === field._id}
                onSelect={() => onSelectField(field._id)}
                onUpdate={(updates) => onUpdate(field._id, updates)}
                onDelete={() => onDelete(field._id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

