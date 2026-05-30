import { createClient } from '@supabase/supabase-js';
import type { DatabaseProfile, DatabaseMission, DatabaseActivityLog, DatabaseWeekRecord, DatabaseDailyMission } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Profile CRUD
export async function loadProfile(userId: string): Promise<DatabaseProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('loadProfile error:', error);
    return null;
  }
  return data;
}

export async function upsertProfile(profile: Partial<DatabaseProfile> & { id: string }) {
  const { error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' });
  if (error) {
    console.error('upsertProfile error:', error);
    throw error;
  }
}

// Missions CRUD
export async function loadMissions(userId: string): Promise<DatabaseMission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('loadMissions error:', error);
    return [];
  }
  return data || [];
}

export async function upsertMission(mission: DatabaseMission) {
  const { error } = await supabase.from('missions').upsert(mission, { onConflict: 'id' });
  if (error) {
    console.error('upsertMission error:', error);
    throw error;
  }
}

export async function updateMissionStatus(id: string, status: string, breachedAt?: string | null) {
  const { error } = await supabase
    .from('missions')
    .update({ status, breached_at: breachedAt })
    .eq('id', id);
  if (error) console.error('updateMissionStatus error:', error);
}

export async function deleteMissionDb(id: string, userId?: string) {
  let query = supabase.from('missions').delete().eq('id', id);
  if (userId) {
    query = query.eq('user_id', userId);
  }
  const { data, error } = await query.select();
  console.log('[deleteMissionDb] id=', id, 'userId=', userId, 'deletedRows=', data, 'error=', error);
  if (error) {
    console.error('deleteMissionDb error:', error);
    throw error;
  }
  if (!data || data.length === 0) {
    console.warn('[deleteMissionDb] No rows were deleted! The row may not exist for this user_id or RLS prevented deletion.');
  }
}

export async function deleteBreachedMissionsDb(userId: string) {
  const { data, error } = await supabase
    .from('missions')
    .delete()
    .eq('user_id', userId)
    .eq('status', 'BREACHED')
    .select();
  console.log('[deleteBreachedMissionsDb] userId=', userId, 'deletedRows=', data, 'error=', error);
  if (error) {
    console.error('deleteBreachedMissionsDb error:', error);
    throw error;
  }
  if (!data || data.length === 0) {
    console.warn('[deleteBreachedMissionsDb] No rows were deleted! RLS or no matching breached missions for this user.');
  }
}

// Activity Log
export async function loadActivityLogs(userId: string): Promise<DatabaseActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    console.error('loadActivityLogs error:', error);
    return [];
  }
  return data || [];
}

export async function upsertActivityLog(log: Omit<DatabaseActivityLog, 'id'>) {
  const { error } = await supabase.from('activity_logs').upsert(log, { onConflict: 'user_id,date' });
  if (error) {
    console.error('upsertActivityLog error:', error);
    throw error;
  }
}

// Week Records
export async function loadWeekRecords(userId: string): Promise<DatabaseWeekRecord[]> {
  const { data, error } = await supabase
    .from('week_records')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    console.error('loadWeekRecords error:', error);
    return [];
  }
  return data || [];
}

export async function upsertWeekRecord(record: Omit<DatabaseWeekRecord, 'id'>) {
  const { error } = await supabase.from('week_records').upsert(record, { onConflict: 'user_id,week_key' });
  if (error) {
    console.error('upsertWeekRecord error:', error);
    throw error;
  }
}

// Daily Missions
export async function loadDailyMissions(userId: string, date: string): Promise<DatabaseDailyMission[]> {
  const { data, error } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);
  if (error) {
    console.error('loadDailyMissions error:', error);
    return [];
  }
  return data || [];
}

export async function upsertDailyMissions(missions: Omit<DatabaseDailyMission, 'id'>[]) {
  if (missions.length === 0) return;
  const { error } = await supabase.from('daily_missions').upsert(missions, { onConflict: 'user_id,date,title' });
  if (error) console.error('upsertDailyMissions error:', error);
}

// AI Recommendation
export async function generateAIIntel(apiKey: string): Promise<{ title: string; difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CRITICAL' }[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a cyberpunk hacker AI. Generate 3 daily hacking missions in JSON format. Each mission should have a "title" (cyberpunk themed) and "difficulty" (EASY, MEDIUM, HARD, or CRITICAL). Return ONLY a JSON array.',
        },
        {
          role: 'user',
          content: 'Generate 3 daily hacking missions for today.',
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    throw new Error('AI API request failed');
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '[]';
  try {
    const parsed = JSON.parse(content);
    return parsed.map((m: { title: string; difficulty: string }) => ({
      title: m.title,
      difficulty: m.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD' | 'CRITICAL',
    }));
  } catch {
    throw new Error('Failed to parse AI response');
  }
}
