"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Eye, Share2, Plus, Save, Loader2 } from "lucide-react";
import { AppNavbar } from "@/components/app-navbar";
import { FieldLibrary } from "@/components/field-library";
import { QuestionCard } from "@/components/question-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface Question {
  _id: Id<"questions">;
  projectId: Id<"projects">;
  order: number;
  type: string;
  questionText: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  points: number;
  required: boolean;
  options: Array<{
    text: string;
    imageUrl: string | null;
    isCorrect: boolean;
  }>;
  correctAnswers: string[];
  correctAnswer: string | null;
  modelAnswer: string | null;
  rubric: Array<{
    criterion: string;
    points: number;
    description: string;
  }>;
  explanation: string | null;
  randomizeOptions: boolean;
  allowOther: boolean;
  minLength: number | null;
  maxLength: number | null;
  fileTypes: string[];
  maxFileSize: number | null;
  scaleMin: number | null;
  scaleMax: number | null;
  scaleMinLabel: string | null;
  scaleMaxLabel: string | null;
  matrixRows: string[];
  matrixColumns: string[];
  createdAt: number;
  updatedAt: number;
  generatedByAI: boolean;
  aiGenerationId: Id<"aiGenerations"> | null;
  fromQuestionBank: boolean;
  tags: string[];
  difficulty: "easy" | "medium" | "hard" | null;
}

