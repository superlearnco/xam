import { Link } from "react-router";
import { Clock, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface TestHeaderProps {
  testName: string;
  headerTitle?: string;
  headerColor?: string;
  logo?: string;
  timeLimit?: number;
  startTime: number;
  isSaving?: boolean;
  onTimeUp?: () => void;
}

export function TestHeader({
  testName,
  headerTitle,
  headerColor = "#0071e3",
  logo,
  timeLimit,
  startTime,
  isSaving = false,
  onTimeUp,
}: TestHeaderProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!timeLimit) return;

    const calculateTimeRemaining = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = timeLimit * 60 - elapsed;
      return remaining > 0 ? remaining : 0;
    };

    setTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining === 0 && onTimeUp) {
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimit, startTime, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isWarning = timeRemaining !== null && timeRemaining <= 300; // 5 minutes

  return (
    <header
      className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ borderBottomColor: headerColor }}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Left: Logo and Test Name */}
        <div className="flex items-center gap-4">
          {logo ? (
            <img src={logo} alt="Logo" className="h-8 w-auto" />
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <div className="text-lg font-semibold">xam</div>
            </Link>
          )}
          <div className="hidden sm:block">
            <h1 className="text-lg font-medium">{headerTitle || testName}</h1>
          </div>
        </div>

        {/* Right: Timer and Save Status */}
        <div className="flex items-center gap-4">
          {/* Auto-save indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="hidden sm:inline">Saved</span>
              </>
            )}
          </div>

          {/* Timer */}
          {timeRemaining !== null && (
            <div
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 font-mono text-sm ${
                isWarning
                  ? "bg-destructive/10 text-destructive"
                  : "bg-secondary text-foreground"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="font-medium">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
