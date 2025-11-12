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

interface AIExplanationButtonProps {
  questionText: string;
  correctAnswer: string;
  questionType: string;
  difficulty?: "easy" | "medium" | "hard";
  projectId?: Id<"projects">;
  onExplanationGenerated: (explanation: string) => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AIExplanationButton({
  questionText,
  correctAnswer,
  questionType,
  difficulty = "medium",
  projectId,
  onExplanationGenerated,
  disabled = false,
  variant = "outline",
  size = "sm",
}: AIExplanationButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateExplanation = useAction(api.ai.generateExplanationAction);

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
      const result = await generateExplanation({
        questionText,
        correctAnswer,
        questionType,
        difficulty,
        projectId,
      });

      onExplanationGenerated(result.explanation);

      toast.success(
        `Generated explanation (${result.creditsUsed} credit${result.creditsUsed !== 1 ? "s" : ""} used)`
      );
    } catch (error: any) {
      console.error("Error generating explanation:", error);
      toast.error(error.message || "Failed to generate explanation");
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
                Generate Explanation
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Use AI to generate an educational explanation (~1 credit)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
