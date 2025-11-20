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
import { api } from "convex/_generated/api";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

interface GenerateTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateTestDialog({ open, onOpenChange }: GenerateTestDialogProps) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
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
      const data = await generateTestWithAI({ prompt });
      
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
          <Textarea
            placeholder="e.g., Create a 10-question physics test about Newton's laws for 10th grade students. Include multiple choice and short answer questions."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            disabled={isGenerating}
            className="resize-none"
          />
          
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

