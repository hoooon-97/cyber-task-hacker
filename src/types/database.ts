export interface DatabaseProfile {
  id: string;
  handle: string;
  reputation: number;
  level: number;
  theme: string;
  avatar_color: string;
  missions_completed: number;
  current_streak: number;
  longest_streak: number;
  focus_minutes_total: number;
  created_at: string;
}

export interface DatabaseMission {
  id: string;
  user_id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'BREACHED';
  server_name: string;
  ip_address: string;
  created_at: string;
  breached_at: string | null;
}

export interface DatabaseActivityLog {
  id: string;
  user_id: string;
  date: string;
  count: number;
}

export interface DatabaseWeekRecord {
  id: string;
  user_id: string;
  week_key: string;
  missions_completed: number;
  rep_earned: number;
  focus_minutes: number;
}

export interface DatabaseDailyMission {
  id: string;
  user_id: string;
  date: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CRITICAL';
  completed: boolean;
  server_name: string;
  ip_address: string;
}
