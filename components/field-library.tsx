"use client"

import {
  Type,
  AlignLeft,
  FileText,
  Circle,
  CheckSquare,
  ChevronDown,
  ImageIcon,
  Upload,
  Star,
  BarChart3,
  Grid3x3,
  Heading,
  Minus,
  Info,
} from "lucide-react"

const fieldCategories = [
  {
    title: "Text Responses",
    fields: [
      { id: "short-text", icon: Type, label: "Short Text", description: "Single-line input" },
      { id: "long-text", icon: AlignLeft, label: "Long Text", description: "Multi-line paragraph" },
      { id: "rich-text", icon: FileText, label: "Rich Text", description: "Formatted text editor" },
    ],
  },
  {
    title: "Choice Questions",
    fields: [
      { id: "multiple-choice", icon: Circle, label: "Multiple Choice", description: "Radio button options" },
      { id: "checkboxes", icon: CheckSquare, label: "Checkboxes", description: "Multiple selections" },
      { id: "dropdown", icon: ChevronDown, label: "Dropdown", description: "Select menu" },
      { id: "image-choice", icon: ImageIcon, label: "Image Choice", description: "Picture options" },
    ],
  },
  {
    title: "File & Media",
    fields: [
      { id: "file-upload", icon: Upload, label: "File Upload", description: "Document submission" },
      { id: "image-upload", icon: ImageIcon, label: "Image Upload", description: "Picture upload" },
    ],
  },
  {
    title: "Survey Specific",
    fields: [
      { id: "rating-scale", icon: Star, label: "Rating Scale", description: "1-5 stars" },
      { id: "linear-scale", icon: BarChart3, label: "Linear Scale", description: "1-10 slider" },
      { id: "matrix", icon: Grid3x3, label: "Matrix/Grid", description: "Table format" },
    ],
  },
  {
    title: "Structural",
    fields: [
      { id: "section-header", icon: Heading, label: "Section Header", description: "Heading text" },
      { id: "page-break", icon: Minus, label: "Page Break", description: "New page" },
      { id: "info-block", icon: Info, label: "Info Block", description: "Instructions" },
    ],
  },
]

interface FieldLibraryProps {
  onAddField: (fieldType: string) => void
}

export function FieldLibrary({ onAddField }: FieldLibraryProps) {
  return (
    <div className="w-64 border-r border-border bg-muted/30 p-4 overflow-y-auto">
      <h3 className="font-semibold mb-4">Add Fields</h3>

      <div className="space-y-6">
        {fieldCategories.map((category) => (
          <div key={category.title}>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">{category.title}</h4>
            <div className="space-y-2">
              {category.fields.map((field) => (
                <button
                  key={field.id}
                  onClick={() => onAddField(field.id)}
                  className="w-full p-3 rounded-lg border border-border bg-background hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="flex items-start gap-2">
                    <field.icon className="w-4 h-4 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{field.label}</div>
                      <div className="text-xs text-muted-foreground">{field.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
