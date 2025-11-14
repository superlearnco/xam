import { useMutation } from "convex/react";
import { Link } from "react-router";
import {
  FileCheck,
  PenTool,
  ClipboardList,
  MoreVertical,
  Edit,
  Settings,
  Copy,
  Trash2,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Doc } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert";
import { useState } from "react";
import { useNavigate } from "react-router";

interface ProjectCardProps {
  project: Doc<"projects">;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const deleteProject = useMutation(api.projects.deleteProject);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getProjectIcon = () => {
    switch (project.type) {
      case "test":
        return <FileCheck className="h-5 w-5" />;
      case "essay":
        return <PenTool className="h-5 w-5" />;
      case "survey":
        return <ClipboardList className="h-5 w-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (project.type) {
      case "test":
        return "Test";
      case "essay":
        return "Essay";
      case "survey":
        return "Survey";
    }
  };

  const getStatusColor = () => {
    switch (project.status) {
      case "published":
        return "bg-green-500";
      case "draft":
        return "bg-yellow-500";
      case "archived":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject({ projectId: project._id });
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete project:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    // TODO: Implement duplicate functionality
    console.log("Duplicate project:", project._id);
  };

  const copyUrl = () => {
    if (project.publishedUrl) {
      const url = `${window.location.origin}/take/${project.publishedUrl}`;
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <>
      <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
        <Link to={`/projects/${project._id}/editor`} className="block">
          <CardHeader className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  {getProjectIcon()}
                </div>
                <div className="flex flex-col">
                  <Badge variant="secondary" className="w-fit">
                    {getTypeLabel()}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button variant="ghost" size="icon" className="opacity-0 transition-opacity group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault();
                    navigate(`/projects/${project._id}/editor`);
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault();
                    navigate(`/projects/${project._id}/marking`);
                  }}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Results
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault();
                    navigate(`/projects/${project._id}/options`);
                  }}>
                    <Settings className="mr-2 h-4 w-4" />
                    Options
                  </DropdownMenuItem>
                  {project.status === "published" && (
                    <DropdownMenuItem onClick={(e) => {
                      e.preventDefault();
                      copyUrl();
                    }}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Copy Link
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault();
                    handleDuplicate();
                  }}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <h3 className="line-clamp-2 text-lg font-semibold">{project.name}</h3>
              {project.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
            </div>
          </CardHeader>
        </Link>

        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
              <span className="capitalize">{project.status}</span>
            </div>
            <span>{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone and will delete all
              associated submissions and responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

