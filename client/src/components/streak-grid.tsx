import { Flame } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type StreakDay = { date: string; dayOfWeek: number; completion: number };

const COMPLETION_COLORS: Record<number, string> = {
  0: "#EEEEEE",
  1: "#D9C2FF",
  2: "#A366FF",
  3: "#6600FF",
};

const COMPLETION_LABELS: Record<number, string> = {
  0: "No check-in",
  1: "Morning only ☀️",
  2: "Evening only 🌙",
  3: "Complete day ✨",
};

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
  const totalWeeks = YEAR_STREAK_DATA.length;

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
          <Flame className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-lg font-normal" data-testid="text-current-streak">{currentStreak}</span>
          <span className="text-sm text-muted-foreground">day streak</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: COMPLETION_COLORS[0] }} />
            <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: COMPLETION_COLORS[1] }} />
            <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: COMPLETION_COLORS[2] }} />
            <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: COMPLETION_COLORS[3] }} />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: '100%' }}>
          <div className="relative h-4 ml-4">
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="absolute text-[10px] text-muted-foreground whitespace-nowrap"
                style={{ left: `${(label.weekIndex / totalWeeks) * 100}%` }}
              >
                {label.month}
              </div>
            ))}
          </div>

          <div
            className="w-full"
            style={{
              display: 'grid',
              gridTemplateColumns: `14px repeat(${totalWeeks}, 1fr)`,
              gridTemplateRows: 'repeat(7, 1fr)',
              gap: '2px',
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => (
              <div
                key={`label-${dayOfWeek}`}
                className="text-[9px] text-muted-foreground flex items-center justify-end pr-0.5"
                style={{ gridColumn: 1, gridRow: dayOfWeek + 1 }}
              >
                {dayOfWeek === 1 ? 'M' : dayOfWeek === 3 ? 'W' : dayOfWeek === 5 ? 'F' : ''}
              </div>
            ))}

            {YEAR_STREAK_DATA.map((week, weekIndex) =>
              [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                const day = week.find(d => d.dayOfWeek === dayOfWeek);
                const gridStyle = {
                  gridColumn: weekIndex + 2,
                  gridRow: dayOfWeek + 1,
                };

                if (!day) {
                  return <div key={`${weekIndex}-${dayOfWeek}`} style={gridStyle} />;
                }

                return (
                  <Tooltip key={`${weekIndex}-${dayOfWeek}`}>
                    <TooltipTrigger asChild>
                      <div
                        className="w-full rounded-[2px] cursor-pointer hover:ring-1 hover:ring-gray-400"
                        style={{
                          ...gridStyle,
                          aspectRatio: '1',
                          backgroundColor: COMPLETION_COLORS[day.completion] || COMPLETION_COLORS[0],
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-normal">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      <p className="text-muted-foreground">
                        {COMPLETION_LABELS[day.completion] || "No check-in"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })
            )}
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
