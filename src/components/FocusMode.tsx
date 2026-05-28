import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHackerStore } from '../store/useHackerStore';
import { DIFFICULTY_CONFIG } from '../utils/constants';
import { X, Play, Pause, RotateCcw, Zap, Clock } from 'lucide-react';

interface Props {
  missionId: string | null;
  onClose: () => void;
}

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds

export default function FocusMode({ missionId, onClose }: Props) {
  const mission = useHackerStore((s) => s.missions.find((m) => m.id === missionId));
  const addFocusSession = useHackerStore((s) => s.addFocusSession);
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const start = () => {
    if (isComplete) {
      setTimeLeft(FOCUS_DURATION);
      setIsComplete(false);
    }
    setIsRunning(true);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          setIsComplete(true);
          addFocusSession(25);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pause = () => {
    setIsRunning(false);
    clearTimer();
  };

  const reset = () => {
    pause();
    setTimeLeft(FOCUS_DURATION);
    setIsComplete(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  reset; // exposed for future use

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((FOCUS_DURATION - timeLeft) / FOCUS_DURATION) * 100;

  if (!mission) return null;
  const config = DIFFICULTY_CONFIG[mission.difficulty];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-lg bg-terminal border border-border relative overflow-hidden"
        >
          {/* Animated border glow */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${config.color}40, transparent 70%)`,
            }}
          />

          {/* Header */}
          <div className="relative px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-[10px] text-secondary tracking-widest flex items-center gap-1.5">
              <Clock size={10} />
              FOCUS BREACH // DEEP DIVE MODE
            </span>
            <button onClick={onClose} className="text-text-dim hover:text-alert transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Mission info */}
          <div className="relative px-4 py-3 border-b border-border bg-dark/30">
            <div className="flex items-center gap-2 text-[10px] text-text-dim">
              <span style={{ color: config.color }}>{mission.serverName}</span>
              <span>({mission.ipAddress})</span>
              <span
                className="px-1 border text-[9px] font-bold"
                style={{ borderColor: config.color, color: config.color }}
              >
                {config.label}
              </span>
            </div>
            <p className="text-sm text-white mt-1">{mission.title}</p>
          </div>

          {/* Timer display */}
          <div className="relative p-8 text-center">
            <motion.div
              className="text-7xl sm:text-8xl font-black tracking-wider tabular-nums"
              style={{
                color: isComplete ? '#00ff41' : config.color,
                textShadow: `0 0 30px ${isComplete ? '#00ff41' : config.color}60`,
              }}
            >
              {formatTime(timeLeft)}
            </motion.div>

            {/* Circular progress */}
            <div className="mt-6 flex justify-center">
              <div className="w-64 h-2 bg-dark rounded-full overflow-hidden border border-border">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: isComplete ? '#00ff41' : config.color }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <div className="flex items-center justify-center gap-2 text-warn text-sm font-bold">
                  <Zap size={16} />
                  FOCUS SESSION COMPLETE
                </div>
                <p className="text-[10px] text-text-dim mt-1">+5 REP BONUS FOR DEEP FOCUS</p>
              </motion.div>
            )}
          </div>

          {/* Controls */}
          <div className="relative px-4 py-4 border-t border-border flex items-center justify-center gap-3">
            {!isRunning && !isComplete && (
              <button
                onClick={start}
                className="px-6 py-2 bg-primary/10 border border-primary text-primary text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-2"
              >
                <Play size={14} />
                INITIATE BREACH
              </button>
            )}
            {isRunning && (
              <button
                onClick={pause}
                className="px-6 py-2 bg-warn/10 border border-warn text-warn text-xs font-bold hover:bg-warn/20 transition-all flex items-center gap-2"
              >
                <Pause size={14} />
                PAUSE
              </button>
            )}
            {!isRunning && timeLeft < FOCUS_DURATION && (
              <button
                onClick={isComplete ? start : start}
                className="px-4 py-2 border border-border text-text-dim text-xs hover:border-secondary hover:text-secondary transition-all flex items-center gap-2"
              >
                <RotateCcw size={12} />
                {isComplete ? 'RESTART' : 'RESUME'}
              </button>
            )}
            {isComplete && (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-primary/10 border border-primary text-primary text-xs font-bold hover:bg-primary/20 transition-all"
              >
                CLOSE [ESC]
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
