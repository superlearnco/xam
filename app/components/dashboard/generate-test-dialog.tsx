"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useMutation, useAction } from "convex/react";
import { 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  BookOpen, 
  GraduationCap, 
  BarChart,
  Wand2
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { api } from "convex/_generated/api";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

interface GenerateTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LOADING_STEPS = [
  "Analyzing requirements...",
  "Structuring questions...",
  "Drafting content...",
  "Reviewing complexity...",
  "Finalizing test..."
];

export function GenerateTestDialog({ open, onOpenChange }: GenerateTestDialogProps) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [gradeLevel, setGradeLevel] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [complexity, setComplexity] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  
  const generateTestWithAI = useAction(api.tests.generateTestWithAI);
  const generateAndCreateTest = useMutation(api.tests.generateAndCreateTest);

  // Cycle through loading steps
  useEffect(() => {
    if (!isGenerating) {
      setLoadingStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      // 1. Call AI to generate test structure using Convex action (automatic authentication)
      const data = await generateTestWithAI({ 
        prompt,
        gradeLevel: gradeLevel || undefined,
        category: category || undefined,
        complexity: complexity || undefined,
      });
      
      // 2. Validate basic structure
      if (!data.name || !Array.isArray(data.fields)) {
        throw new Error("Invalid response from AI");
      }

      // Ensure fields have order
      const fieldsWithOrder = data.fields.map((field: any, index: number) => ({
        ...field,
        order: index,
        // Ensure required fields for schema
        id: field.id || `field-${Date.now()}-${index}`,
        marks: field.marks || 1,
      }));

      // 3. Create test in database
      const testId = await generateAndCreateTest({
        name: data.name,
        description: data.description,
        type: data.type || "test",
        fields: fieldsWithOrder,
        maxAttempts: data.maxAttempts,
        estimatedDuration: data.estimatedDuration,
        timeLimitMinutes: data.timeLimitMinutes,
        passingGrade: data.passingGrade,
        instantFeedback: data.instantFeedback,
        showAnswerKey: data.showAnswerKey,
        randomizeQuestions: data.randomizeQuestions,
        shuffleOptions: data.shuffleOptions,
        viewType: data.viewType,
      });

      // 4. Navigate to editor
      onOpenChange(false);
      navigate(`/dashboard/test/new?testId=${testId}`);
      
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong while generating the test");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isGenerating) onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-3xl" />
          </div>

          <AnimatePresence mode="wait">
            {!isGenerating ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col"
              >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-border/40">
                  <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    Generate with AI
                  </DialogTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Describe your ideal test, and let our AI handle the structure, questions, and formatting instantly.
                  </p>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grade-level" className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5" /> Grade
                      </Label>
                      <Select value={gradeLevel} onValueChange={setGradeLevel}>
                        <SelectTrigger className="h-10 bg-muted/30 border-border/50 focus:ring-primary/20 transition-all hover:bg-muted/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                            <SelectItem key={grade} value={`${grade}`}>
                              {grade === 1 ? "1st" : grade === 2 ? "2nd" : grade === 3 ? "3rd" : `${grade}th`} Grade
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" /> Subject
                      </Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-10 bg-muted/30 border-border/50 focus:ring-primary/20 transition-all hover:bg-muted/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Math">Math</SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="complexity" className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <BarChart className="h-3.5 w-3.5" /> Level
                      </Label>
                      <Select value={complexity} onValueChange={setComplexity}>
                        <SelectTrigger className="h-10 bg-muted/30 border-border/50 focus:ring-primary/20 transition-all hover:bg-muted/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt" className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Wand2 className="h-3.5 w-3.5" /> Description
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="prompt"
                        placeholder="e.g., Create a 15-question calculus test focusing on derivatives and limits. Include a mix of multiple choice and word problems..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={5}
                        className="resize-none bg-muted/30 border-border/50 focus:ring-primary/20 focus:border-primary/50 transition-all hover:bg-muted/50 pr-4"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="overflow-hidden"
                    >
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex justify-end gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => onOpenChange(false)}
                    className="hover:bg-muted/50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleGenerate}
                    disabled={!prompt.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Test
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center relative overflow-hidden"
              >
                {/* Ambient Background Animation */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3], 
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-blue-500/10 blur-3xl"
                />

                {/* Central Animated Orb/Loader */}
                <div className="relative mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary border-l-primary/50"
                  />
                  <motion.div
                    animate={{ rotate: -180 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border-4 border-blue-500/20 border-b-blue-500 border-r-blue-500/50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                </div>

                {/* Cycling Text */}
                <motion.div
                  key={loadingStepIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2 z-10"
                >
                  <h3 className="text-xl font-medium text-foreground">
                    Generating Assessment
                  </h3>
                  <p className="text-muted-foreground text-sm min-w-[200px]">
                    {LOADING_STEPS[loadingStepIndex]}
                  </p>
                </motion.div>

                {/* Visual Progress Bar (Fake) */}
                <div className="w-48 h-1 bg-muted rounded-full mt-8 overflow-hidden z-10">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
