import { useState } from 'react';
import type { Difficulty } from '../types';
import { DIFFICULTY_CONFIG } from '../utils/constants';
import { useHackerStore } from '../store/useHackerStore';
import { SoundEngine } from '../utils/SoundEngine';
import { Plus, AlertTriangle, Clock } from 'lucide-react';

export default function MissionInput() {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [showHelp, setShowHelp] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineHours, setDeadlineHours] = useState(24);
  const addMission = useHackerStore((s) => s.addMission);
  const soundEnabled = useHackerStore((s) => s.profile.soundEnabled);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const deadline = hasDeadline ? Date.now() + deadlineHours * 60 * 60 * 1000 : undefined;
    addMission(title.trim(), difficulty, deadline);
    setTitle('');
    if (soundEnabled) SoundEngine.playClick();
  };

  return (
    <div className="relative z-10 border border-border bg-panel/80 backdrop-blur-sm">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="text-[10px] text-secondary tracking-widest">NEW TARGET // REGISTER MISSION</span>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-text-dim hover:text-warn transition-colors"
        >
          <AlertTriangle size={12} />
        </button>
      </div>

      {showHelp && (
        <div className="px-4 py-2 border-b border-border bg-dark/50 text-[10px] text-text-dim">
          <p className="text-warn mb-1">&gt; PROTOCOL_GUIDE:</p>
          <p>Enter target description. Select threat level. Set deadline to activate countdown protocol.</p>
          <p className="mt-1">
            <span className="text-primary">EASY</span>: +10 REP |
            <span className="text-secondary"> MEDIUM</span>: +25 REP |
            <span className="text-warn"> HARD</span>: +60 REP |
            <span className="text-alert"> CRITICAL</span>: +150 REP
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-xs">&gt;</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter target system description..."
                maxLength={120}
                className="w-full bg-dark border border-border text-primary text-sm pl-7 pr-3 py-2.5 rounded-sm outline-none placeholder:text-text-dim/50 focus:border-primary focus:shadow-[0_0_8px_rgba(0,255,65,0.3)] transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((diff) => {
                const config = DIFFICULTY_CONFIG[diff];
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`px-3 py-2 text-[10px] font-bold border transition-all duration-200 ${
                      difficulty === diff
                        ? 'text-white'
                        : 'text-text-dim border-border hover:border-text-dim'
                    }`}
                    style={
                      difficulty === diff
                        ? {
                            borderColor: config.color,
                            backgroundColor: config.bgColor,
                            color: config.color,
                            boxShadow: `0 0 8px ${config.color}40`,
                          }
                        : {}
                    }
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHasDeadline(!hasDeadline)}
                className={`flex items-center gap-1 px-3 py-2 text-[10px] border transition-all ${
                  hasDeadline
                    ? 'border-warn text-warn bg-warn/10'
                    : 'border-border text-text-dim hover:border-text-dim'
                }`}
              >
                <Clock size={10} />
                DEADLINE
              </button>
              {hasDeadline && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={deadlineHours}
                    onChange={(e) => setDeadlineHours(Math.max(1, Math.min(168, parseInt(e.target.value) || 1)))}
                    className="w-14 bg-dark border border-border text-white text-xs px-2 py-1.5 text-center outline-none focus:border-warn"
                  />
                  <span className="text-[10px] text-text-dim">HOURS</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2.5 bg-primary/10 border border-primary text-primary text-xs font-bold hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 ml-auto"
            >
              <Plus size={14} />
              DEPLOY
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
