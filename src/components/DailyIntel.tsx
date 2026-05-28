import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHackerStore } from '../store/useHackerStore';
import { DIFFICULTY_CONFIG, getDailyBonus, getDateKey } from '../utils/constants';
import { generateAIIntel } from '../lib/supabase';
import { Radio, CheckCircle2, Zap, Plus, Trophy, Star, BrainCircuit } from 'lucide-react';

export default function DailyIntel() {
  const dailyMissions = useHackerStore((s) => s.dailyMissions);
  const lastDailyDate = useHackerStore((s) => s.lastDailyDate);
  const generateDailyMissions = useHackerStore((s) => s.generateDailyMissions);
  const addMission = useHackerStore((s) => s.addMission);
  const completeDailyMission = useHackerStore((s) => s.completeDailyMission);
  const openaiKey = useHackerStore((s) => s.profile.openaiKey);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showSuccessEffect, setShowSuccessEffect] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const todayKey = getDateKey();
    if (lastDailyDate !== todayKey) {
      if (openaiKey) {
        generateAI(openaiKey);
      } else {
        generateDailyMissions();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastDailyDate, generateDailyMissions, openaiKey]);

  const generateAI = async (key: string) => {
    setIsGenerating(true);
    try {
      const missions = await generateAIIntel(key);
      missions.forEach((m) => {
        useHackerStore.getState().addMission(`[DAILY INTEL] ${m.title}`, m.difficulty);
      });
      // Mark them as daily missions
      const dm = missions.map((m) => ({
        id: crypto.randomUUID(),
        title: `[DAILY INTEL] ${m.title}`,
        difficulty: m.difficulty,
        completed: false,
        serverName: 'AI-GEN',
        ipAddress: '127.0.0.1',
      }));
      useHackerStore.setState({ dailyMissions: dm, lastDailyDate: getDateKey() });
    } catch {
      // Fallback to templates
      generateDailyMissions();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = (index: number) => {
    const dm = dailyMissions[index];
    if (!dm || dm.completed) return;
    addMission(dm.title, dm.difficulty);
    completeDailyMission(index);
  };

  const completedCount = dailyMissions.filter((d) => d.completed).length;
  const allCompleted = completedCount === dailyMissions.length && dailyMissions.length > 0;
  const totalBonus = dailyMissions.reduce((sum, dm) => sum + (dm.completed ? getDailyBonus(dm.difficulty) : 0), 0);

  // Auto-collapse + success effect when all completed
  useEffect(() => {
    if (allCompleted && !showSuccessEffect) {
      setShowSuccessEffect(true);
      const timer = setTimeout(() => {
        setShowCompleted(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCompleted]);

  const visibleMissions = dailyMissions.filter((dm) => showCompleted || !dm.completed);

  if (dailyMissions.length === 0 && !isGenerating) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 border border-border bg-panel/80 backdrop-blur-sm mb-3"
    >
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="text-[10px] text-warn tracking-widest flex items-center gap-1.5">
          <Radio size={10} className="animate-pulse" />
          DAILY INTEL // TOP SECRET
          {openaiKey && (
            <span className="flex items-center gap-1 text-[9px] text-secondary ml-2">
              <BrainCircuit size={9} />
              AI MODE
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {isGenerating && (
            <span className="text-[10px] text-secondary animate-pulse">GENERATING...</span>
          )}
          <span className="text-[10px] text-text-dim">
            {completedCount}/{dailyMissions.length} ACCEPTED
          </span>
          {allCompleted && (
            <span className="text-[9px] text-matrix font-bold">ALL COMPLETE</span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSuccessEffect && allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-primary/10 border-b border-primary text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy size={16} className="text-warn" />
              <Star size={14} className="text-warn" />
              <Trophy size={16} className="text-warn" />
            </div>
            <div className="text-sm font-bold text-primary">
              DAILY INTEL PROTOCOL COMPLETE
            </div>
            <div className="text-[10px] text-text-dim mt-1">
              ALL 3 MISSIONS ACCEPTED | +{totalBonus} BONUS REP SECURED
            </div>
            <div className="text-[9px] text-secondary mt-1 animate-pulse">
              AUTO-COLLAPSING...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-3 space-y-2">
        <AnimatePresence>
          {visibleMissions.map((dm, i) => {
            const config = DIFFICULTY_CONFIG[dm.difficulty];
            const bonus = getDailyBonus(dm.difficulty);
            return (
              <motion.div
                key={dm.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 p-2.5 border transition-all ${
                  dm.completed
                    ? 'border-primary/30 bg-primary/5 opacity-60'
                    : 'border-border bg-dark/50 hover:border-warn'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[9px] px-1.5 py-0.5 border font-bold"
                      style={{
                        borderColor: config.color,
                        color: config.color,
                        backgroundColor: config.bgColor,
                      }}
                    >
                      {config.label}
                    </span>
                    <span className="text-[9px] text-warn flex items-center gap-0.5">
                      <Zap size={8} />
                      +{bonus} BONUS REP
                    </span>
                  </div>
                  <p className={`text-xs truncate ${dm.completed ? 'line-through text-text-dim' : 'text-white'}`}>
                    {dm.title}
                  </p>
                  <p className="text-[9px] text-text-dim">
                    {dm.serverName} • {dm.ipAddress}
                  </p>
                </div>

                {dm.completed ? (
                  <div className="flex items-center gap-1 text-primary text-[10px] font-bold">
                    <CheckCircle2 size={14} />
                    ACCEPTED
                  </div>
                ) : (
                  <button
                    onClick={() => handleAccept(i)}
                    className="px-3 py-1.5 bg-warn/10 border border-warn text-warn text-[10px] font-bold hover:bg-warn/20 transition-all flex items-center gap-1 shrink-0"
                  >
                    <Plus size={10} />
                    ACCEPT
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!showCompleted && allCompleted && (
          <div className="text-center text-[10px] text-text-dim py-2">
            Completed missions hidden. Toggle to view.
          </div>
        )}
      </div>
    </motion.div>
  );
}
