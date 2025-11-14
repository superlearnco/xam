import { useQuery } from "convex/react";
import { Sparkles } from "lucide-react";
import { Link } from "react-router";
import { api } from "../../../convex/_generated/api";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

export function AICreditsBadge() {
  const credits = useQuery(api.credits.getCredits);

  const getCreditColor = (balance: number) => {
    if (balance > 100) return "bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200";
    if (balance > 50) return "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-yellow-200";
    if (balance > 10) return "bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 border-orange-200";
    return "bg-red-500/10 text-red-700 hover:bg-red-500/20 border-red-200";
  };

  if (!credits) {
    return (
      <Badge variant="outline" className="gap-1.5">
        <Sparkles className="h-3 w-3" />
        <span className="font-mono text-xs">--</span>
      </Badge>
    );
  }

  return (
    <Link to="/dashboard/settings?tab=ai-credits">
      <Badge
        variant="outline"
        className={cn(
          "gap-1.5 transition-colors cursor-pointer",
          getCreditColor(credits.balance)
        )}
      >
        <Sparkles className="h-3 w-3" />
        <span className="font-mono text-xs">
          {credits.balance.toFixed(0)}
        </span>
      </Badge>
    </Link>
  );
}

