import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHackerStore } from '../store/useHackerStore';
import { useAuth } from '../hooks/useAuth';
import type { MissionStatus } from '../types';
import MissionItem from './MissionItem';
import HackingModal from './HackingModal';
import FocusMode from './FocusMode';
import { Filter, Server, Play, CheckCircle2, Lock, Trash2 } from 'lucide-react';

type FilterType = 'ALL' | MissionStatus;

export default function MissionList() {
  const missions = useHackerStore((s) => s.missions);
  const startMission = useHackerStore((s) => s.startMission);
  const deleteMission = useHackerStore((s) => s.deleteMission);
  const clearBreachedMissions = useHackerStore((s) => s.clearBreachedMissions);
  const { user } = useAuth();

  const handleDelete = (id: string) => deleteMission(id, user?.id);
  const handleClearBreached = () => clearBreachedMissions(user?.id);

  const [filter, setFilter] = useState<FilterType>('ALL');
  const [activeMission, setActiveMission] = useState<string | null>(null);
  const [focusMission, setFocusMission] = useState<string | null>(null);

  const filteredMissions = missions.filter((m) => {
    if (filter === 'ALL') return true;
    return m.status === filter;
  });

  const counts = {
    ALL: missions.length,
    PENDING: missions.filter((m) => m.status === 'PENDING').length,
    IN_PROGRESS: missions.filter((m) => m.status === 'IN_PROGRESS').length,
    BREACHED: missions.filter((m) => m.status === 'BREACHED').length,
  };

  const handleStart = (id: string) => {
    startMission(id);
  };

  const handleBreach = (id: string) => {
    setActiveMission(id);
  };

  const handleCloseModal = () => {
    setActiveMission(null);
  };

  const handleCloseFocus = () => {
    setFocusMission(null);
  };

  const activeMissionData = missions.find((m) => m.id === activeMission) || null;
  const focusMissionData = missions.find((m) => m.id === focusMission) || null;

  const filterButtons: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: 'ALL', label: 'ALL', icon: <Server size={10} /> },
    { key: 'PENDING', label: 'PENDING', icon: <Lock size={10} /> },
    { key: 'IN_PROGRESS', label: 'ACTIVE', icon: <Play size={10} /> },
    { key: 'BREACHED', label: 'BREACHED', icon: <CheckCircle2 size={10} /> },
  ];

  return (
    <div className="relative z-10">
      {/* Filter bar */}
      <div className="border border-border bg-panel/80 backdrop-blur-sm mb-3">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-[10px] text-cyber tracking-widest flex items-center gap-1.5">
            <Filter size={10} />
            TARGET LIST // {counts.ALL} SYSTEMS DETECTED
          </span>
        </div>
        <div className="px-4 py-2 flex items-center gap-2 flex-wrap">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-2.5 py-1 text-[10px] border transition-all duration-200 flex items-center gap-1 ${
                filter === btn.key
                  ? 'border-matrix text-matrix bg-matrix/10'
                  : 'border-border text-text-dim hover:border-text-dim'
              }`}
            >
              {btn.icon}
              {btn.label}
              <span
                className={`ml-0.5 px-1 rounded-sm text-[9px] ${
                  filter === btn.key ? 'bg-matrix/20 text-matrix' : 'bg-border text-text-dim'
                }`}
              >
                {counts[btn.key]}
              </span>
            </button>
          ))}
          {counts.BREACHED > 0 && (
            <button
              onClick={handleClearBreached}
              className="px-2.5 py-1 text-[10px] border border-alert/50 text-alert hover:bg-alert/10 transition-all flex items-center gap-1 ml-auto"
            >
              <Trash2 size={10} />
              CLEAR ARCHIVE ({counts.BREACHED})
            </button>
          )}
        </div>
      </div>

      {/* Mission list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredMissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-border bg-panel/50 p-8 text-center"
            >
              <div className="text-text-dim text-sm mb-2">NO TARGETS DETECTED</div>
              <div className="text-[10px] text-text-dim/50">
                {filter === 'ALL'
                  ? 'Deploy a new mission to begin the breach protocol.'
                  : `No missions with status: ${filter}`}
              </div>
            </motion.div>
          ) : (
            filteredMissions.map((mission, index) => (
              <MissionItem
                key={mission.id}
                mission={mission}
                index={index}
                onStart={handleStart}
                onBreach={handleBreach}
                onDelete={handleDelete}
                onFocus={(id) => setFocusMission(id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      <HackingModal mission={activeMissionData} onClose={handleCloseModal} />
      <FocusMode missionId={focusMissionData?.id || null} onClose={handleCloseFocus} />
    </div>
  );
}
