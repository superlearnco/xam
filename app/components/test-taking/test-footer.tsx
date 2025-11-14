import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TestFooterProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canGoNext: boolean;
  isLastQuestion: boolean;
}

export function TestFooter({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
  canGoNext,
  isLastQuestion,
}: TestFooterProps) {
  const isFirstQuestion = currentQuestion === 0;

  return (
    <footer className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between py-4">
        {/* Left: Previous button */}
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {/* Center: Question indicator */}
        <div className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} of {totalQuestions}
        </div>

        {/* Right: Next or Submit button */}
        {isLastQuestion ? (
          <Button onClick={onSubmit} disabled={!canGoNext} className="gap-2">
            Submit
          </Button>
        ) : (
          <Button onClick={onNext} disabled={!canGoNext} className="gap-2">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </footer>
  );
}

