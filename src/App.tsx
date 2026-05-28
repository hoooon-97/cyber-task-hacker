import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHackerStore } from './store/useHackerStore';
import { useAuth } from './hooks/useAuth';
import { SoundEngine } from './utils/SoundEngine';
import MatrixRain from './components/MatrixRain';
import TerminalHeader from './components/TerminalHeader';
import MissionInput from './components/MissionInput';
import MissionList from './components/MissionList';
import RankBoard from './components/RankBoard';
import ProfilePage from './components/ProfilePage';
import DailyIntel from './components/DailyIntel';
import LevelUpEffect from './components/LevelUpEffect';
import BootSequence from './components/BootSequence';
import AuthModal from './components/AuthModal';

function App() {
  const activeView = useHackerStore((s) => s.activeView);
  const profile = useHackerStore((s) => s.profile);
  const hasBooted = useHackerStore((s) => s.hasBooted);
  const completeBoot = useHackerStore((s) => s.completeBoot);
  const setHandle = useHackerStore((s) => s.setHandle);
  const { user, loading: authLoading } = useAuth();

  const prevLevelRef = useRef(profile.level);
  const [levelUpData, setLevelUpData] = useState<{ oldLevel: number; newLevel: number } | null>(null);
  const [skipAuth, setSkipAuth] = useState(false);

  // Sync GitHub profile data on login
  useEffect(() => {
    if (user?.user_metadata) {
      const meta = user.user_metadata;
      if (meta.user_name && (profile.handle === 'GH0ST_01' || !profile.handle)) {
        setHandle(meta.user_name.toUpperCase());
      }
    }
  }, [user, profile.handle, setHandle]);

  // Load from Supabase ONLY if no local data (first-time login)
  useEffect(() => {
    if (user?.id) {
      const state = useHackerStore.getState();
      const hasLocalData = state.missions.length > 0 || state.profile.reputation > 0 || state.profile.handle !== 'GH0ST_01';
      if (!hasLocalData) {
        state.loadFromSupabase(user.id);
      }
    }
  }, [user?.id]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.theme);
  }, [profile.theme]);

  // Sync sound settings
  useEffect(() => {
    SoundEngine.enabled = profile.soundEnabled;
  }, [profile.soundEnabled]);

  // Detect level up
  useEffect(() => {
    if (profile.level > prevLevelRef.current) {
      setLevelUpData({ oldLevel: prevLevelRef.current, newLevel: profile.level });
      prevLevelRef.current = profile.level;
    }
  }, [profile.level]);

  useEffect(() => {
    prevLevelRef.current = profile.level;
  }, []);

  const handleLevelUpClose = () => {
    setLevelUpData(null);
  };

  // Auth state
  const isAuthenticated = !!user || skipAuth;
  const isGithubUser = !!user;

  // Boot sequence: skip name input for GitHub users
  const showBoot = !hasBooted && isAuthenticated;

  return (
    <div className="relative min-h-screen bg-dark text-primary overflow-hidden">
      <MatrixRain />
      <div className="scanline-overlay" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <TerminalHeader />

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4">
          {activeView === 'missions' && (
            <>
              <DailyIntel />
              <div className="mt-3">
                <MissionInput />
              </div>
            </>
          )}

          <div className="mt-4">
            <AnimatePresence mode="wait">
              {activeView === 'missions' && (
                <motion.div
                  key="missions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <MissionList />
                </motion.div>
              )}
              {activeView === 'ranking' && (
                <motion.div
                  key="ranking"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <RankBoard />
                </motion.div>
              )}
              {activeView === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfilePage />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <footer className="relative z-10 border-t border-border px-4 py-2">
          <div className="max-w-5xl mx-auto flex items-center justify-between text-[9px] text-text-dim">
            <span>CYBER-TASK HACKER v2.0.7 | ENCRYPTED CONNECTION</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              SYSTEM ONLINE
            </span>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {levelUpData && (
          <LevelUpEffect
            oldLevel={levelUpData.oldLevel}
            newLevel={levelUpData.newLevel}
            reputation={profile.reputation}
            onClose={handleLevelUpClose}
          />
        )}
      </AnimatePresence>

      {/* Auth Modal: always first for unauthenticated users */}
      <AnimatePresence>
        {!isAuthenticated && !authLoading && (
          <AuthModal
            onGuest={() => setSkipAuth(true)}
            onGithubLogin={() => {}}
          />
        )}
      </AnimatePresence>

      {/* Boot Sequence: after auth, for guests or first-time */}
      <AnimatePresence>
        {showBoot && (
          <BootSequence
            isGithubUser={isGithubUser}
            githubHandle={user?.user_metadata?.user_name?.toUpperCase() || ''}
            onComplete={completeBoot}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
