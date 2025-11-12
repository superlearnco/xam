"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AIDistractorButtonProps {
  questionText: string;
  correctAnswer: string;
  difficulty?: "easy" | "medium" | "hard";
  projectId?: Id<"projects">;
  onDistractorsGenerated: (distractors: string[]) => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AIDistractorButton({
  questionText,
  correctAnswer,
  difficulty = "medium",
  projectId,
  onDistractorsGenerated,
  disabled = false,
  variant = "outline",
  size = "sm",
}: AIDistractorButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDistractors = useAction(api.ai.generateDistractorsAction);

  const handleGenerate = async () => {
    if (!questionText.trim()) {
      toast.error("Please enter a question text first");
      return;
    }

    if (!correctAnswer.trim()) {
      toast.error("Please enter a correct answer first");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateDistractors({
        questionText,
        correctAnswer,
        count: 3,
        difficulty,
        projectId,
      });

      onDistractorsGenerated(result.distractors);

      toast.success(
        `Generated ${result.distractors.length} distractors (${result.creditsUsed} credit${result.creditsUsed !== 1 ? "s" : ""} used)`
      );
    } catch (error: any) {
      console.error("Error generating distractors:", error);
      toast.error(error.message || "Failed to generate distractors");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={variant}
            size={size}
            onClick={handleGenerate}
            disabled={disabled || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Options
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Use AI to generate plausible incorrect answer options (~1 credit)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
