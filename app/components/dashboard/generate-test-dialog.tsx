"use client";

import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useAction } from "convex/react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
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
import { Label } from "~/components/ui/label";
import { api } from "convex/_generated/api";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

interface GenerateTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateTestDialog({ open, onOpenChange }: GenerateTestDialogProps) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [gradeLevel, setGradeLevel] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [complexity, setComplexity] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generateTestWithAI = useAction(api.tests.generateTestWithAI);
  const generateAndCreateTest = useMutation(api.tests.generateAndCreateTest);

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate with AI
          </DialogTitle>
          <DialogDescription>
            Describe the test you want to create, and AI will generate it for you.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="grade-level">Grade Level</Label>
            <Select
              value={gradeLevel}
              onValueChange={setGradeLevel}
              disabled={isGenerating}
            >
              <SelectTrigger id="grade-level" className="w-full">
                <SelectValue placeholder="Select grade level" />
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

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isGenerating}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select category" />
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

          <div className="grid gap-2">
            <Label htmlFor="complexity">Complexity</Label>
            <Select
              value={complexity}
              onValueChange={setComplexity}
              disabled={isGenerating}
            >
              <SelectTrigger id="complexity" className="w-full">
                <SelectValue placeholder="Select complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prompt">Test Description</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., Create a 10-question physics test about Newton's laws. Include multiple choice and short answer questions."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              disabled={isGenerating}
              className="resize-none"
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

