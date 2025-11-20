"use client";

import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation } from "convex/react";
import {
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  Search,
  FileText,
  ClipboardList,
  MessageSquare,
  PieChart,
  Sparkles,
  Clock,
  Filter,
  ArrowUpDown
} from "lucide-react";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { NewTestDialog } from "~/components/dashboard/new-test-dialog";
import { GenerateTestDialog } from "~/components/dashboard/generate-test-dialog";
import { cn } from "~/lib/utils";

export default function DashboardIndex() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToEdit, setTestToEdit] = useState<{
    id: Id<"tests">;
    name: string;
    description?: string;
  } | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [testToDelete, setTestToDelete] = useState<Id<"tests"> | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "test" | "survey" | "essay"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "recency" | "lastEdited">(
    "lastEdited"
  );

  const tests = useQuery(api.tests.listTests, {
    search: search.trim() || undefined,
    type: typeFilter === "all" ? undefined : typeFilter,
    sortBy,
  });

  const deleteTest = useMutation(api.tests.deleteTest);
  const updateTest = useMutation(api.tests.updateTest);

  const handleEditClick = (test: {
    _id: Id<"tests">;
    name: string;
    description?: string;
  }) => {
    setTestToEdit({
      id: test._id,
      name: test.name,
      description: test.description,
    });
    setEditName(test.name);
    setEditDescription(test.description || "");
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!testToEdit || !editName.trim()) return;

    await updateTest({
      testId: testToEdit.id,
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    });
    handleEditClose();
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setTestToEdit(null);
    setEditName("");
    setEditDescription("");
  };

  const handleDeleteClick = (testId: Id<"tests">) => {
    setTestToDelete(testId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!testToDelete) return;
    await deleteTest({ testId: testToDelete });
    setDeleteDialogOpen(false);
    setTestToDelete(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "test":
        return <ClipboardList className="h-4 w-4" />;
      case "survey":
        return <PieChart className="h-4 w-4" />;
      case "essay":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "test":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "survey":
        return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100";
      case "essay":
        return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-background min-h-screen">
      {/* Header Section */}
      <div className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your assessments, surveys, and essays.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setGenerateDialogOpen(true)} 
                variant="outline" 
                className="gap-2 shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-indigo-500" />
                Generate with AI
              </Button>
              <Button 
                onClick={() => setDialogOpen(true)} 
                className="gap-2 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Create New
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assessments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background border-input"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  setTypeFilter(value as "all" | "test" | "survey" | "essay")
                }
              >
                <SelectTrigger className="w-[140px] h-9 bg-background">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="test">Tests</SelectItem>
                  <SelectItem value="survey">Surveys</SelectItem>
                  <SelectItem value="essay">Essays</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(value as "name" | "recency" | "lastEdited")
                }
              >
                <SelectTrigger className="w-[160px] h-9 bg-background">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastEdited">Last Modified</SelectItem>
                  <SelectItem value="recency">Date Created</SelectItem>
                  <SelectItem value="name">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tests === undefined ? (
            <LoadingState />
          ) : tests.length === 0 ? (
            <EmptyState hasFilters={!!search || typeFilter !== "all"} />
          ) : (
            tests.map((test) => (
              <Card 
                key={test._id} 
                className="group relative flex flex-col overflow-hidden border-transparent bg-card shadow-sm hover:shadow-md transition-all duration-200 ring-1 ring-border/50 hover:ring-border hover:border-border"
              >
                <CardHeader className="pb-3 pt-5 px-5">
                  <div className="flex items-start justify-between gap-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg border",
                            getTypeColor(test.type)
                          )}>
                            {getTypeIcon(test.type)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="capitalize">{test.type}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(test)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(test._id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 space-y-1">
                    <CardTitle className="text-lg font-semibold line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                      {test.name || "Untitled Assessment"}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                         Edited {new Date(test.lastEdited || test._creationTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 px-5 py-2">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {test.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter className="p-5 pt-2">
                  <Button asChild className="w-full bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 border-0 shadow-none font-medium">
                    <Link to={`/dashboard/test/new?testId=${test._id}`}>
                      Open Editor
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </main>

      <NewTestDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <GenerateTestDialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen} />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={handleEditClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Assessment</DialogTitle>
            <DialogDescription>
              Update the name and description of your assessment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Assessment Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Brief description (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditClose}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={!editName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Assessment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assessment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTestToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center min-h-[300px] rounded-2xl border border-dashed bg-card/50">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="mt-4 text-sm text-muted-foreground font-medium">Loading your assessments...</p>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center min-h-[400px] rounded-2xl border border-dashed bg-card/50 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileText className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-6 text-lg font-semibold">
        {hasFilters ? "No matches found" : "No assessments yet"}
      </h3>
      <p className="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? "Try adjusting your filters or search query to find what you're looking for."
          : "Create your first assessment to get started with evaluating your students or employees."}
      </p>
      {!hasFilters && (
        <Button onClick={() => window.scrollTo({ top: 0 })} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Assessment
        </Button>
      )}
    </div>
  );
}
