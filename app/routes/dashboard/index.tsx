"use client";

import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import { NewTestDialog } from "~/components/dashboard/new-test-dialog";
import { GenerateTestDialog } from "~/components/dashboard/generate-test-dialog";
import { Sparkles } from "lucide-react";

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

  const getTypeLabel = (type: string) =>
    type.charAt(0).toUpperCase() + type.slice(1);

  const getTypeVariant = (
    type: string
  ): "default" | "secondary" | "outline" => {
    switch (type) {
      case "test":
        return "default";
      case "survey":
        return "secondary";
      case "essay":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-muted/10">
      <div className="border-b bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Your Assessments
            </h1>
            <p className="text-sm text-muted-foreground">
              Create, edit, and manage your tests and surveys in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setDialogOpen(true)} className="w-fit gap-2">
              <Plus className="h-4 w-4" />
              New Assessment
            </Button>
            <Button onClick={() => setGenerateDialogOpen(true)} variant="outline" className="w-fit gap-2">
              <Sparkles className="h-4 w-4" />
              Generate
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-10">
        <Card>
          <CardHeader className="gap-6 lg:flex lg:items-center lg:justify-between">
            <div>
              <CardTitle>Your work</CardTitle>
              <CardDescription>
                Filter drafts, surveys, and essays without losing context.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row">
              <Input
                placeholder="Search by title or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="lg:w-64"
              />
              <div className="flex gap-3">
                <Select
                  value={typeFilter}
                  onValueChange={(value) =>
                    setTypeFilter(value as "all" | "test" | "survey" | "essay")
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="test">Test</SelectItem>
                    <SelectItem value="survey">Survey</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(value as "name" | "recency" | "lastEdited")
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastEdited">Last edited</SelectItem>
                    <SelectItem value="recency">Last created</SelectItem>
                    <SelectItem value="name">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tests === undefined ? (
                <LoadingState />
              ) : tests.length === 0 ? (
                <EmptyState hasFilters={!!search || typeFilter !== "all"} />
              ) : (
                tests.map((test) => (
                  <Card key={test._id} className="border shadow-sm">
                    <CardHeader className="gap-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {test.name || "Untitled"}
                          </CardTitle>
                          <CardDescription>
                            Created{" "}
                            {new Date(test.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant={getTypeVariant(test.type)}>
                          {getTypeLabel(test.type)}
                        </Badge>
                      </div>
                      {test.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {test.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/dashboard/test/new?testId=${test._id}`}>
                          Continue building
                        </Link>
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditClick(test)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(test._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <NewTestDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <GenerateTestDialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen} />

      <Dialog open={editDialogOpen} onOpenChange={handleEditClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
            <DialogDescription>
              Give your assessment a clear name and context.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter a memorable title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Describe the goal or cohort (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditClose}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={!editName.trim()}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete assessment</DialogTitle>
            <DialogDescription>
              This action permanently removes the project and all associated
              fields.
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
    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border bg-background/60 py-10 text-muted-foreground">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-transparent" />
      <p className="mt-4 text-sm">Fetching your assessments…</p>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="col-span-full rounded-2xl border bg-background/60 py-10 text-center">
      <p className="text-sm text-muted-foreground">
        {hasFilters
          ? "No assessments match your filters."
          : "No projects yet. Create your first assessment to get started."}
      </p>
      {!hasFilters && (
        <Button className="mt-4" onClick={() => window.scrollTo({ top: 0 })}>
          Create your first project
        </Button>
      )}
    </div>
  );
}
