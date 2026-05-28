import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Mission, Difficulty, HackerProfile, RankEntry, AppView, DailyMission, WeekRecord, ThemeName } from '../types';
import { generateId, generateServerName, generateIpAddress } from '../utils/helpers';
import {
  DIFFICULTY_CONFIG,
  MOCK_GLOBAL_RANKING,
  calculateLevel,
  getLevelTitle,
  DAILY_INTEL_TEMPLATES,
  getDateKey,
  getWeekKey,
  getDailyBonus,
} from '../utils/constants';

interface HackerState {
  profile: HackerProfile;
  missions: Mission[];
  globalRanking: RankEntry[];
  activeView: AppView;
  hasBooted: boolean;
  dailyMissions: DailyMission[];
  lastDailyDate: string;
  activityLog: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  weekRecords: Record<string, WeekRecord>;
  focusMinutesTotal: number;

  setHandle: (handle: string) => void;
  setAvatarColor: (color: string) => void;
  setTheme: (theme: ThemeName) => void;
  setOpenaiKey: (key: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  loadFromSupabase: (userId: string) => Promise<void>;
  saveToSupabase: (userId: string) => Promise<void>;
  addMission: (title: string, difficulty: Difficulty, deadline?: number) => void;
  deleteMission: (id: string) => void;
  clearBreachedMissions: () => void;
  startMission: (id: string) => void;
  completeBreach: (id: string, isDaily?: boolean) => void;
  setActiveView: (view: AppView) => void;
  completeBoot: () => void;
  generateDailyMissions: () => void;
  completeDailyMission: (index: number) => void;
  addFocusSession: (minutes: number) => void;
  getStats: () => {
    totalMissions: number;
    completedMissions: number;
    pendingMissions: number;
    inProgressMissions: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
    criticalCount: number;
    totalRep: number;
    currentTitle: string;
    nextLevelRep: number;
  };
  getWeeklyLeaderboard: () => RankEntry[];
  getTodayKey: () => string;
}

const initialProfile: HackerProfile = {
  handle: 'GH0ST_01',
  reputation: 0,
  level: 1,
  missionsCompleted: 0,
  avatarColor: '#00ff41',
  theme: 'matrix',
  openaiKey: '',
  soundEnabled: true,
  notificationsEnabled: true,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const useHackerStore = create<HackerState>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      missions: [],
      globalRanking: MOCK_GLOBAL_RANKING,
      activeView: 'missions',
      hasBooted: false,
      dailyMissions: [],
      lastDailyDate: '',
      activityLog: {},
      currentStreak: 0,
      longestStreak: 0,
      weekRecords: {},
      focusMinutesTotal: 0,

      setHandle: (handle) =>
        set((state) => ({ profile: { ...state.profile, handle } })),

      setAvatarColor: (avatarColor) =>
        set((state) => ({ profile: { ...state.profile, avatarColor } })),

      setTheme: (theme) =>
        set((state) => ({ profile: { ...state.profile, theme } })),

      setOpenaiKey: (openaiKey) =>
        set((state) => ({ profile: { ...state.profile, openaiKey } })),

      setSoundEnabled: (soundEnabled) =>
        set((state) => ({ profile: { ...state.profile, soundEnabled } })),

      setNotificationsEnabled: (notificationsEnabled) =>
        set((state) => ({ profile: { ...state.profile, notificationsEnabled } })),

      loadFromSupabase: async (userId) => {
        const { loadProfile, loadMissions, loadActivityLogs, loadWeekRecords } = await import('../lib/supabase');
        const dbProfile = await loadProfile(userId);
        if (dbProfile) {
          set((state) => ({
            profile: {
              ...state.profile,
              handle: dbProfile.handle || state.profile.handle,
              reputation: dbProfile.reputation || 0,
              level: dbProfile.level || 1,
              missionsCompleted: dbProfile.missions_completed || 0,
              theme: (dbProfile.theme as ThemeName) || 'matrix',
              avatarColor: dbProfile.avatar_color || '#00ff41',
            },
            currentStreak: dbProfile.current_streak || 0,
            longestStreak: dbProfile.longest_streak || 0,
            focusMinutesTotal: dbProfile.focus_minutes_total || 0,
          }));
        }
        const dbMissions = await loadMissions(userId);
        if (dbMissions.length > 0) {
          set(() => ({
            missions: dbMissions.map((m) => ({
              id: m.id,
              title: m.title,
              difficulty: m.difficulty,
              status: m.status,
              createdAt: new Date(m.created_at).getTime(),
              breachedAt: m.breached_at ? new Date(m.breached_at).getTime() : undefined,
              serverName: m.server_name,
              ipAddress: m.ip_address,
            })),
          }));
        }
        const dbLogs = await loadActivityLogs(userId);
        const logMap: Record<string, number> = {};
        dbLogs.forEach((l) => { logMap[l.date] = l.count; });
        if (Object.keys(logMap).length > 0) {
          set(() => ({ activityLog: logMap }));
        }
        const dbWeeks = await loadWeekRecords(userId);
        const weekMap: Record<string, WeekRecord> = {};
        dbWeeks.forEach((w) => {
          weekMap[w.week_key] = {
            weekKey: w.week_key,
            missionsCompleted: w.missions_completed,
            repEarned: w.rep_earned,
            focusMinutes: w.focus_minutes,
          };
        });
        if (Object.keys(weekMap).length > 0) {
          set(() => ({ weekRecords: weekMap }));
        }
      },

      saveToSupabase: async (userId) => {
        const { upsertProfile, insertMission, upsertActivityLog, upsertWeekRecord } = await import('../lib/supabase');
        const state = get();
        await upsertProfile({
          id: userId,
          handle: state.profile.handle,
          reputation: state.profile.reputation,
          level: state.profile.level,
          theme: state.profile.theme,
          avatar_color: state.profile.avatarColor,
          missions_completed: state.profile.missionsCompleted,
          current_streak: state.currentStreak,
          longest_streak: state.longestStreak,
          focus_minutes_total: state.focusMinutesTotal,
        });
        for (const m of state.missions) {
          await insertMission({
            id: m.id,
            user_id: userId,
            title: m.title,
            difficulty: m.difficulty,
            status: m.status,
            server_name: m.serverName,
            ip_address: m.ipAddress,
            created_at: new Date(m.createdAt).toISOString(),
            breached_at: m.breachedAt ? new Date(m.breachedAt).toISOString() : null,
          });
        }
        for (const [date, count] of Object.entries(state.activityLog)) {
          await upsertActivityLog({ user_id: userId, date, count });
        }
        for (const [weekKey, record] of Object.entries(state.weekRecords)) {
          await upsertWeekRecord({
            user_id: userId,
            week_key: weekKey,
            missions_completed: record.missionsCompleted,
            rep_earned: record.repEarned,
            focus_minutes: record.focusMinutes,
          });
        }
      },

      addMission: (title, difficulty, deadline) => {
        const mission: Mission = {
          id: generateId(),
          title,
          difficulty,
          status: 'PENDING',
          createdAt: Date.now(),
          serverName: generateServerName(),
          ipAddress: generateIpAddress(),
          deadline,
        };
        set((state) => ({ missions: [mission, ...state.missions] }));
      },

      deleteMission: (id) =>
        set((state) => ({
          missions: state.missions.filter((m) => m.id !== id),
        })),

      clearBreachedMissions: () =>
        set((state) => ({
          missions: state.missions.filter((m) => m.status !== 'BREACHED'),
        })),

      startMission: (id) =>
        set((state) => ({
          missions: state.missions.map((m) =>
            m.id === id ? { ...m, status: 'IN_PROGRESS' as const } : m
          ),
        })),

      completeBreach: (id, isDaily = false) => {
        const mission = get().missions.find((m) => m.id === id);
        if (!mission) return;

        const baseReward = DIFFICULTY_CONFIG[mission.difficulty].repReward;
        const dailyBonus = isDaily ? getDailyBonus(mission.difficulty) : 0;
        const repReward = baseReward + dailyBonus;
        const newReputation = get().profile.reputation + repReward;
        const newLevel = calculateLevel(newReputation);
        const newMissionsCompleted = get().profile.missionsCompleted + 1;

        const todayKey = getDateKey();
        const weekKey = getWeekKey();

        set((state) => {
          const newActivityLog = { ...state.activityLog };
          newActivityLog[todayKey] = (newActivityLog[todayKey] || 0) + 1;

          let newCurrentStreak = state.currentStreak;
          let newLongestStreak = state.longestStreak;
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayKey = getDateKey(yesterday);
          const hasYesterday = !!state.activityLog[yesterdayKey];
          const hasToday = (state.activityLog[todayKey] || 0) > 0;

          if (hasYesterday || !hasToday) {
            newCurrentStreak = hasYesterday ? state.currentStreak + 1 : 1;
          }
          if (newCurrentStreak > state.longestStreak) {
            newLongestStreak = newCurrentStreak;
          }

          const newWeekRecords = { ...state.weekRecords };
          if (!newWeekRecords[weekKey]) {
            newWeekRecords[weekKey] = { weekKey, missionsCompleted: 0, repEarned: 0, focusMinutes: 0 };
          }
          newWeekRecords[weekKey].missionsCompleted += 1;
          newWeekRecords[weekKey].repEarned += repReward;

          return {
            profile: {
              ...state.profile,
              reputation: newReputation,
              level: newLevel,
              missionsCompleted: newMissionsCompleted,
            },
            missions: state.missions.map((m) =>
              m.id === id
                ? { ...m, status: 'BREACHED' as const, breachedAt: Date.now() }
                : m
            ),
            activityLog: newActivityLog,
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            weekRecords: newWeekRecords,
          };
        });
      },

      setActiveView: (view) => set(() => ({ activeView: view })),

      completeBoot: () => set(() => ({ hasBooted: true })),

      generateDailyMissions: () => {
        const todayKey = getDateKey();
        if (get().lastDailyDate === todayKey) return;

        const templates = shuffle(DAILY_INTEL_TEMPLATES).slice(0, 3);
        const dailyMissions: DailyMission[] = templates.map((t) => ({
          id: generateId(),
          title: `[DAILY INTEL] ${t.title}`,
          difficulty: t.difficulty,
          completed: false,
          serverName: generateServerName(),
          ipAddress: generateIpAddress(),
        }));

        set(() => ({
          dailyMissions,
          lastDailyDate: todayKey,
        }));
      },

      completeDailyMission: (index) => {
        set((state) => {
          const dm = [...state.dailyMissions];
          if (dm[index]) dm[index] = { ...dm[index], completed: true };
          return { dailyMissions: dm };
        });
      },

      addFocusSession: (minutes) => {
        const weekKey = getWeekKey();
        set((state) => {
          const newWeekRecords = { ...state.weekRecords };
          if (!newWeekRecords[weekKey]) {
            newWeekRecords[weekKey] = { weekKey, missionsCompleted: 0, repEarned: 0, focusMinutes: 0 };
          }
          newWeekRecords[weekKey].focusMinutes += minutes;
          return {
            focusMinutesTotal: state.focusMinutesTotal + minutes,
            weekRecords: newWeekRecords,
          };
        });
      },

      getStats: () => {
        const { profile, missions } = get();
        const completed = missions.filter((m) => m.status === 'BREACHED');
        return {
          totalMissions: missions.length,
          completedMissions: completed.length,
          pendingMissions: missions.filter((m) => m.status === 'PENDING').length,
          inProgressMissions: missions.filter((m) => m.status === 'IN_PROGRESS').length,
          easyCount: completed.filter((m) => m.difficulty === 'EASY').length,
          mediumCount: completed.filter((m) => m.difficulty === 'MEDIUM').length,
          hardCount: completed.filter((m) => m.difficulty === 'HARD').length,
          criticalCount: completed.filter((m) => m.difficulty === 'CRITICAL').length,
          totalRep: profile.reputation,
          currentTitle: getLevelTitle(profile.reputation),
          nextLevelRep: Math.pow(profile.level, 2) * 10,
        };
      },

      getWeeklyLeaderboard: () => {
        const { profile, weekRecords } = get();
        const sortedWeeks = Object.values(weekRecords).sort((a, b) =>
          b.weekKey.localeCompare(a.weekKey)
        );

        const entries: RankEntry[] = sortedWeeks.slice(0, 5).map((w, i) => ({
          rank: i + 1,
          handle: `${profile.handle} (${w.weekKey})`,
          reputation: w.repEarned,
          country: 'WEEK',
          title: `${w.missionsCompleted} OPS | ${w.focusMinutes}m FOCUS`,
        }));

        if (entries.length === 0) {
          entries.push({
            rank: 1,
            handle: profile.handle,
            reputation: profile.reputation,
            country: 'NOW',
            title: getLevelTitle(profile.reputation),
          });
        }

        return entries;
      },

      getTodayKey: () => getDateKey(),
    }),
    {
      name: 'cyber-task-hacker-storage',
      partialize: (state) => ({
        profile: state.profile,
        missions: state.missions,
        hasBooted: state.hasBooted,
        dailyMissions: state.dailyMissions,
        lastDailyDate: state.lastDailyDate,
        activityLog: state.activityLog,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        weekRecords: state.weekRecords,
        focusMinutesTotal: state.focusMinutesTotal,
      }),
    }
  )
);
