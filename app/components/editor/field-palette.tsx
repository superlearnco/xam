import { useState } from "react";
import {
  Type,
  AlignLeft,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  Upload,
  Star,
  Hash,
  Calendar,
  Sliders,
  Mail,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Input } from "~/components/ui/input";

interface FieldType {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: "text" | "choice" | "media" | "survey" | "advanced";
}

const fieldTypes: FieldType[] = [
  {
    type: "short_text",
    label: "Short Text",
    icon: Type,
    description: "Single line text input",
    category: "text",
  },
  {
    type: "long_text",
    label: "Long Text",
    icon: AlignLeft,
    description: "Multi-line text area",
    category: "text",
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    icon: CheckCircle,
    description: "Single answer selection",
    category: "choice",
  },
  {
    type: "checkbox",
    label: "Checkboxes",
    icon: CheckSquare,
    description: "Multiple answer selection",
    category: "choice",
  },
  {
    type: "dropdown",
    label: "Dropdown",
    icon: ChevronDown,
    description: "Select from dropdown list",
    category: "choice",
  },
  {
    type: "file_upload",
    label: "File Upload",
    icon: Upload,
    description: "Upload files or images",
    category: "media",
  },
  {
    type: "rating",
    label: "Rating",
    icon: Star,
    description: "Star or numeric rating",
    category: "survey",
  },
  {
    type: "number",
    label: "Number",
    icon: Hash,
    description: "Numeric input",
    category: "advanced",
  },
  {
    type: "email",
    label: "Email",
    icon: Mail,
    description: "Email address input",
    category: "advanced",
  },
  {
    type: "date",
    label: "Date",
    icon: Calendar,
    description: "Date picker",
    category: "advanced",
  },
];

interface FieldPaletteProps {
  projectType: "test" | "essay" | "survey";
  onAddField: (fieldType: string) => void;
}

export function FieldPalette({ projectType, onAddField }: FieldPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter fields based on project type
  const filteredFields = fieldTypes.filter((field) => {
    // Rating is only for surveys
    if (field.type === "rating" && projectType !== "survey") {
      return false;
    }

    // Search filter
    if (
      search &&
      !field.label.toLowerCase().includes(search.toLowerCase()) &&
      !field.description.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (selectedCategory && field.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  const categories = [
    { value: "text", label: "Text" },
    { value: "choice", label: "Choice" },
    { value: "media", label: "Media" },
    { value: "survey", label: "Survey" },
    { value: "advanced", label: "Advanced" },
  ];

  return (
    <div className="w-64 border-r bg-muted/20 flex flex-col h-full">
      <div className="p-4 border-b bg-background">
        <h2 className="text-sm font-semibold mb-3">Add Fields</h2>
        <Input
          placeholder="Search fields..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Category filters */}
      <div className="px-4 py-2 border-b flex gap-1 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-2 py-1 text-xs rounded-md transition-colors",
            selectedCategory === null
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          )}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={cn(
              "px-2 py-1 text-xs rounded-md transition-colors",
              selectedCategory === category.value
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted"
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredFields.map((field) => {
            const Icon = field.icon;
            return (
              <button
                key={field.type}
                onClick={() => onAddField(field.type)}
                className="w-full p-3 rounded-lg border bg-background hover:bg-muted hover:border-primary transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium mb-0.5">
                      {field.label}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {field.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredFields.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No fields found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

