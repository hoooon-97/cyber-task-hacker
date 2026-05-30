import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useHackerStore } from '../store/useHackerStore';
import { useAuth } from '../hooks/useAuth';
import { getLevelTitle, calculateLevel, THEMES } from '../utils/constants';
import StreakHeatmap from './StreakHeatmap';
import { User, Edit2, Save, X, Trophy, Zap, Target, Shield, TrendingUp, Award, BarChart3, Flame, Clock, RotateCcw, AlertTriangle, BrainCircuit, Key, LogOut, CloudUpload, GitBranch, Volume2, VolumeX, Bell, BellOff } from 'lucide-react';

export default function ProfilePage() {
  const profile = useHackerStore((s) => s.profile);
  const missions = useHackerStore((s) => s.missions);
  const setHandle = useHackerStore((s) => s.setHandle);
  const setAvatarColor = useHackerStore((s) => s.setAvatarColor);
  const setTheme = useHackerStore((s) => s.setTheme);
  const setOpenaiKey = useHackerStore((s) => s.setOpenaiKey);
  const setSoundEnabled = useHackerStore((s) => s.setSoundEnabled);
  const setNotificationsEnabled = useHackerStore((s) => s.setNotificationsEnabled);
  const loadFromSupabase = useHackerStore((s) => s.loadFromSupabase);
  const saveToSupabase = useHackerStore((s) => s.saveToSupabase);
  const getStats = useHackerStore((s) => s.getStats);
  const { user, signOut, signInWithGithub } = useAuth();
  const currentStreak = useHackerStore((s) => s.currentStreak);
  const longestStreak = useHackerStore((s) => s.longestStreak);
  const focusMinutesTotal = useHackerStore((s) => s.focusMinutesTotal);

  const [isEditing, setIsEditing] = useState(false);
  const [editHandle, setEditHandle] = useState(profile.handle);
  const [openaiKeyInput, setOpenaiKeyInput] = useState(profile.openaiKey);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'loading' | 'sync_success' | 'load_success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  const stats = useMemo(() => getStats(), [getStats, missions.length]);

  const handleSave = () => {
    if (editHandle.trim()) {
      setHandle(editHandle.trim().toUpperCase());
    }
    setIsEditing(false);
  };

  const levelProgress = stats.totalRep > 0
    ? Math.min(100, (stats.totalRep / stats.nextLevelRep) * 100)
    : 0;

  const difficultyStats = [
    { label: 'EASY', count: stats.easyCount, color: '#00ff41' },
    { label: 'MEDIUM', count: stats.mediumCount, color: '#00f0ff' },
    { label: 'HARD', count: stats.hardCount, color: '#ffaa00' },
    { label: 'CRITICAL', count: stats.criticalCount, color: '#ff0040' },
  ];

  const themeNames = Object.keys(THEMES) as Array<keyof typeof THEMES>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 space-y-4"
    >
      {/* Profile Card */}
      <div className="border border-border bg-panel/80 backdrop-blur-sm">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-[10px] text-secondary tracking-widest flex items-center gap-1.5">
            <User size={10} />
            OPERATIVE PROFILE // CLASSIFIED
          </span>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-24 h-24 rounded-lg border-2 flex items-center justify-center relative"
                style={{
                  borderColor: profile.avatarColor,
                  boxShadow: `0 0 20px ${profile.avatarColor}40, inset 0 0 20px ${profile.avatarColor}20`,
                }}
              >
                <User size={40} style={{ color: profile.avatarColor }} />
              </div>
              <div
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-dark border-2 flex items-center justify-center text-xs font-bold"
                style={{ borderColor: profile.avatarColor, color: profile.avatarColor }}
              >
                {profile.level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <input
                    type="text"
                    value={editHandle}
                    onChange={(e) => setEditHandle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') { setIsEditing(false); setEditHandle(profile.handle); }
                    }}
                    autoFocus
                    maxLength={16}
                    className="bg-dark border border-primary text-primary text-lg font-bold px-3 py-1 rounded outline-none w-40"
                  />
                  <button onClick={handleSave} className="text-primary hover:text-secondary transition-colors">
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); setEditHandle(profile.handle); }}
                    className="text-text-dim hover:text-alert transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-2xl font-bold text-white">{profile.handle}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-text-dim hover:text-secondary transition-colors"
                    title="Edit handle"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                <Award size={14} className="text-warn" />
                <span className="text-sm text-secondary font-medium">{getLevelTitle(profile.reputation)}</span>
              </div>

              {/* Level progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-text-dim mb-1">
                  <span>LEVEL {profile.level}</span>
                  <span>{stats.totalRep} / {stats.nextLevelRep} REP</span>
                </div>
                <div className="h-2 bg-dark rounded-full overflow-hidden border border-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: profile.avatarColor,
                      boxShadow: `0 0 10px ${profile.avatarColor}`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Streak highlight */}
          <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-warn mb-1">
                <Flame size={14} />
                <span className="text-lg font-bold">{currentStreak}</span>
              </div>
              <div className="text-[9px] text-text-dim">CURRENT STREAK</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-secondary mb-1">
                <Trophy size={14} />
                <span className="text-lg font-bold">{longestStreak}</span>
              </div>
              <div className="text-[9px] text-text-dim">BEST STREAK</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Clock size={14} />
                <span className="text-lg font-bold">{focusMinutesTotal}</span>
              </div>
              <div className="text-[9px] text-text-dim">FOCUS MINUTES</div>
            </div>
          </div>
        </div>
      </div>

      {/* Account & Sync */}
      {user ? (
        <div className="border border-border bg-panel/80 backdrop-blur-sm">
          <div className="px-4 py-2 border-b border-border">
            <span className="text-[10px] text-secondary tracking-widest flex items-center gap-1.5">
              <GitBranch size={10} />
              ACCOUNT SYNC // {user.email || user.user_metadata?.user_name}
            </span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={async () => {
                  if (!user.id) return;
                  setSyncStatus('syncing');
                  setSyncMessage('> UPLINK ESTABLISHED... TRANSMITTING DATA...');
                  try {
                    // Manual sync: force replace missions in cloud with current local state (fixes stuck duplicates)
                    await saveToSupabase(user.id, { replaceMissions: true });
                    setSyncStatus('sync_success');
                    setSyncMessage('> SYNC COMPLETE // DATA SECURED IN CLOUD');
                  } catch (err: any) {
                    setSyncStatus('error');
                    setSyncMessage(`> SYNC FAILED // ${err.message || 'CONNECTION INTERRUPTED'}`);
                    console.error('SYNC ERROR:', err);
                  }
                  setTimeout(() => { setSyncStatus('idle'); setSyncMessage(''); }, 3000);
                }}
                disabled={syncStatus === 'syncing' || syncStatus === 'loading'}
                className="px-4 py-2 bg-secondary/10 border border-secondary text-secondary text-xs font-bold hover:bg-secondary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <CloudUpload size={14} className={syncStatus === 'syncing' ? 'animate-pulse' : ''} />
                {syncStatus === 'syncing' ? 'TRANSMITTING...' : 'SYNC TO CLOUD'}
              </button>
              <button
                onClick={async () => {
                  if (!user.id) return;
                  setSyncStatus('loading');
                  setSyncMessage('> ESTABLISHING DOWNLINK... RETRIEVING DATA...');
                  try {
                    await loadFromSupabase(user.id);
                    setSyncStatus('load_success');
                    setSyncMessage('> LOAD COMPLETE // CLOUD DATA INTEGRATED');
                  } catch (err: any) {
                    setSyncStatus('error');
                    setSyncMessage(`> LOAD FAILED // ${err.message || 'CONNECTION INTERRUPTED'}`);
                    console.error('LOAD ERROR:', err);
                  }
                  setTimeout(() => { setSyncStatus('idle'); setSyncMessage(''); }, 3000);
                }}
                disabled={syncStatus === 'syncing' || syncStatus === 'loading'}
                className="px-4 py-2 bg-primary/10 border border-primary text-primary text-xs font-bold hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <RotateCcw size={14} className={syncStatus === 'loading' ? 'animate-spin' : ''} />
                {syncStatus === 'loading' ? 'RETRIEVING...' : 'LOAD FROM CLOUD'}
              </button>
              <button
                onClick={signOut}
                disabled={syncStatus === 'syncing' || syncStatus === 'loading'}
                className="px-4 py-2 bg-alert/10 border border-alert text-alert text-xs font-bold hover:bg-alert/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <LogOut size={14} />
                SIGN OUT
              </button>
            </div>
            {syncMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-[10px] font-mono ${
                  syncStatus === 'error'
                    ? 'text-alert'
                    : syncStatus === 'sync_success' || syncStatus === 'load_success'
                    ? 'text-primary'
                    : 'text-secondary'
                }`}
              >
                {syncMessage}
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-secondary/30 bg-secondary/5 backdrop-blur-sm">
          <div className="px-4 py-2 border-b border-secondary/30">
            <span className="text-[10px] text-secondary tracking-widest flex items-center gap-1.5">
              <GitBranch size={10} />
              ACCOUNT // NOT LINKED
            </span>
          </div>
          <div className="p-4">
            <p className="text-[10px] text-text-dim mb-3">
              You are currently using a guest session. Link your GitHub account to sync data across devices and appear on global leaderboards.
            </p>
            <button
              onClick={signInWithGithub}
              className="px-4 py-2 bg-secondary/10 border border-secondary text-secondary text-xs font-bold hover:bg-secondary/20 transition-all flex items-center gap-2"
            >
              <GitBranch size={14} />
              LINK GITHUB ACCOUNT
            </button>
          </div>
        </div>
      )}

      {/* OpenAI API Key */}
      <div className="border border-border bg-panel/80 backdrop-blur-sm">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-[10px] text-secondary tracking-widest flex items-center gap-1.5">
            <BrainCircuit size={10} />
            AI INTEGRATION // OPENAI API KEY
          </span>
        </div>
        <div className="p-4">
          <p className="text-[10px] text-text-dim mb-2">
            Enter your OpenAI API key to enable AI-generated Daily Intel missions.
            Your key is stored locally and never sent to our servers.
          </p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Key size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-dim" />
              <input
                type="password"
                value={openaiKeyInput}
                onChange={(e) => setOpenaiKeyInput(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-dark border border-border text-primary text-xs pl-8 pr-3 py-2 rounded outline-none placeholder:text-text-dim/50 focus:border-secondary focus:shadow-[0_0_8px_rgba(0,240,255,0.3)] transition-all"
              />
            </div>
            <button
              onClick={() => setOpenaiKey(openaiKeyInput)}
              className="px-4 py-2 bg-secondary/10 border border-secondary text-secondary text-xs font-bold hover:bg-secondary/20 transition-all flex items-center gap-1"
            >
              <Save size={12} />
              SAVE
            </button>
          </div>
          {profile.openaiKey && (
            <p className="text-[9px] text-matrix mt-2 flex items-center gap-1">
              <BrainCircuit size={9} />
              AI MODE ACTIVE — Daily Intel will be generated by GPT
            </p>
          )}
        </div>
      </div>

      {/* Sound & Notifications */}
      <div className="border border-border bg-panel/80 backdrop-blur-sm">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-[10px] text-secondary tracking-widest flex items-center gap-1.5">
            <Volume2 size={10} />
            AUDIO & ALERTS // SYSTEM SETTINGS
          </span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {profile.soundEnabled ? <Volume2 size={14} className="text-primary" /> : <VolumeX size={14} className="text-text-dim" />}
              <span className="text-xs text-white">SOUND FX</span>
            </div>
            <button
              onClick={() => setSoundEnabled(!profile.soundEnabled)}
              className={`w-10 h-5 rounded-full border transition-all relative ${
                profile.soundEnabled ? 'bg-primary/30 border-primary' : 'bg-dark border-border'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                  profile.soundEnabled ? 'left-5 bg-primary' : 'left-0.5 bg-text-dim'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {profile.notificationsEnabled ? <Bell size={14} className="text-warn" /> : <BellOff size={14} className="text-text-dim" />}
              <span className="text-xs text-white">DEADLINE ALERTS</span>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!profile.notificationsEnabled)}
              className={`w-10 h-5 rounded-full border transition-all relative ${
                profile.notificationsEnabled ? 'bg-warn/30 border-warn' : 'bg-dark border-border'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                  profile.notificationsEnabled ? 'left-5 bg-warn' : 'left-0.5 bg-text-dim'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Theme Picker */}
      <div className="border border-border bg-panel/80 backdrop-blur-sm">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-[10px] text-secondary tracking-widest">TERMINAL THEME</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {themeNames.map((themeKey) => {
              const theme = THEMES[themeKey];
              const isActive = profile.theme === themeKey;
              return (
                <button
                  key={themeKey}
                  onClick={() => setTheme(themeKey)}
                  className={`relative p-3 border text-left transition-all ${
                    isActive ? 'border-primary' : 'border-border hover:border-border-light'
                  }`}
                  style={isActive ? { boxShadow: `0 0 12px ${theme.primary}40` } : {}}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
                    />
                    <span className="text-xs font-bold" style={{ color: theme.primary }}>
                      {theme.name}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.secondary }} />
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.warn }} />
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.alert }} />
                  </div>
                  {isActive && (
                    <div className="absolute top-1 right-1 text-[8px] text-primary font-bold">ACTIVE</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Avatar Color picker */}
      <div className="border border-border bg-panel/80 backdrop-blur-sm">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-[10px] text-secondary tracking-widest">AVATAR ACCENT COLOR</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            {['#00ff41', '#00f0ff', '#ff00ff', '#ff0040', '#ffaa00', '#ffffff', '#aa3bff', '#00ffaa'].map((color) => (
              <button
                key={color}
                onClick={() => setAvatarColor(color)}
                className={`w-8 h-8 rounded border-2 transition-all ${
                  profile.avatarColor === color ? 'scale-110' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: color,
                  borderColor: profile.avatarColor === color ? '#fff' : 'transparent',
                  boxShadow: profile.avatarColor === color ? `0 0 10px ${color}` : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Target size={18} />, label: 'TOTAL MISSIONS', value: stats.totalMissions, color: 'text-secondary' },
          { icon: <Shield size={18} />, label: 'COMPLETED', value: stats.completedMissions, color: 'text-primary' },
          { icon: <Zap size={18} />, label: 'TOTAL REP', value: stats.totalRep, color: 'text-warn' },
          { icon: <TrendingUp size={18} />, label: 'LEVEL', value: calculateLevel(profile.reputation), color: 'text-accent' },
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

      {/* Streak Heatmap */}
      <StreakHeatmap />

      {/* Difficulty breakdown */}
      <div className="border border-border bg-panel/80 backdrop-blur-sm">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-[10px] text-secondary tracking-widest flex items-center gap-1.5">
            <BarChart3 size={10} />
            DIFFICULTY BREAKDOWN
          </span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {difficultyStats.map((d) => (
              <div key={d.label} className="text-center p-2 border border-border bg-dark/30">
                <div className="text-[10px] font-bold mb-1" style={{ color: d.color }}>{d.label}</div>
                <div className="text-2xl font-bold text-white">{d.count}</div>
                <div className="text-[9px] text-text-dim">BREACHED</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission status summary */}
      <div className="border border-border bg-panel/80 backdrop-blur-sm">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-[10px] text-secondary tracking-widest flex items-center gap-1.5">
            <Trophy size={10} />
            MISSION STATUS
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-[10px] text-text-dim mb-1">
                <span>PENDING</span>
                <span>{stats.pendingMissions}</span>
              </div>
              <div className="h-1.5 bg-dark rounded overflow-hidden">
                <div
                  className="h-full bg-text-dim/50"
                  style={{ width: `${stats.totalMissions > 0 ? (stats.pendingMissions / stats.totalMissions) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-[10px] text-warn mb-1">
                <span>IN PROGRESS</span>
                <span>{stats.inProgressMissions}</span>
              </div>
              <div className="h-1.5 bg-dark rounded overflow-hidden">
                <div
                  className="h-full bg-warn"
                  style={{ width: `${stats.totalMissions > 0 ? (stats.inProgressMissions / stats.totalMissions) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-[10px] text-primary mb-1">
                <span>BREACHED</span>
                <span>{stats.completedMissions}</span>
              </div>
              <div className="h-1.5 bg-dark rounded overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${stats.totalMissions > 0 ? (stats.completedMissions / stats.totalMissions) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Reset */}
      <div className="border border-alert/50 bg-alert/5 backdrop-blur-sm">
        <div className="px-4 py-2 border-b border-alert/30">
          <span className="text-[10px] text-alert tracking-widest flex items-center gap-1.5">
            <AlertTriangle size={10} />
            SYSTEM CONTROL // DANGER ZONE
          </span>
        </div>
        <div className="p-4">
          <p className="text-[10px] text-text-dim mb-3">
            WARNING: This will erase all local data including missions, reputation, streaks, and settings.
            This action cannot be undone.
          </p>
          <button
            onClick={() => {
              if (window.confirm('SYSTEM RESET: All data will be permanently erased. Proceed?')) {
                localStorage.removeItem('cyber-task-hacker-storage');
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-alert/10 border border-alert text-alert text-xs font-bold hover:bg-alert/20 transition-all flex items-center gap-2"
          >
            <RotateCcw size={14} />
            SYSTEM RESET
          </button>
        </div>
      </div>
    </motion.div>
  );
}
