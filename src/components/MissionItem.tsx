import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Mission } from '../types';
import { DIFFICULTY_CONFIG } from '../utils/constants';
import { formatTime } from '../utils/helpers';
import { SoundEngine } from '../utils/SoundEngine';
import { useHackerStore } from '../store/useHackerStore';
import { ShieldAlert, ShieldCheck, Trash2, Radio, Lock, Play, Clock, AlertTriangle } from 'lucide-react';

interface Props {
  mission: Mission;
  index: number;
  onStart: (id: string) => void;
  onBreach: (id: string) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getDeadlineStatus(deadline: number) {
  const now = Date.now();
  const remaining = deadline - now;
  if (remaining <= 0) return { label: 'BREACHED', color: '#ff0040', urgent: true };
  if (remaining < 30 * 60 * 1000) return { label: 'CRITICAL', color: '#ff0040', urgent: true };
  if (remaining < 60 * 60 * 1000) return { label: 'WARNING', color: '#ffaa00', urgent: true };
  return { label: 'ACTIVE', color: '#00f0ff', urgent: false };
}

export default function MissionItem({ mission, index, onStart, onBreach, onDelete, onFocus }: Props) {
  const config = DIFFICULTY_CONFIG[mission.difficulty];
  const [now, setNow] = useState(Date.now());
  const soundEnabled = useHackerStore((s) => s.profile.soundEnabled);

  useEffect(() => {
    if (!mission.deadline || mission.status === 'BREACHED') return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [mission.deadline, mission.status]);

  const getStatusIcon = () => {
    switch (mission.status) {
      case 'BREACHED':
        return <ShieldCheck size={16} className="text-primary" />;
      case 'IN_PROGRESS':
        return <Radio size={16} className="text-warn animate-pulse" />;
      default:
        return <Lock size={16} className="text-text-dim" />;
    }
  };

  const getStatusText = () => {
    switch (mission.status) {
      case 'BREACHED':
        return 'BREACHED';
      case 'IN_PROGRESS':
        return 'IN PROGRESS';
      default:
        return 'PENDING';
    }
  };

  const deadlineInfo = mission.deadline ? getDeadlineStatus(mission.deadline) : null;
  const remaining = mission.deadline ? mission.deadline - now : 0;

  const handleClick = (action: () => void) => {
    if (soundEnabled) SoundEngine.playClick();
    action();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={`relative border transition-all duration-300 ${
        mission.status === 'BREACHED'
          ? 'border-primary/30 bg-primary/5'
          : mission.status === 'IN_PROGRESS'
          ? 'border-warn/50 bg-warn/5'
          : deadlineInfo?.urgent
          ? 'border-alert/50 bg-alert/5'
          : 'border-border bg-panel hover:border-border-light'
      }`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{
          backgroundColor:
            mission.status === 'BREACHED'
              ? '#00ff41'
              : mission.status === 'IN_PROGRESS'
              ? '#ffaa00'
              : deadlineInfo?.urgent
              ? '#ff0040'
              : config.color,
          opacity: mission.status === 'PENDING' && !deadlineInfo?.urgent ? 0.5 : 1,
        }}
      />

      <div className="pl-4 pr-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] text-secondary">
                <ShieldAlert size={10} />
                {mission.serverName}
              </span>
              <span className="text-[10px] text-text-dim">{mission.ipAddress}</span>
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
              <span className="text-[9px] text-text-dim">+{config.repReward} REP</span>
              {deadlineInfo && mission.status !== 'BREACHED' && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 border font-bold flex items-center gap-1 ${deadlineInfo.urgent ? 'animate-pulse' : ''}`}
                  style={{
                    borderColor: deadlineInfo.color,
                    color: deadlineInfo.color,
                    backgroundColor: `${deadlineInfo.color}15`,
                  }}
                >
                  <Clock size={8} />
                  {deadlineInfo.label}
                </span>
              )}
            </div>

            <h3
              className={`text-sm font-medium truncate ${
                mission.status === 'BREACHED'
                  ? 'text-primary/70 line-through'
                  : mission.status === 'IN_PROGRESS'
                  ? 'text-warn'
                  : deadlineInfo?.urgent
                  ? 'text-alert'
                  : 'text-white'
              }`}
            >
              {mission.title}
            </h3>

            {/* Deadline countdown */}
            {mission.deadline && mission.status !== 'BREACHED' && (
              <div className={`mt-1.5 flex items-center gap-2 text-[10px] font-mono ${remaining <= 0 ? 'text-alert' : deadlineInfo?.urgent ? 'text-warn' : 'text-secondary'}`}>
                <AlertTriangle size={10} />
                <span className={remaining <= 0 ? 'animate-pulse' : ''}>
                  {remaining <= 0
                    ? 'SYSTEM BREACH FAILED — DEADLINE EXPIRED'
                    : `FIREWALL RESETS IN: ${formatCountdown(remaining)}`}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-text-dim">
              <span className="flex items-center gap-1">
                {getStatusIcon()}
                <span
                  className={
                    mission.status === 'BREACHED'
                      ? 'text-primary'
                      : mission.status === 'IN_PROGRESS'
                      ? 'text-warn'
                      : deadlineInfo?.urgent
                      ? 'text-alert'
                      : ''
                  }
                >
                  {getStatusText()}
                </span>
              </span>
              <span>REG: {formatTime(mission.createdAt)}</span>
              {mission.breachedAt && (
                <span className="text-primary">BRK: {formatTime(mission.breachedAt)}</span>
              )}
              {mission.deadline && mission.status !== 'BREACHED' && (
                <span className={remaining <= 0 ? 'text-alert' : 'text-secondary'}>
                  DL: {formatTime(mission.deadline)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {mission.status === 'PENDING' && (
              <button
                onClick={() => handleClick(() => onStart(mission.id))}
                className="px-3 py-1.5 bg-secondary/10 border border-secondary text-secondary text-[10px] font-bold hover:bg-secondary/20 transition-all flex items-center gap-1"
              >
                <Play size={12} />
                START
              </button>
            )}
            {mission.status === 'IN_PROGRESS' && (
              <>
                <button
                  onClick={() => handleClick(() => onFocus(mission.id))}
                  className="px-3 py-1.5 bg-secondary/10 border border-secondary text-secondary text-[10px] font-bold hover:bg-secondary/20 transition-all flex items-center gap-1"
                >
                  <Clock size={12} />
                  FOCUS
                </button>
                <button
                  onClick={() => handleClick(() => onBreach(mission.id))}
                  className="px-3 py-1.5 bg-alert/10 border border-alert text-alert text-[10px] font-bold hover:bg-alert/20 transition-all flex items-center gap-1"
                >
                  <ShieldAlert size={12} />
                  BREACH
                </button>
              </>
            )}
            {mission.status === 'BREACHED' && (
              <button
                onClick={() => handleClick(() => onDelete(mission.id))}
                className="px-2 py-1.5 border border-text-dim/30 text-text-dim hover:border-alert hover:text-alert transition-all"
              >
                <Trash2 size={12} />
              </button>
            )}
            {mission.status === 'PENDING' && (
              <button
                onClick={() => handleClick(() => onDelete(mission.id))}
                className="px-2 py-1.5 border border-text-dim/30 text-text-dim hover:border-alert hover:text-alert transition-all"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
