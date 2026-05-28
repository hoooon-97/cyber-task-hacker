import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Star, Shield, ChevronRight } from 'lucide-react';
import { getLevelTitle } from '../utils/constants';
import { SoundEngine } from '../utils/SoundEngine';

interface Props {
  oldLevel: number;
  newLevel: number;
  reputation: number;
  onClose: () => void;
}

export default function LevelUpEffect({ oldLevel, newLevel, reputation, onClose }: Props) {
  const [phase, setPhase] = useState(0);
  const newTitle = getLevelTitle(reputation);

  useEffect(() => {
    SoundEngine.playLevelUp();
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        onClick={onClose}
      >
        {/* Background flash layers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0.3, 0.6, 0.2] }}
          transition={{ duration: 1.5, times: [0, 0.2, 0.4, 0.7, 1] }}
          className="absolute inset-0 bg-alert/20"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute inset-0 bg-matrix/20"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute inset-0 bg-cyber/20"
        />

        {/* Scan lines */}
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-4" onClick={(e) => e.stopPropagation()}>
          {/* Phase 0: Warning */}
          {phase >= 0 && (
            <motion.div
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mb-4"
            >
              <Shield size={48} className="text-warn mx-auto animate-pulse" />
            </motion.div>
          )}

          {/* Phase 1: LEVEL UP text */}
          {phase >= 1 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateX: -90 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <h1
                className="text-5xl sm:text-7xl font-black tracking-tighter mb-2"
                style={{
                  color: '#ff0040',
                  textShadow: '0 0 20px #ff0040, 0 0 40px #ff0040, 0 0 80px #ff0040, 4px 0 0 #00f0ff, -4px 0 0 #00ff41',
                }}
              >
                LEVEL UP
              </h1>
            </motion.div>
          )}

          {/* Phase 2: Level numbers */}
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-4 my-6"
            >
              <div className="text-center">
                <div className="text-[10px] text-text-dim mb-1">BEFORE</div>
                <div className="text-3xl font-bold text-text-dim line-through">{oldLevel}</div>
              </div>
              <ChevronRight size={24} className="text-warn animate-pulse" />
              <div className="text-center">
                <div className="text-[10px] text-matrix mb-1">NOW</div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10, delay: 0.2 }}
                  className="text-5xl font-black text-matrix"
                  style={{ textShadow: '0 0 20px #00ff41, 0 0 40px #00ff41' }}
                >
                  {newLevel}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Phase 3: New title */}
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-center gap-2">
                <Star size={16} className="text-warn" />
                <span className="text-lg font-bold text-cyber" style={{ textShadow: '0 0 10px #00f0ff' }}>
                  {newTitle}
                </span>
                <Star size={16} className="text-warn" />
              </div>
              <p className="text-[10px] text-text-dim">
                NEW HACKER TITLE UNLOCKED
              </p>

              {/* Stats */}
              <div className="flex items-center justify-center gap-6 mt-4 py-3 border-t border-border">
                <div className="text-center">
                  <Zap size={16} className="text-warn mx-auto mb-1" />
                  <div className="text-xs font-bold text-warn">{reputation}</div>
                  <div className="text-[9px] text-text-dim">TOTAL REP</div>
                </div>
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onClose}
                className="mt-4 px-6 py-2 border border-matrix text-matrix text-xs font-bold hover:bg-matrix/20 transition-all"
              >
                CONTINUE [ENTER / ESC / CLICK]
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-alert" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-alert" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-alert" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-alert" />
      </motion.div>
    </AnimatePresence>
  );
}