type SaveStatus = "saved" | "saving" | "error";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const projectId = params.projectId as Id<"projects">;

  const [testTitle, setTestTitle] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [selectedQuestionId, setSelectedQuestionId] =
    useState<Id<"questions"> | null>(null);

  // Load project data
  const projectData = useQuery(api.projects.getProjectWithQuestions, {
    projectId,
  });
  const updateProject = useMutation(api.projects.updateProject);
  const createQuestion = useMutation(api.questions.createQuestion);
  const updateQuestion = useMutation(api.questions.updateQuestion);
  const deleteQuestion = useMutation(api.questions.deleteQuestion);
  const duplicateQuestion = useMutation(api.questions.duplicateQuestion);
  const reorderQuestions = useMutation(api.questions.reorderQuestions);
  const recalculateStats = useMutation(api.projects.recalculateProjectStats);

  // Initialize state when data loads
  useEffect(() => {
    if (projectData) {
      setTestTitle(projectData.name);
      setTestDescription(projectData.description || "");
    }
  }, [projectData]);

  // Auto-save title and description with debounce
  useEffect(() => {
    if (!projectData) return;

    const timeoutId = setTimeout(async () => {
      if (
        testTitle !== projectData.name ||
        testDescription !== (projectData.description || "")
      ) {
        setSaveStatus("saving");
        try {
          await updateProject({
            projectId,
            name: testTitle,
            description: testDescription,
          });
          setSaveStatus("saved");
        } catch (error) {
          setSaveStatus("error");
          toast({
            title: "Error saving",
            description: "Failed to save changes. Please try again.",
            variant: "destructive",
          });
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    testTitle,
    testDescription,
    projectData,
    updateProject,
    projectId,
    toast,
  ]);

  const handleAddField = useCallback(
    async (fieldType: string) => {
      setSaveStatus("saving");
      try {
        const questionId = await createQuestion({
          projectId,
          type: fieldType,
        });
        setSaveStatus("saved");
        setSelectedQuestionId(questionId);
        await recalculateStats({ projectId });
        toast({
          title: "Question added",
          description: "New question has been added to your test.",
        });
      } catch (error) {
        setSaveStatus("error");
        toast({
          title: "Error",
          description: "Failed to add question. Please try again.",
          variant: "destructive",
        });
      }
    },
    [projectId, createQuestion, recalculateStats, toast],
  );

  const handleUpdateQuestion = useCallback(
    async (questionId: Id<"questions">, updates: any) => {
      setSaveStatus("saving");
      try {
        await updateQuestion({
          questionId,
          ...updates,
        });
        setSaveStatus("saved");
        await recalculateStats({ projectId });
      } catch (error) {
        setSaveStatus("error");
        toast({
          title: "Error",
          description: "Failed to update question. Please try again.",
          variant: "destructive",
        });
      }
    },
    [updateQuestion, recalculateStats, projectId, toast],
  );

  const handleDeleteQuestion = useCallback(
    async (questionId: Id<"questions">) => {
      if (!confirm("Are you sure you want to delete this question?")) return;

      setSaveStatus("saving");
      try {
        await deleteQuestion({ questionId });
        setSaveStatus("saved");
        await recalculateStats({ projectId });
        toast({
          title: "Question deleted",
          description: "The question has been removed from your test.",
        });
      } catch (error) {
        setSaveStatus("error");
        toast({
          title: "Error",
          description: "Failed to delete question. Please try again.",
          variant: "destructive",
        });
      }
    },
    [deleteQuestion, recalculateStats, projectId, toast],
  );

  const handleDuplicateQuestion = useCallback(
    async (questionId: Id<"questions">) => {
      setSaveStatus("saving");
      try {
        const newQuestionId = await duplicateQuestion({ questionId });
        setSaveStatus("saved");
        setSelectedQuestionId(newQuestionId);
        await recalculateStats({ projectId });
        toast({
          title: "Question duplicated",
          description: "A copy of the question has been created.",
        });
      } catch (error) {
        setSaveStatus("error");
        toast({
          title: "Error",
          description: "Failed to duplicate question. Please try again.",
          variant: "destructive",
        });
      }
    },
    [duplicateQuestion, recalculateStats, projectId, toast],
  );

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination || !projectData) return;

      const items = Array.from(projectData.questions);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      const questionIds = items.map((q) => q._id);

      setSaveStatus("saving");
      try {
        await reorderQuestions({ projectId, questionIds });
        setSaveStatus("saved");
        toast({
          title: "Questions reordered",
          description: "Question order has been updated.",
        });
      } catch (error) {
        setSaveStatus("error");
        toast({
          title: "Error",
          description: "Failed to reorder questions. Please try again.",
          variant: "destructive",
        });
      }
    },
    [projectData, reorderQuestions, projectId, toast],
  );

  if (!projectData) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const questions = projectData.questions as Question[];
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
  const selectedQuestion = questions.find((q) => q._id === selectedQuestionId);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel - Field Library */}
        <FieldLibrary onAddField={handleAddField} />

        {/* Center Panel - Form Canvas */}
        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-border bg-background sticky top-0 z-10">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link href="/app">
                    <Button variant="ghost" size="icon">
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>My Tests</span>
                    <span>/</span>
                    <span className="text-foreground font-medium">
                      {testTitle || "Untitled Test"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {saveStatus === "saving" && (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    )}
                    {saveStatus === "saved" && (
                      <>
                        <Save className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">
                          All changes saved
                        </span>
                      </>
                    )}
                    {saveStatus === "error" && (
                      <span className="text-destructive">Error saving</span>
                    )}
                  </div>
                  <Link href={`/app/${projectId}/preview`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                  </Link>
                  <Link href={`/app/${projectId}/options`}>
                    <Button size="sm" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      Publish
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary">
                  Edit
                </button>
                <Link href={`/app/${projectId}/options`}>
                  <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Options
                  </button>
                </Link>
                <Link href={`/app/${projectId}/preview`}>
                  <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Preview
                  </button>
                </Link>
                <Link href={`/app/${projectId}/mark`}>
                  <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    Mark
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-6 py-8 max-w-4xl">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Input
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="text-3xl font-bold border-none px-0 mb-4 focus-visible:ring-0"
                placeholder="Test Title"
              />
              <Textarea
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                className="resize-none border-none px-0 focus-visible:ring-0"
                placeholder="Add instructions or description..."
                rows={2}
              />
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="outline" className="text-base">
                  Total: {totalPoints} marks
                </Badge>
                <Badge variant="outline" className="text-base">
                  {questions.length}{" "}
                  {questions.length === 1 ? "question" : "questions"}
                </Badge>
              </div>
            </motion.div>

            {/* Questions */}
            {questions.length > 0 ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="questions">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-6"
                    >
                      {questions.map((question, index) => (
                        <Draggable
                          key={question._id}
                          draggableId={question._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <QuestionCard
                                  question={question}
                                  index={index}
                                  onUpdate={handleUpdateQuestion}
                                  onDelete={handleDeleteQuestion}
                                  onDuplicate={handleDuplicateQuestion}
                                  onSelect={() =>
                                    setSelectedQuestionId(question._id)
                                  }
                                  isSelected={
                                    selectedQuestionId === question._id
                                  }
                                  dragHandleProps={provided.dragHandleProps}
                                />
                              </motion.div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No questions yet. Add your first question to get started.
                </p>
              </div>
            )}

            {/* Add Question Button */}
            <Button
              variant="outline"
              className="w-full h-20 border-dashed gap-2 bg-transparent mt-6"
              onClick={() => handleAddField("multipleChoice")}
            >
              <Plus className="w-5 h-5" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 border-l border-border bg-muted/30 p-6 overflow-y-auto">
          <h3 className="font-semibold mb-4">Properties</h3>
          {selectedQuestion ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Question Type</p>
                <Badge>{selectedQuestion.type}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Points</p>
                <Input
                  type="number"
                  value={selectedQuestion.points}
                  onChange={(e) =>
                    handleUpdateQuestion(selectedQuestion._id, {
                      points: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  min={0}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">
                  Question{" "}
                  {questions.findIndex((q) => q._id === selectedQuestion._id) +
                    1}
                </p>
                <p className="text-xs text-muted-foreground">
                  Created{" "}
                  {new Date(selectedQuestion.createdAt).toLocaleDateString()}
                </p>
              </div>
              {selectedQuestion.generatedByAI && (
                <Badge variant="secondary" className="gap-1">
                  Generated by AI
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a question to view and edit its properties
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
