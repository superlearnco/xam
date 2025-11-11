"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MoreVertical,
  Clock,
  Users,
  FileText,
  ClipboardList,
  MessageSquare,
  Trash2,
  Copy,
  Archive,
  Edit,
} from "lucide-react";
import { AppNavbar } from "@/components/app-navbar";
import { CreateProjectModal } from "@/components/create-project-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth/auth-context";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const typeConfig = {
  test: {
    icon: FileText,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    label: "Test",
  },
  essay: {
    icon: ClipboardList,
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    label: "Essay",
  },
  survey: {
    icon: MessageSquare,
    color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    label: "Survey",
  },
};

const statusConfig = {
  draft: {
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    label: "Draft",
  },
  published: {
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    label: "Published",
  },
  archived: {
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    label: "Archived",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const currentUser = useQuery(api.users.getCurrentUserQuery);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<
    "all" | "test" | "essay" | "survey"
  >("all");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "status">("recent");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteProjectId, setDeleteProjectId] = useState<Id<"projects"> | null>(
    null,
  );

  // Queries
  const allProjects = useQuery(
    api.projects.getUserProjects,
    currentUser ? { userId: currentUser._id } : "skip",
  );

  // Mutations
  const deleteProject = useMutation(api.projects.deleteProject);
  const duplicateProject = useMutation(api.projects.duplicateProject);
  const updateProjectStatus = useMutation(api.projects.updateProjectStatus);

  // Filter and sort projects
  const filteredProjects = allProjects
    ?.filter((project) => {
      // Filter by type
      if (filterType !== "all" && project.type !== filterType) {
        return false;
      }
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          project.name.toLowerCase().includes(searchLower) ||
          (project.description &&
            project.description.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return b.updatedAt - a.updatedAt;
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;

    try {
      await deleteProject({ projectId: deleteProjectId });
      toast.success("Project deleted successfully");
      setDeleteProjectId(null);
    } catch (error) {
      toast.error("Failed to delete project");
      console.error(error);
    }
  };

  const handleDuplicateProject = async (projectId: Id<"projects">) => {
    if (!currentUser) return;

    try {
      const newProjectId = await duplicateProject({
        projectId,
        userId: currentUser._id,
      });
      toast.success("Project duplicated successfully");
      router.push(`/app/${newProjectId}/edit`);
    } catch (error) {
      toast.error("Failed to duplicate project");
      console.error(error);
    }
  };

  const handleArchiveProject = async (
    projectId: Id<"projects">,
    currentStatus: string,
  ) => {
    try {
      const newStatus = currentStatus === "archived" ? "draft" : "archived";
      await updateProjectStatus({
        projectId,
        status: newStatus as "draft" | "published" | "archived",
      });
      toast.success(
        newStatus === "archived"
          ? "Project archived successfully"
          : "Project restored successfully",
      );
    } catch (error) {
      toast.error("Failed to update project status");
      console.error(error);
    }
  };

  const isLoading = allProjects === undefined;

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Tests</h1>
            <p className="text-muted-foreground">
              Manage your tests, essays, and surveys
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            value={filterType}
            onValueChange={(value: any) => setFilterType(value)}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="test">Tests</SelectItem>
              <SelectItem value="essay">Essays</SelectItem>
              <SelectItem value="survey">Surveys</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value: any) => setSortBy(value)}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="h-8 bg-muted rounded animate-pulse" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Project Grid */}
        {!isLoading && filteredProjects && filteredProjects.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => {
              const TypeIcon = typeConfig[project.type].icon;

              return (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                      <TypeIcon className="w-16 h-16 text-primary/40" />
                      <Badge
                        className={`absolute top-3 right-3 ${typeConfig[project.type].color}`}
                      >
                        {typeConfig[project.type].label}
                      </Badge>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg line-clamp-1 flex-1">
                          {project.name}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 -mr-2"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/app/${project._id}/edit`)
                              }
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDuplicateProject(project._id)
                              }
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleArchiveProject(
                                  project._id,
                                  project.status,
                                )
                              }
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              {project.status === "archived"
                                ? "Restore"
                                : "Archive"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteProjectId(project._id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{project.submissionCount || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={statusConfig[project.status].color}
                        >
                          {statusConfig[project.status].label}
                        </Badge>

                        <Link href={`/app/${project._id}/edit`}>
                          <Button size="sm" variant="ghost">
                            {project.status === "draft" ? "Continue" : "View"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProjects && filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm
                ? "No projects match your search"
                : filterType === "all"
                  ? "Create your first project to get started"
                  : `No ${filterType}s found. Try a different filter.`}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Project
              </Button>
            )}
          </motion.div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteProjectId}
        onOpenChange={() => setDeleteProjectId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project and all associated submissions and answers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
