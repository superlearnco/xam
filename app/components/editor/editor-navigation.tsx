import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  ArrowLeft,
  Check,
  Loader2,
  Eye,
  Settings,
  FileEdit,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface EditorNavigationProps {
  projectId: Id<"projects">;
  projectName: string;
  projectStatus: "draft" | "published" | "archived";
  currentTab: "edit" | "options" | "marking";
  isSaving?: boolean;
  lastSaved?: Date;
}

export function EditorNavigation({
  projectId,
  projectName,
  projectStatus,
  currentTab,
  isSaving = false,
  lastSaved,
}: EditorNavigationProps) {
  const [name, setName] = useState(projectName);
  const [isEditingName, setIsEditingName] = useState(false);
  const updateProject = useMutation(api.projects.update);
  const navigate = useNavigate();

  useEffect(() => {
    setName(projectName);
  }, [projectName]);

  const handleSaveName = async () => {
    if (name.trim() && name !== projectName) {
      try {
        await updateProject({
          projectId,
          name: name.trim(),
        });
      } catch (error) {
        console.error("Failed to update project name:", error);
        setName(projectName);
      }
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      setName(projectName);
      setIsEditingName(false);
    }
  };

  return (
    <div className="border-b bg-background sticky top-0 z-10">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground"
          >
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>

          <div className="h-8 w-px bg-border" />

          {isEditingName ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              className="h-9 w-64"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="rounded px-2 py-1 hover:bg-muted transition-colors"
            >
              <h1 className="text-lg font-semibold">{projectName}</h1>
            </button>
          )}

          <Badge
            variant={projectStatus === "published" ? "default" : "secondary"}
          >
            {projectStatus}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto-save indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Check className="h-3 w-3 text-green-600" />
                <span>Saved</span>
              </>
            ) : null}
          </div>

          {/* Publish button */}
          <Button
            onClick={() => navigate(`/projects/${projectId}/options`)}
            variant={projectStatus === "published" ? "outline" : "default"}
          >
            {projectStatus === "published" ? "Published" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-t px-6">
        <Link
          to={`/projects/${projectId}/editor`}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            currentTab === "edit"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <FileEdit className="h-4 w-4" />
          Edit
        </Link>
        <Link
          to={`/projects/${projectId}/options`}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            currentTab === "options"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Options
        </Link>
        <Link
          to={`/projects/${projectId}/marking`}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            currentTab === "marking"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Eye className="h-4 w-4" />
          Marking
        </Link>
      </div>
    </div>
  );
}

