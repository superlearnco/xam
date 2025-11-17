"use client";

import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
import { Pencil, Trash2 } from "lucide-react";

export default function Page() {
  const [dialogOpen, setDialogOpen] = useState(false);
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
  const [sortBy, setSortBy] = useState<"name" | "recency">("recency");

  const tests = useQuery(api.tests.listTests, {
    search: search.trim() || undefined,
    type: typeFilter === "all" ? undefined : typeFilter,
    sortBy,
  });

  const deleteTest = useMutation(api.tests.deleteTest);
  const updateTest = useMutation(api.tests.updateTest);

  const handleEditClick = (test: { _id: Id<"tests">; name: string; description?: string }) => {
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

    try {
      await updateTest({
        testId: testToEdit.id,
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      setEditDialogOpen(false);
      setTestToEdit(null);
      setEditName("");
      setEditDescription("");
    } catch (error) {
      console.error("Failed to update test:", error);
    }
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
    if (testToDelete) {
      try {
        await deleteTest({ testId: testToDelete });
        setDeleteDialogOpen(false);
        setTestToDelete(null);
      } catch (error) {
        console.error("Failed to delete test:", error);
      }
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getTypeVariant = (type: string): "default" | "secondary" | "outline" => {
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
    <div className="flex flex-1 flex-col">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-6">
          {/* Header with New button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage your tests, surveys, and essays
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>New</Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as "all" | "test" | "survey" | "essay")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="survey">Survey</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as "name" | "recency")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="recency">Recency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tests List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tests === undefined ? (
              <div className="col-span-full text-center text-muted-foreground py-8">
                Loading...
              </div>
            ) : tests.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-8">
                {search || typeFilter !== "all"
                  ? "No tests found matching your criteria"
                  : "No tests yet. Create your first test!"}
              </div>
            ) : (
              tests.map((test) => (
                <Card key={test._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="line-clamp-2">{test.name}</CardTitle>
                      <Badge variant={getTypeVariant(test.type)}>
                        {getTypeLabel(test.type)}
                      </Badge>
                    </div>
                    <CardDescription>
                      Created {new Date(test.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      asChild
                    >
                      <Link to={`/dashboard/test/new?testId=${test._id}`}>
                        View
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditClick(test)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClick(test._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <NewTestDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <Dialog open={editDialogOpen} onOpenChange={handleEditClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Test</DialogTitle>
            <DialogDescription>
              Update the test name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter test name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                placeholder="Enter test description (optional)"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditClose}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={!editName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this test? This action cannot be undone.
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
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
