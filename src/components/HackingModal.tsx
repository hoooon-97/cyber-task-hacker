import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Mission, HackingLog } from '../types';
import { DIFFICULTY_CONFIG, HACKING_CODE_SNIPPETS, HACKING_LOGS } from '../utils/constants';
import { useHackerStore } from '../store/useHackerStore';
import { SoundEngine } from '../utils/SoundEngine';
import { X, CheckCircle2 } from 'lucide-react';

interface Props {
  mission: Mission | null;
  onClose: () => void;
}

export default function HackingModal({ mission, onClose }: Props) {
  const [logs, setLogs] = useState<HackingLog[]>([]);
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const codeEndRef = useRef<HTMLDivElement>(null);
  const timerRefs = useRef<Set<number>>(new Set());
  const startedRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollCodeToBottom = useCallback(() => {
    codeEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const clearAllTimers = useCallback(() => {
    timerRefs.current.forEach((id) => {
      clearInterval(id);
      clearTimeout(id);
    });
    timerRefs.current.clear();
  }, []);

  // Keyboard handler: Enter / ESC to close when complete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isComplete) return;
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isComplete, onClose]);

  useEffect(() => {
    if (!mission) {
      startedRef.current = false;
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;

    const config = DIFFICULTY_CONFIG[mission.difficulty];
    const totalDuration = config.timeMs;
    const logInterval = totalDuration / 20;
    const codeInterval = 150;

    setLogs([]);
    setCodeLines([]);
    setIsComplete(false);
    setProgress(0);

    const progressStep = 100 / (totalDuration / 100);
    const progressId = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressId);
          timerRefs.current.delete(progressId);
          return 100;
        }
        return Math.min(p + progressStep, 100);
      });
    }, 100);
    timerRefs.current.add(progressId);

    let logCount = 0;
    const logId = window.setInterval(() => {
      logCount++;
      const types: Array<'info' | 'warning' | 'success'> = ['info', 'info', 'info', 'warning', 'success'];
      const type = types[Math.floor(Math.random() * types.length)];
      const messages = HACKING_LOGS[type];
      const text = messages[Math.floor(Math.random() * messages.length)];

      setLogs((prev) => [
        ...prev,
        { id: `log_${logCount}_${mission.id}`, text, type },
      ]);

      if (logCount >= 18) {
        clearInterval(logId);
        timerRefs.current.delete(logId);
      }
    }, logInterval);
    timerRefs.current.add(logId);

    let codeCount = 0;
    const codeId = window.setInterval(() => {
      codeCount++;
      const snippet = HACKING_CODE_SNIPPETS[Math.floor(Math.random() * HACKING_CODE_SNIPPETS.length)];
      setCodeLines((prev) => [...prev, snippet]);

      if (codeCount >= Math.floor(totalDuration / codeInterval)) {
        clearInterval(codeId);
        timerRefs.current.delete(codeId);
      }
    }, codeInterval);
    timerRefs.current.add(codeId);

    const completeId = window.setTimeout(() => {
      setIsComplete(true);
      setLogs((prev) => [
        ...prev,
        {
          id: `final_${mission.id}`,
          text: `SUCCESS: ${mission.serverName} BREACHED | +${config.repReward} REP OBTAINED`,
          type: 'success',
        },
      ]);
      SoundEngine.playBreachSuccess();
      useHackerStore.getState().completeBreach(mission.id);
    }, totalDuration);
    timerRefs.current.add(completeId);

    return () => {
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission?.id, clearAllTimers]);

  useEffect(() => {
    scrollToBottom();
  }, [logs, scrollToBottom]);

  useEffect(() => {
    scrollCodeToBottom();
  }, [codeLines, scrollCodeToBottom]);

  if (!mission) return null;

  const config = DIFFICULTY_CONFIG[mission.difficulty];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && isComplete) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl bg-terminal border border-border shadow-2xl overflow-hidden"
          style={{ boxShadow: `0 0 40px ${config.color}30` }}
        >
          {/* Header */}
          <div
            className="px-4 py-2 border-b flex items-center justify-between"
            style={{ borderColor: config.color }}
          >
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-bold"
                style={{ color: config.color }}
              >
                {isComplete ? 'BREACH COMPLETE' : 'BREACH IN PROGRESS'}
              </span>
              <span className="text-[10px] text-text-dim">
                TARGET: {mission.serverName} ({mission.ipAddress})
              </span>
            </div>
            {isComplete && (
              <button
                onClick={onClose}
                className="text-text-dim hover:text-matrix transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-dark">
            <motion.div
              className="h-full"
              style={{ backgroundColor: isComplete ? '#00ff41' : config.color }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Content */}
          <div className="flex flex-col sm:flex-row" style={{ height: '400px' }}>
            {/* Logs panel */}
            <div className="flex-1 border-r border-border p-3 overflow-hidden flex flex-col">
              <div className="text-[10px] text-cyber mb-2 tracking-widest">SYSTEM LOGS</div>
              <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1">
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${
                      log.type === 'success'
                        ? 'text-matrix'
                        : log.type === 'warning'
                        ? 'text-warn'
                        : log.type === 'error'
                        ? 'text-alert'
                        : 'text-text-dim'
                    }`}
                  >
                    <span className="text-text-dim/50">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>{' '}
                    {log.text}
                  </motion.div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>

            {/* Code panel */}
            <div className="flex-1 p-3 overflow-hidden flex flex-col bg-dark/50">
              <div className="text-[10px] text-neon mb-2 tracking-widest">PAYLOAD STREAM</div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-0.5 text-text-dim/70">
                {codeLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="whitespace-pre"
                  >
                    {line}
                  </motion.div>
                ))}
                <div ref={codeEndRef} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border bg-dark/30 flex items-center justify-between">
            <div className="text-[10px] text-text-dim">
              DIFFICULTY: <span style={{ color: config.color }}>{config.label}</span> |
              REWARD: <span className="text-warn">+{config.repReward} REP</span>
            </div>
            {isComplete ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 text-matrix"
              >
                <CheckCircle2 size={14} />
                <span className="text-xs font-bold">BREACH SUCCESSFUL</span>
                <span className="text-[9px] text-text-dim">(Press ENTER or ESC)</span>
              </motion.div>
            ) : (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-warn animate-pulse" />
                <span className="text-[10px] text-warn">EXECUTING...</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
