import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useHackerStore } from '../store/useHackerStore';
import { getDateKey } from '../utils/constants';
import { Flame } from 'lucide-react';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function StreakHeatmap() {
  const activityLog = useHackerStore((s) => s.activityLog);
  const currentStreak = useHackerStore((s) => s.currentStreak);
  const longestStreak = useHackerStore((s) => s.longestStreak);

  const { cells, monthMarkers } = useMemo(() => {
    const today = new Date();
    const result = [];
    const markers: { weekIndex: number; label: string }[] = [];
    let lastMonth = -1;

    for (let i = 83; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = getDateKey(date);
      const dayOfWeek = date.getDay();
      const weekIndex = Math.floor((83 - i) / 7);

      // Month marker for first day of month
      if (date.getDate() <= 7 && date.getMonth() !== lastMonth) {
        lastMonth = date.getMonth();
        markers.push({ weekIndex, label: MONTH_LABELS[date.getMonth()] });
      }

      result.push({
        date: key,
        count: activityLog[key] || 0,
        dayOfWeek,
        weekIndex,
        isToday: i === 0,
      });
    }

    return { cells: result, monthMarkers: markers };
  }, [activityLog]);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-border';
    if (count === 1) return 'bg-primary/30';
    if (count === 2) return 'bg-primary/50';
    if (count === 3) return 'bg-primary/70';
    return 'bg-primary';
  };

  const todayKey = getDateKey();
  const hasToday = (activityLog[todayKey] || 0) > 0;

  // Group by week for rendering
  const totalWeeks = Math.ceil(cells.length / 7);

  return (
    <div className="border border-border bg-panel/80 backdrop-blur-sm">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="text-[10px] text-secondary tracking-widest flex items-center gap-1.5">
          <Flame size={10} className={hasToday ? 'text-warn' : 'text-text-dim'} />
          INTRUSION LOG // ACTIVITY HEATMAP
        </span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-warn flex items-center gap-1">
            <Flame size={10} />
            STREAK: {currentStreak}
          </span>
          <span className="text-text-dim">BEST: {longestStreak}</span>
        </div>
      </div>

      <div className="p-4 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Month labels */}
          <div className="flex gap-1 mb-1 pl-8">
            {Array.from({ length: totalWeeks }, (_, wi) => {
              const marker = monthMarkers.find((m) => m.weekIndex === wi);
              return (
                <div key={wi} className="flex-1 text-[8px] text-text-dim">
                  {marker ? marker.label : ''}
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            {/* Day labels */}
            <div className="flex flex-col gap-1">
              {DAY_LABELS.map((label) => (
                <div key={label} className="h-3 flex items-center text-[8px] text-text-dim w-6">
                  {label}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div
              className="grid gap-1"
              style={{
                gridTemplateRows: 'repeat(7, 1fr)',
                gridAutoFlow: 'column',
                gridAutoColumns: '1fr',
              }}
            >
              {cells.map((cell, i) => (
                <motion.div
                  key={cell.date}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.003 }}
                  title={`${cell.date} (${DAY_LABELS[cell.dayOfWeek]}) — ${cell.count} breached`}
                  className={`w-3 h-3 rounded-sm ${getIntensity(cell.count)} border ${
                    cell.isToday ? 'border-warn' : 'border-transparent'
                  } hover:border-primary transition-all`}
                />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-2 text-[9px] text-text-dim">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-border" />
              <div className="w-3 h-3 rounded-sm bg-primary/30" />
              <div className="w-3 h-3 rounded-sm bg-primary/50" />
              <div className="w-3 h-3 rounded-sm bg-primary/70" />
              <div className="w-3 h-3 rounded-sm bg-primary" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
