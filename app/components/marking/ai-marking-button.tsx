import { Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

interface AIMarkingButtonProps {
  unmarkedCount: number;
  onMarkAll?: () => void;
}

export function AIMarkingButton({
  unmarkedCount,
  onMarkAll,
}: AIMarkingButtonProps) {
  // Placeholder - AI implementation will be in Phase 12
  const estimatedCredits = unmarkedCount * 2; // Rough estimate

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">AI Auto-Marking</h3>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically grade all text responses with AI. Estimated cost:{" "}
              {estimatedCredits} credits
            </p>
          </div>
          <Button size="lg" disabled>
            <Sparkles className="mr-2 h-4 w-4" />
            AI Mark All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

