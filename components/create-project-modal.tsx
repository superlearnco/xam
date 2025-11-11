"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  ClipboardList,
  MessageSquare,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth/auth-context";
import { toast } from "sonner";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const projectTypes = [
  {
    id: "test",
    icon: FileText,
    label: "Test",
    description: "Graded assessments with multiple question types",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  {
    id: "essay",
    icon: ClipboardList,
    label: "Essay",
    description: "Long-form written responses with AI-assisted marking",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950",
  },
  {
    id: "survey",
    icon: MessageSquare,
    label: "Survey",
    description: "Collect feedback with rating scales and open responses",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
];

const difficultyLevels = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const currentUser = useQuery(api.users.getCurrentUserQuery);
  const creditBalance = useQuery(api.users.getCreditBalance);

  const [selectedType, setSelectedType] = useState<"test" | "essay" | "survey">(
    "test",
  );
  const [projectName, setProjectName] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState([5]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [isCreating, setIsCreating] = useState(false);

  const createProject = useMutation(api.projects.createProject);
  const hasSufficientCredits = useQuery(
    api.billing.hasSufficientCredits,
    currentUser && useAI
      ? { userId: currentUser._id, creditsRequired: numQuestions[0] * 10 }
      : "skip",
  );

  const estimatedCredits = useAI ? numQuestions[0] * 10 : 0;
  const canAffordAI = hasSufficientCredits !== false;

  const handleCreate = async () => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    if (!currentUser) {
      toast.error("You must be logged in to create a project");
      return;
    }

    if (useAI && !aiTopic.trim()) {
      toast.error("Please enter a topic for AI generation");
      return;
    }

    if (useAI && !canAffordAI) {
      toast.error("Insufficient credits for AI generation");
      return;
    }

    setIsCreating(true);

    try {
      const projectId = await createProject({
        userId: currentUser._id,
        name: projectName,
        description: useAI
          ? `AI-generated ${selectedType} about ${aiTopic}`
          : "",
        type: selectedType,
        useAI,
        aiPrompt: useAI
          ? `Generate ${numQuestions[0]} ${difficulty} ${selectedType} questions about ${aiTopic}`
          : undefined,
      });

      toast.success("Project created successfully!");
      onClose();

      // Reset form
      setProjectName("");
      setUseAI(false);
      setAiTopic("");
      setNumQuestions([5]);
      setDifficulty("medium");

      // Navigate to editor
      router.push(`/app/${projectId}/edit`);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-background rounded-xl shadow-2xl z-50 p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create New Project</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                disabled={isCreating}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Project Type */}
              <div>
                <Label className="text-base mb-3 block">Project Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  {projectTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id as any)}
                      disabled={isCreating}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg ${type.bgColor} flex items-center justify-center mb-3`}
                      >
                        <type.icon className={`w-5 h-5 ${type.color}`} />
                      </div>
                      <div className="font-semibold mb-1">{type.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {type.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Name */}
              <div>
                <Label htmlFor="project-name" className="text-base">
                  Project Name
                </Label>
                <Input
                  id="project-name"
                  placeholder="e.g., Biology Midterm Exam"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-2"
                  autoFocus
                  disabled={isCreating}
                />
              </div>

              {/* AI Generation Toggle */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                <input
                  type="checkbox"
                  id="use-ai"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  disabled={isCreating}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label
                  htmlFor="use-ai"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    Use AI to generate questions
                  </span>
                </label>
              </div>

              {/* AI Generation Options */}
              {useAI && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 p-4 bg-muted/30 rounded-lg"
                >
                  <div>
                    <Label htmlFor="ai-topic" className="text-sm">
                      Topic or Subject
                    </Label>
                    <Textarea
                      id="ai-topic"
                      placeholder="e.g., Photosynthesis and cellular respiration"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="mt-2 min-h-[80px]"
                      disabled={isCreating}
                    />
                  </div>

                  <div>
                    <Label className="text-sm">
                      Number of Questions: {numQuestions[0]}
                    </Label>
                    <Slider
                      value={numQuestions}
                      onValueChange={setNumQuestions}
                      min={3}
                      max={20}
                      step={1}
                      className="mt-2"
                      disabled={isCreating}
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Difficulty Level</Label>
                    <Select
                      value={difficulty}
                      onValueChange={(value: any) => setDifficulty(value)}
                      disabled={isCreating}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Credit Cost */}
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        Estimated Cost:
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {estimatedCredits} credits
                      </span>
                      {!canAffordAI && (
                        <span className="text-xs text-destructive">
                          (Insufficient)
                        </span>
                      )}
                    </div>
                  </div>

                  {!canAffordAI && (
                    <div className="text-sm text-destructive">
                      You need {estimatedCredits} credits but only have{" "}
                      {creditBalance?.totalCredits || 0}.{" "}
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={() => router.push("/app/billing")}
                      >
                        Purchase more credits
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isCreating}
                  className="flex-1 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={
                    !projectName.trim() ||
                    (useAI && (!aiTopic.trim() || !canAffordAI)) ||
                    isCreating
                  }
                  className="flex-1 gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>Create Project</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
