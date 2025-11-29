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
    // First match display math ($$...$$), then inline math ($...$)
    // We need to process display math first to avoid matching single $ inside $$
    const displayMathPattern = /\$\$((?:[^$]|\\\$)+?)\$\$/g;
    const inlineMathPattern = /\$((?:[^$]|\\\$)+?)\$/g;
    
    let lastIndex = 0;
    const matches: Array<{ index: number; length: number; content: string; display: boolean }> = [];
    const usedRanges: Array<{ start: number; end: number }> = [];
    
    // Find all display math matches ($$...$$) first
    let match;
    while ((match = displayMathPattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      matches.push({
        index: start,
        length: match[0].length,
        content: match[1],
        display: true,
      });
      usedRanges.push({ start, end });
    }
    
    // Find all inline math matches ($...$) that don't overlap with display math
    inlineMathPattern.lastIndex = 0; // Reset regex state
    while ((match = inlineMathPattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      
      // Check if this match overlaps with any display math match
      const overlaps = usedRanges.some(range => 
        (start >= range.start && start < range.end) ||
        (end > range.start && end <= range.end) ||
        (start <= range.start && end >= range.end)
      );
      
      if (!overlaps) {
        matches.push({
          index: start,
          length: match[0].length,
          content: match[1],
          display: false,
        });
      }
    }
    
    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);
    
    // Build parts array from matches
    for (const mathMatch of matches) {
      // Add text before the LaTeX
      if (mathMatch.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, mathMatch.index),
          display: false,
        });
      }
      
      // Add the LaTeX content
      parts.push({
        type: "latex",
        content: mathMatch.content,
        display: mathMatch.display,
      });
      
      lastIndex = mathMatch.index + mathMatch.length;
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
    if (parts.length === 0 || !parts.some(p => p.type === "latex")) {
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

    // Clear previous content
    ref.current.innerHTML = "";

    try {
      katex.render(content.trim(), ref.current, {
        throwOnError: false,
        displayMode: display,
      });
    } catch (error) {
      console.error("Error rendering LaTeX:", error, "Content:", content);
      if (ref.current) {
        ref.current.textContent = `[LaTeX Error: ${content}]`;
        ref.current.className = "text-red-500 text-xs";
      }
    }
  }, [content, display]);

  return <span ref={ref} className={display ? "block my-2" : "inline"} />;
}

