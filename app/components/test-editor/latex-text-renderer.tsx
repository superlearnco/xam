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

  // If no LaTeX detected, just return plain text (optimization)
  const hasLatex = segments.some((s) => s.type === "latex");
  if (!hasLatex) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return segment.content ? <span key={index}>{segment.content}</span> : null;
        }
        return <LatexSegment key={index} content={segment.content} display={segment.display} />;
      })}
    </span>
  );
}

function LatexSegment({ content, display }: { content: string; display: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    try {
      katex.render(content, ref.current, {
        throwOnError: false,
        displayMode: display,
      });
    } catch (error) {
      console.error("Error rendering LaTeX:", error);
      if (ref.current) {
        ref.current.textContent = "[LaTeX Error]";
        ref.current.className = "text-red-500 text-xs";
      }
    }
  }, [content, display]);

  return <span ref={ref} className={display ? "block my-2" : "inline"} />;
}

