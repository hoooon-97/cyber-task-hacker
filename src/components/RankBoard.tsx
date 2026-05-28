import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useHackerStore } from '../store/useHackerStore';

import { Trophy, Crown, Medal, Star, TrendingUp, BarChart3, Flame, Clock, Zap } from 'lucide-react';

export default function RankBoard() {
  const profile = useHackerStore((s) => s.profile);
  const weekRecords = useHackerStore((s) => s.weekRecords);
  const currentStreak = useHackerStore((s) => s.currentStreak);
  const longestStreak = useHackerStore((s) => s.longestStreak);
  const focusMinutesTotal = useHackerStore((s) => s.focusMinutesTotal);
  const getWeeklyLeaderboard = useHackerStore((s) => s.getWeeklyLeaderboard);

  const leaderboard = useMemo(() => getWeeklyLeaderboard(), [getWeeklyLeaderboard]);

  const sortedWeeks = useMemo(() => {
    return Object.values(weekRecords).sort((a, b) => b.weekKey.localeCompare(a.weekKey));
  }, [weekRecords]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown size={14} className="text-warn" />;
      case 2: return <Medal size={14} className="text-secondary" />;
      case 3: return <Medal size={14} className="text-accent" />;
      default: return <Star size={12} className="text-text-dim" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-warn';
      case 2: return 'text-secondary';
      case 3: return 'text-accent';
      default: return 'text-text-dim';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 space-y-4"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Zap size={18} />, label: 'TOTAL REP', value: profile.reputation, color: 'text-warn' },
          { icon: <Trophy size={18} />, label: 'COMPLETED', value: profile.missionsCompleted, color: 'text-primary' },
          { icon: <Flame size={18} />, label: 'STREAK', value: currentStreak, color: 'text-warn' },
          { icon: <Clock size={18} />, label: 'FOCUS (MIN)', value: focusMinutesTotal, color: 'text-secondary' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border border-border bg-panel/80 p-3 text-center"
          >
            <div className={`flex justify-center mb-1 ${stat.color}`}>{stat.icon}</div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-[9px] text-text-dim mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Leaderboard */}
      <div className="border border-border bg-panel/80 backdrop-blur-sm">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-secondary tracking-widest flex items-center gap-1.5">
              <BarChart3 size={10} />
              WEEKLY LEADERBOARD // PAST OPERATIONS
            </span>
            <span className="text-[10px] text-text-dim flex items-center gap-1">
              <TrendingUp size={10} className="text-primary" />
              {sortedWeeks.length} WEEKS
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[50px_1fr_100px_100px] gap-2 px-4 py-2 border-b border-border text-[10px] text-text-dim font-bold tracking-wider">
          <span>RANK</span>
          <span>PERIOD</span>
          <span className="text-right">REP</span>
          <span className="text-right">STATS</span>
        </div>

        <div className="divide-y divide-border">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.handle + index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="grid grid-cols-[50px_1fr_100px_100px] gap-2 px-4 py-2.5 items-center"
            >
              <div className={`flex items-center gap-1.5 text-xs font-bold ${getRankColor(entry.rank)}`}>
                {getRankIcon(entry.rank)}
                #{entry.rank}
              </div>
              <div>
                <span className="text-xs text-white">{entry.handle}</span>
                <div className="text-[9px] text-text-dim">{entry.title}</div>
              </div>
              <div className="text-right text-xs font-bold text-warn">
                {entry.reputation.toLocaleString()}
              </div>
              <div className="text-right text-[10px] text-secondary">
                {entry.country}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weekly History */}
      <div className="border border-border bg-panel/80 backdrop-blur-sm">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-[10px] text-secondary tracking-widest">OPERATION HISTORY</span>
        </div>
        <div className="p-4 space-y-2">
          {sortedWeeks.length === 0 ? (
            <div className="text-center text-text-dim text-sm py-4">
              No weekly records yet. Complete missions to build your history.
            </div>
          ) : (
            sortedWeeks.slice(0, 6).map((week) => (
              <div key={week.weekKey} className="flex items-center gap-3 text-[11px]">
                <span className="text-text-dim w-24 shrink-0">{week.weekKey}</span>
                <div className="flex-1 h-4 bg-dark rounded overflow-hidden border border-border relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (week.repEarned / 500) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-primary/50"
                  />
                </div>
                <span className="text-warn w-16 text-right shrink-0">{week.repEarned} REP</span>
                <span className="text-secondary w-12 text-right shrink-0">{week.missionsCompleted} OPS</span>
                <span className="text-text-dim w-12 text-right shrink-0">{week.focusMinutes}m</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border border-border bg-panel/50 text-[9px] text-text-dim">
        <p className="mb-1 text-warn">&gt; RANKING_PROTOCOL:</p>
        <p>Weekly leaderboard tracks your past performance. Each week is scored by total REP earned.</p>
        <p className="mt-1">
          <span className="text-warn">CROWN</span>: Top week |
          <span className="text-secondary"> MEDAL</span>: Elite performance |
          <span className="text-primary"> STREAK</span>: {longestStreak} best
        </p>
      </div>
    </motion.div>
  );
}
