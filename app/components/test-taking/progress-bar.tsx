import { Progress } from "~/components/ui/progress";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="border-b bg-background">
      <div className="container py-3">
        <div className="flex items-center gap-3">
          <Progress value={percentage} className="flex-1" />
          <span className="text-sm text-muted-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
}

