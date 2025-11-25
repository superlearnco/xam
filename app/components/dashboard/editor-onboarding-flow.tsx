"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  EDITOR_ONBOARDING_STEPS,
  type EditorOnboardingStep,
  type TooltipPosition,
} from "~/lib/onboarding-steps";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const EDITOR_ONBOARDING_KEY = "xam-editor-onboarding-complete";

interface EditorOnboardingFlowProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

interface TooltipRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function EditorOnboardingFlow({ onComplete, forceShow }: EditorOnboardingFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TooltipRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = EDITOR_ONBOARDING_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === EDITOR_ONBOARDING_STEPS.length - 1;

  useEffect(() => {
    setMounted(true);
    // Check if user has already completed editor onboarding
    const hasCompleted = localStorage.getItem(EDITOR_ONBOARDING_KEY);
    if (!hasCompleted || forceShow) {
      // Small delay to let the editor render
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  // Find and highlight target element
  const updateTargetRect = useCallback(() => {
    if (!currentStep.targetSelector) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = currentStep.highlightPadding || 0;
      setTargetRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isVisible) return;
    
    updateTargetRect();

    // Update on resize and scroll
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);

    // Also observe DOM changes in case elements load dynamically
    const observer = new MutationObserver(() => {
      setTimeout(updateTargetRect, 100);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
      observer.disconnect();
    };
  }, [updateTargetRect, isVisible]);

  const handleComplete = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(EDITOR_ONBOARDING_KEY, "true");
    onComplete?.();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(EDITOR_ONBOARDING_KEY, "true");
    onComplete?.();
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [isLastStep, handleComplete]);

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const getTooltipPosition = useCallback(
    (position: TooltipPosition = "bottom"): React.CSSProperties => {
      if (!targetRect) {
        // Center for overlay-only steps
        return {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
      }

      const tooltipWidth = 360;
      const tooltipHeight = 220;
      const offset = 16;
      const viewportPadding = 20;

      let top: number;
      let left: number;

      switch (position) {
        case "top":
          top = targetRect.top - tooltipHeight - offset;
          left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
          break;
        case "bottom":
          top = targetRect.top + targetRect.height + offset;
          left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
          left = targetRect.left - tooltipWidth - offset;
          break;
        case "right":
          top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
          left = targetRect.left + targetRect.width + offset;
          break;
        default:
          top = targetRect.top + targetRect.height + offset;
          left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      }

      // Ensure tooltip stays within viewport
      const maxLeft = window.innerWidth - tooltipWidth - viewportPadding;
      const maxTop = window.innerHeight - tooltipHeight - viewportPadding;

      left = Math.max(viewportPadding, Math.min(left, maxLeft));
      top = Math.max(viewportPadding, Math.min(top, maxTop));

      return {
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
      };
    },
    [targetRect]
  );

  const getArrowClasses = useCallback(
    (position: TooltipPosition = "bottom"): string => {
      if (!targetRect) return "hidden";

      const baseClasses =
        "absolute w-0 h-0 border-8 border-transparent";

      switch (position) {
        case "top":
          return cn(
            baseClasses,
            "bottom-[-16px] left-1/2 -translate-x-1/2 border-t-white border-b-0"
          );
        case "bottom":
          return cn(
            baseClasses,
            "top-[-16px] left-1/2 -translate-x-1/2 border-b-white border-t-0"
          );
        case "left":
          return cn(
            baseClasses,
            "right-[-16px] top-1/2 -translate-y-1/2 border-l-white border-r-0"
          );
        case "right":
          return cn(
            baseClasses,
            "left-[-16px] top-1/2 -translate-y-1/2 border-r-white border-l-0"
          );
        default:
          return "hidden";
      }
    },
    [targetRect]
  );

  if (!mounted || !isVisible) return null;

  const overlayContent = (
    <>
      {/* Dark overlay with cutout for highlighted element */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {targetRect ? (
          <svg className="w-full h-full">
            <defs>
              <mask id="editor-spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={targetRect.left}
                  y={targetRect.top}
                  width={targetRect.width}
                  height={targetRect.height}
                  rx="8"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.65)"
              mask="url(#editor-spotlight-mask)"
            />
          </svg>
        ) : (
          <div className="w-full h-full bg-black/65" />
        )}
      </div>

      {/* Highlight ring around target element */}
      {targetRect && (
        <div
          className="fixed z-[9999] pointer-events-none rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-transparent animate-pulse"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] w-[360px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={getTooltipPosition(currentStep.position)}
      >
        {/* Arrow pointing to target */}
        <div className={getArrowClasses(currentStep.position)} />

        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 text-base">
                {currentStep.title}
              </h3>
            </div>
            <button
              onClick={handleSkip}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              aria-label="Skip tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex items-center justify-between gap-3">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {EDITOR_ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                  index === currentStepIndex
                    ? "w-4 bg-primary"
                    : index < currentStepIndex
                      ? "bg-primary/50"
                      : "bg-gray-200"
                )}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                className="gap-1 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <Button size="sm" onClick={handleNext} className="gap-1">
              {isLastStep ? (
                "Start Creating"
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(overlayContent, document.body);
}

export function resetEditorOnboarding() {
  localStorage.removeItem(EDITOR_ONBOARDING_KEY);
}

