import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakWidgetProps {
  streak: number;
  data: { day: string; active: boolean }[];
  className?: string;
}

export function StreakWidget({ streak, data, className }: StreakWidgetProps) {
  return (
    <Card className={cn("overflow-hidden border border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-card", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-full">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground leading-none">Daily Streak</h3>
              <p className="text-xs text-muted-foreground mt-1">Keep the fire burning!</p>
            </div>
          </div>
          <div className="text-2xl font-black text-orange-500 font-serif">{streak}</div>
        </div>

        <div className="flex justify-between items-center">
          {data.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                day.active 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                  : "bg-muted text-muted-foreground"
              )}>
                {day.active ? "✓" : ""}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{day.day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
