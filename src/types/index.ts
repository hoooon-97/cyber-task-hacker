export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'CRITICAL';
export type MissionStatus = 'PENDING' | 'IN_PROGRESS' | 'BREACHED';
export type AppView = 'missions' | 'ranking' | 'profile';
export type ThemeName = 'matrix' | 'cyber' | 'alert' | 'ghost';

export interface Mission {
  id: string;
  title: string;
  difficulty: Difficulty;
  status: MissionStatus;
  createdAt: number;
  breachedAt?: number;
  deadline?: number;
  serverName: string;
  ipAddress: string;
}

export interface HackerProfile {
  handle: string;
  reputation: number;
  level: number;
  missionsCompleted: number;
  avatarColor: string;
  theme: ThemeName;
  openaiKey: string;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface RankEntry {
  rank: number;
  handle: string;
  reputation: number;
  country: string;
  title: string;
}

export interface HackingLog {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface DailyMission {
  id: string;
  title: string;
  difficulty: Difficulty;
  completed: boolean;
  serverName: string;
  ipAddress: string;
}

export interface WeekRecord {
  weekKey: string;
  missionsCompleted: number;
  repEarned: number;
  focusMinutes: number;
}
