import { useEffect, useState } from 'react';
import { useHackerStore } from '../store/useHackerStore';
import { calculateLevel, getLevelTitle } from '../utils/constants';
import { formatTime, getTodayDate } from '../utils/helpers';
import { Terminal, Shield, Zap, Trophy, User } from 'lucide-react';

export default function TerminalHeader() {
  const { profile, activeView, setActiveView, missions } = useHackerStore();
  const [currentTime, setCurrentTime] = useState(formatTime(Date.now()));
  const [isEditing, setIsEditing] = useState(false);
  const [editHandle, setEditHandle] = useState(profile.handle);

  const pendingCount = missions.filter((m) => m.status === 'PENDING').length;
  const breachedCount = missions.filter((m) => m.status === 'BREACHED').length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime(Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveHandle = () => {
    if (editHandle.trim()) {
      useHackerStore.getState().setHandle(editHandle.trim().toUpperCase());
    }
    setIsEditing(false);
  };

  const navItems = [
    { key: 'missions' as const, label: 'MISSIONS', icon: <Terminal size={12} />, badge: pendingCount > 0 ? pendingCount : null, color: 'matrix' },
    { key: 'ranking' as const, label: 'RANKING', icon: <Trophy size={12} />, badge: null, color: 'cyber' },
    { key: 'profile' as const, label: 'PROFILE', icon: <User size={12} />, badge: null, color: 'neon' },
  ];

  return (
    <header className="relative z-10 border-b border-border bg-terminal/80 backdrop-blur-sm">
      {/* Top status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 text-[10px] text-text-dim border-b border-border bg-dark">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Terminal size={10} className="text-matrix" />
            CYBER-TASK HACKER v2.0.7
          </span>
          <span className="hidden sm:inline">BUILD: 0x7A3F9E2D</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{getTodayDate()}</span>
          <span className="text-cyber">{currentTime}</span>
          <span className="flex items-center gap-1">
            <Shield size={10} className={pendingCount === 0 ? 'text-matrix' : 'text-warn'} />
            SECURE
          </span>
        </div>
      </div>

      {/* Main header */}
      <div className="px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-10 h-10 rounded border flex items-center justify-center"
                style={{
                  borderColor: profile.avatarColor,
                  backgroundColor: `${profile.avatarColor}15`,
                }}
              >
                <User size={20} style={{ color: profile.avatarColor }} />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-dark border flex items-center justify-center text-[8px] font-bold"
                style={{ borderColor: profile.avatarColor, color: profile.avatarColor }}
              >
                {profile.level}
              </div>
            </div>
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editHandle}
                    onChange={(e) => setEditHandle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveHandle();
                      if (e.key === 'Escape') setIsEditing(false);
                    }}
                    autoFocus
                    maxLength={16}
                    className="bg-dark border border-matrix text-matrix text-sm px-2 py-0.5 rounded outline-none w-32"
                  />
                  <button onClick={handleSaveHandle} className="text-[10px] text-matrix hover:underline">
                    [SAVE]
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1
                    className="text-sm font-bold text-matrix cursor-pointer hover:text-cyber transition-colors"
                    onClick={() => {
                      setEditHandle(profile.handle);
                      setIsEditing(true);
                    }}
                    title="Click to change handle"
                  >
                    {profile.handle}
                  </h1>
                  <span className="text-[10px] text-text-dim">({getLevelTitle(profile.reputation)})</span>
                </div>
              )}
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-text-dim">
                <span className="flex items-center gap-1">
                  <Zap size={10} className="text-warn" />
                  REP: <span className="text-warn">{profile.reputation}</span>
                </span>
                <span>LVL: <span className="text-cyber">{calculateLevel(profile.reputation)}</span></span>
                <span>OPS: <span className="text-matrix">{breachedCount}</span></span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeView === item.key;
              const activeColor = item.color === 'matrix' ? '#00ff41' : item.color === 'cyber' ? '#00f0ff' : '#ff00ff';
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveView(item.key)}
                  className={`px-3 py-1.5 text-xs border transition-all duration-200 ${
                    isActive
                      ? 'bg-opacity-10 terminal-text-glow'
                      : 'border-border text-text-dim hover:border-text-dim'
                  }`}
                  style={
                    isActive
                      ? {
                          borderColor: activeColor,
                          color: activeColor,
                          backgroundColor: `${activeColor}15`,
                          boxShadow: `0 0 8px ${activeColor}40`,
                        }
                      : {}
                  }
                >
                  <span className="flex items-center gap-1.5">
                    {item.icon}
                    {item.label}
                    {item.badge !== null && (
                      <span className="px-1 bg-alert/20 text-alert text-[9px] rounded">{item.badge}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
