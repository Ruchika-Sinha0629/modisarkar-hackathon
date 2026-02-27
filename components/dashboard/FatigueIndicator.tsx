import { cn } from "@/lib/utils";

interface FatigueIndicatorProps {
    score: number; // 0-10 scale
    showLabel?: boolean;
}

export default function FatigueIndicator({ score, showLabel = true }: FatigueIndicatorProps) {
    // Convert 0-10 score to percentage
    const percentage = Math.min(Math.max(score * 10, 0), 100);

    // Determine color based on severity
    let colorClass = "bg-green-500";
    let statusText = "Safe";

    if (score >= 8) {
        colorClass = "bg-red-600";
        statusText = "Critical";
    } else if (score >= 5) {
        colorClass = "bg-yellow-500";
        statusText = "Warning";
    }

    return (
        <div className="w-full space-y-1">
            {showLabel && (
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Fatigue Load</span>
                    <span className={cn("font-bold",
                        score >= 8 ? "text-red-600" :
                            score >= 5 ? "text-yellow-600" : "text-green-600"
                    )}>
                        {score.toFixed(1)} ({statusText})
                    </span>
                </div>
            )}
            {/* Customizing Progress color via class override/style not always easy in shadcn, 
          so we wrap it or use inline styles for the indicator if needed. 
          For standard tailwind, we rely on the parent text color or custom indicator classes. */}
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all", colorClass)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}