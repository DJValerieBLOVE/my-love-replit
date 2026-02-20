import { Flame } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type StreakDay = { date: string; dayOfWeek: number; completion: number };

const generateYearStreakData = () => {
  const weeks: StreakDay[][] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  const startDayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDayOfWeek);

  let currentWeek: StreakDay[] = [];

  for (let i = 0; i <= 371; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    if (date > today) break;

    const dayOfWeek = date.getDay();
    const completion = Math.random() > 0.35 ? (Math.random() > 0.5 ? 3 : Math.random() > 0.5 ? 1 : 2) : 0;

    currentWeek.push({ date: date.toISOString().split('T')[0], dayOfWeek, completion });

    if (dayOfWeek === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) weeks.push(currentWeek);
  return weeks;
};

const YEAR_STREAK_DATA = generateYearStreakData();

export function StreakGrid({ currentStreak = 7, longestStreak = 30 }: { currentStreak?: number; longestStreak?: number }) {
  const totalDays = YEAR_STREAK_DATA.flat().filter(d => d.completion === 3).length;

  const getMonthLabels = () => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    YEAR_STREAK_DATA.forEach((week, weekIndex) => {
      if (week.length > 0) {
        const date = new Date(week[0].date);
        const month = date.getMonth();
        if (month !== lastMonth) {
          labels.push({ month: date.toLocaleDateString('en-US', { month: 'short' }), weekIndex });
          lastMonth = month;
        }
      }
    });
    return labels;
  };

  const monthLabels = getMonthLabels();

  return (
    <div className="space-y-3" data-testid="streak-grid">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-lg font-normal" data-testid="text-current-streak">{currentStreak}</span>
          <span className="text-sm text-muted-foreground">day streak</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 rounded-[2px] bg-gray-200" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-200" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-400" />
            <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-600" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex text-[10px] text-muted-foreground mb-1 ml-6">
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="absolute"
                style={{ marginLeft: `${label.weekIndex * 11 + 24}px` }}
              >
                {label.month}
              </div>
            ))}
          </div>
          <div className="h-3" />

          <div className="flex gap-[2px]">
            <div className="flex flex-col gap-[2px] text-[9px] text-muted-foreground pr-1">
              <div className="h-[9px]"></div>
              <div className="h-[9px] leading-[9px]">M</div>
              <div className="h-[9px]"></div>
              <div className="h-[9px] leading-[9px]">W</div>
              <div className="h-[9px]"></div>
              <div className="h-[9px] leading-[9px]">F</div>
              <div className="h-[9px]"></div>
            </div>

            {YEAR_STREAK_DATA.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[2px]">
                {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                  const day = week.find(d => d.dayOfWeek === dayOfWeek);
                  if (!day) return <div key={dayOfWeek} className="w-[9px] h-[9px]" />;

                  const bgColor = day.completion === 0
                    ? "bg-gray-100"
                    : day.completion === 3
                      ? "bg-purple-600"
                      : day.completion === 2
                        ? "bg-purple-400"
                        : "bg-purple-200";

                  return (
                    <Tooltip key={dayOfWeek}>
                      <TooltipTrigger asChild>
                        <div className={`w-[9px] h-[9px] rounded-[2px] ${bgColor} cursor-pointer hover:ring-1 hover:ring-purple-400`} />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-normal">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        <p className="text-muted-foreground">
                          {day.completion === 0 && "No check-in"}
                          {day.completion === 1 && "Morning only ☀️"}
                          {day.completion === 2 && "Evening only 🌙"}
                          {day.completion === 3 && "Complete day ✨"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs pt-1 border-t">
        <div>
          <span className="text-muted-foreground">Year of practice: </span>
          <span className="font-normal">{totalDays} complete days</span>
        </div>
        <div>
          <span className="text-muted-foreground">Longest streak: </span>
          <span className="font-normal">{longestStreak} days</span>
        </div>
        <div>
          <span className="text-muted-foreground">Current streak: </span>
          <span className="font-normal">{currentStreak} days</span>
        </div>
      </div>
    </div>
  );
}
