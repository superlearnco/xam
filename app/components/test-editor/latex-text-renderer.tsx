"use client";

import { useMemo, useRef, useEffect } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface LatexTextRendererProps {
  text: string;
  className?: string;
  inline?: boolean; // Use inline math mode for single LaTeX expressions
}

/**
 * Renders text with LaTeX support. Detects LaTeX delimiters:
 * - $...$ for inline math
 * - $$...$$ for display math
 * 
 * Plain text and LaTeX can be mixed in the same string.
 */
export function LatexTextRenderer({
  text,
  className = "",
  inline = false,
}: LatexTextRendererProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  // Parse text and identify LaTeX segments
  const segments = useMemo(() => {
    if (!text) return [];

    const parts: Array<{ type: "text" | "latex"; content: string; display: boolean }> = [];
    
    // Pattern to match $...$ (inline) or $$...$$ (display)
    // Uses negative lookbehind/lookahead to avoid matching $$ inside $...$
    const latexPattern = /(\$\$?)((?:[^$]|\\\$)+?)\1/g;
    let lastIndex = 0;
    let match;

    while ((match = latexPattern.exec(text)) !== null) {
      // Add text before the LaTeX
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
          display: false,
        });
      }

      // Add the LaTeX content
      const isDisplay = match[1].length === 2; // $$ means display mode
      parts.push({
        type: "latex",
        content: match[2],
        display: isDisplay,
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex),
        display: false,
      });
    }

    // If no LaTeX found, return the whole text as plain text
    if (parts.length === 0) {
      return [{ type: "text" as const, content: text, display: false }];
    }

    return parts;
  }, [text]);

  // Render the segments
  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    segments.forEach((segment) => {
      if (segment.type === "text") {
        if (segment.content) {
          const textNode = document.createTextNode(segment.content);
          containerRef.current.appendChild(textNode);
        }
      } else {
        // Render LaTeX
        try {
          const latexSpan = document.createElement("span");
          latexSpan.className = segment.display ? "block my-2" : "inline";
          
          katex.render(segment.content, latexSpan, {
            throwOnError: false,
            displayMode: segment.display,
          });
          
          containerRef.current.appendChild(latexSpan);
        } catch (error) {
          console.error("Error rendering LaTeX:", error);
          const errorSpan = document.createElement("span");
          errorSpan.className = "text-red-500 text-xs";
          errorSpan.textContent = "[LaTeX Error]";
          containerRef.current.appendChild(errorSpan);
        }
      }
    });
  }, [segments]);

  // If no LaTeX detected, just return plain text (optimization)
  const hasLatex = segments.some((s) => s.type === "latex");
  if (!hasLatex) {
    return <span className={className}>{text}</span>;
  }

  return <span ref={containerRef} className={className} />;
}

