import { useState } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "react-router";
import { FileCheck, PenTool, ClipboardList } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ProjectType = "test" | "essay" | "survey";

const projectTypes = [
  {
    type: "test" as ProjectType,
    icon: FileCheck,
    label: "Test",
    description: "Multiple choice, short answer, auto-grading",
  },
  {
    type: "essay" as ProjectType,
    icon: PenTool,
    label: "Essay",
    description: "Long-form responses, AI-assisted grading",
  },
  {
    type: "survey" as ProjectType,
    icon: ClipboardList,
    label: "Survey",
    description: "Collect feedback, ratings, anonymous responses",
  },
];

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const navigate = useNavigate();
  const createProject = useMutation(api.projects.create);
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<ProjectType>("test");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const projectId = await createProject({
        name: name.trim(),
        type: selectedType,
      });
      
      // Reset form
      setName("");
      setSelectedType("test");
      onOpenChange(false);
      
      // Navigate to editor
      navigate(`/projects/${projectId}/editor`);
    } catch (err) {
      console.error("Failed to create project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setName("");
      setSelectedType("test");
      setError("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Choose a type and give your project a name to get started
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Type Selection */}
          <div className="space-y-2">
            <Label>Project Type</Label>
            <div className="grid grid-cols-3 gap-3">
              {projectTypes.map(({ type, icon: Icon, label, description }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-lg border-2 p-4 text-center transition-all hover:bg-accent",
                    selectedType === type
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg p-3",
                      selectedType === type
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">
                      {description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Math Quiz Chapter 5"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              disabled={isCreating}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
            {isCreating ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

