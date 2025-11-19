"use client";

import { useState, useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Eye, Edit, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface LatexEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function LatexEditor({
  value,
  onChange,
  placeholder = "Enter LaTeX equation...",
  label,
  className,
}: LatexEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPreview || !previewRef.current) {
      return;
    }

    const element = previewRef.current;
    
    // Clear previous content
    element.innerHTML = "";
    
    if (!value || value.trim() === "") {
      setError(null);
      return;
    }

    try {
      katex.render(value, element, {
        throwOnError: false,
        displayMode: true,
      });
      setError(null);
    } catch (e) {
      setError("Invalid LaTeX syntax");
      if (element) {
        element.innerHTML = `<span class="text-destructive">Error rendering LaTeX</span>`;
      }
    }

    // Cleanup function
    return () => {
      if (element) {
        element.innerHTML = "";
      }
    };
  }, [value, isPreview]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        {label && <Label>{label}</Label>}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Use LaTeX syntax for math equations.</p>
                <p>Example: c = {'\\sqrt{a^2 + b^2}'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="h-8 px-2 text-xs"
          >
            {isPreview ? (
              <>
                <Edit className="mr-1 h-3 w-3" /> Edit
              </>
            ) : (
              <>
                <Eye className="mr-1 h-3 w-3" /> Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {isPreview ? (
        <div
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setIsPreview(false)}
          title="Click to edit"
        >
          {value ? (
            <div ref={previewRef} className="text-center py-2" />
          ) : (
            <span className="text-muted-foreground italic">Empty equation</span>
          )}
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="font-mono text-sm"
          rows={3}
        />
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}


