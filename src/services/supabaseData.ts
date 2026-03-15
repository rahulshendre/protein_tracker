import { supabase } from './supabase';
import { Meal, DailyLog, UserSettings, PhysiqueEntry } from '../types';
import { DEFAULTS } from '../constants';

const PHYSIQUE_BUCKET = 'physique';

function parseReminderTimes(json: unknown, legacyTime?: string): [string, string, string] {
  if (json && typeof json === 'string') {
    try {
      const arr = JSON.parse(json);
      if (Array.isArray(arr) && arr.length === 3 && arr.every((x) => typeof x === 'string')) return arr as [string, string, string];
    } catch { /* ignore */ }
  }
  if (Array.isArray(json) && json.length === 3 && json.every((x) => typeof x === 'string')) return json as [string, string, string];
  if (legacyTime) return [legacyTime, DEFAULTS.reminderTimes[1], DEFAULTS.reminderTimes[2]];
  return DEFAULTS.reminderTimes;
}

// ============================================
// USER SETTINGS
// ============================================

export async function getCloudSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    dailyProteinGoal: data.daily_protein_goal,
    dailyWaterGoalMl: data.daily_water_goal_ml ?? DEFAULTS.dailyWaterGoalMl,
    waterUnit: data.water_unit ?? DEFAULTS.waterUnit,
    theme: data.theme,
    reminderEnabled: data.reminder_enabled ?? DEFAULTS.reminderEnabled,
    reminderTimes: parseReminderTimes(data.reminder_times, data.reminder_time),
    createdAt: data.created_at,
  };
}

export async function saveCloudSettings(userId: string, settings: UserSettings): Promise<void> {
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      id: userId,
      daily_protein_goal: settings.dailyProteinGoal,
      daily_water_goal_ml: settings.dailyWaterGoalMl,
      water_unit: settings.waterUnit,
      theme: settings.theme,
      reminder_enabled: settings.reminderEnabled,
      reminder_times: JSON.stringify(settings.reminderTimes),
      created_at: settings.createdAt,
    });

  if (error) {
    if (__DEV__) console.warn('Cloud settings sync failed:', error.message);
    throw error;
  }
}

// ============================================
// MEALS
// ============================================

export async function getCloudMeals(userId: string, date: string): Promise<Meal[]> {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('timestamp', { ascending: true });

  if (error) {
    if (__DEV__) console.warn('Fetch cloud meals failed:', error.message);
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    proteinGrams: row.protein_grams,
    mealType: row.meal_type,
    timestamp: row.timestamp,
  }));
}

export async function addCloudMeal(userId: string, meal: Meal, date: string): Promise<void> {
  const { error } = await supabase.from('meals').insert({
    id: meal.id,
    user_id: userId,
    name: meal.name,
    protein_grams: meal.proteinGrams,
    meal_type: meal.mealType,
    date: date,
    timestamp: meal.timestamp,
  });

  if (error) {
    if (__DEV__) console.warn('Add cloud meal failed:', error.message);
    throw error;
  }
}

export async function updateCloudMeal(meal: Meal): Promise<void> {
  const { error } = await supabase
    .from('meals')
    .update({
      name: meal.name,
      protein_grams: meal.proteinGrams,
      meal_type: meal.mealType,
    })
    .eq('id', meal.id);

  if (error) {
    if (__DEV__) console.warn('Update cloud meal failed:', error.message);
    throw error;
  }
}

export async function deleteCloudMeal(mealId: string): Promise<void> {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', mealId);

  if (error) {
    if (__DEV__) console.warn('Delete cloud meal failed:', error.message);
    throw error;
  }
}

// ============================================
// WATER
// ============================================

export async function getCloudWater(userId: string, date: string): Promise<number> {
  const { data, error } = await supabase
    .from('water_logs')
    .select('ml')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();

  if (error) {
    if (__DEV__) console.warn('Fetch cloud water failed:', error.message);
    throw error;
  }
  return data?.ml ?? 0;
}

export async function saveCloudWater(userId: string, date: string, ml: number): Promise<void> {
  const { error } = await supabase
    .from('water_logs')
    .upsert(
      { user_id: userId, date, ml: Math.max(0, Math.floor(ml)) },
      { onConflict: 'user_id,date' }
    );

  if (error) {
    if (__DEV__) console.warn('Save cloud water failed:', error.message);
    throw error;
  }
}

// ============================================
// WEEK (single round-trip)
// ============================================

/** Fetches all meals for a date range in one query. Returns meals with date for grouping. */
export async function getCloudMealsForDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Array<Meal & { date: string }>> {
  const { data, error } = await supabase
    .from('meals')
    .select('id, name, protein_grams, meal_type, timestamp, date')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('timestamp', { ascending: true });

  if (error) {
    if (__DEV__) console.warn('Fetch week meals failed:', error.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    proteinGrams: row.protein_grams,
    mealType: row.meal_type,
    timestamp: row.timestamp,
    date: row.date,
  }));
}

// ============================================
// HISTORY
// ============================================

export async function getCloudHistory(userId: string, limit: number = 30): Promise<string[]> {
  const { data, error } = await supabase
    .from('meals')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    if (__DEV__) console.warn('Fetch cloud history failed:', error.message);
    return [];
  }

  // Get unique dates
  const uniqueDates = [...new Set(data.map((row) => row.date))];
  return uniqueDates.slice(0, limit);
}

export async function getCloudDailyLog(userId: string, date: string): Promise<DailyLog | null> {
  const meals = await getCloudMeals(userId, date);
  const settings = await getCloudSettings(userId);

  if (meals.length === 0) return null;

  return {
    date,
    meals,
    goalGrams: settings?.dailyProteinGoal || DEFAULTS.dailyProteinGoal,
  };
}

// ============================================
// PHYSIQUE (entries + storage)
// ============================================

function base64ToUint8Array(base64: string): Uint8Array {
  const clean = base64.replace(/^data:image\/\w+;base64,/, '');
  const atobFn = (globalThis as { atob?: (s: string) => string }).atob;
  const chars = typeof atobFn === 'function' ? atobFn(clean) : decodeBase64(clean);
  const out = new Uint8Array(chars.length);
  for (let i = 0; i < chars.length; i++) out[i] = chars.charCodeAt(i);
  return out;
}

function decodeBase64(s: string): string {
  const key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let result = '';
  let i = 0;
  while (i < s.length) {
    const a = key.indexOf(s[i++]);
    const b = key.indexOf(s[i++]);
    const c = key.indexOf(s[i++]);
    const d = key.indexOf(s[i++]);
    result += String.fromCharCode((a << 2) | (b >> 4));
    if (c !== 64) result += String.fromCharCode(((b << 4) & 0xf0) | (c >> 2));
    if (d !== 64) result += String.fromCharCode(((c << 6) & 0xc0) | d);
  }
  return result;
}

/** Upload image to Storage; returns public URL. Uses base64 from picker for cross-platform reliability. */
export async function uploadPhysiqueImage(
  userId: string,
  entryId: string,
  base64Data: string
): Promise<string> {
  const ext = base64Data.startsWith('data:') ? 'png' : 'jpg';
  const path = `${userId}/${entryId}.${ext}`;
  const byteNumbers = base64ToUint8Array(base64Data);

  const { error } = await supabase.storage.from(PHYSIQUE_BUCKET).upload(path, byteNumbers, {
    contentType: `image/${ext}`,
    upsert: true,
  });

  if (error) {
    if (__DEV__) console.warn('Physique image upload failed:', error.message);
    throw error;
  }

  const { data: urlData } = supabase.storage.from(PHYSIQUE_BUCKET).getPublicUrl(path);
  return urlData.publicUrl;
}

export async function getCloudPhysiqueEntries(userId: string): Promise<PhysiqueEntry[]> {
  const { data, error } = await supabase
    .from('physique_entries')
    .select('id, created_at, image_url, weight, notes')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    if (__DEV__) console.warn('Fetch cloud physique failed:', error.message);
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    imageUri: row.image_url,
    weight: Number(row.weight),
    notes: row.notes ?? '',
  }));
}

export async function addCloudPhysiqueEntry(
  userId: string,
  entry: Omit<PhysiqueEntry, 'imageUri'> & { imageUrl: string }
): Promise<void> {
  const { error } = await supabase.from('physique_entries').insert({
    id: entry.id,
    user_id: userId,
    created_at: entry.createdAt,
    image_url: entry.imageUrl,
    weight: entry.weight,
    notes: entry.notes,
  });

  if (error) {
    if (__DEV__) console.warn('Add cloud physique failed:', error.message);
    throw error;
  }
}

export async function deleteCloudPhysiqueEntry(userId: string, id: string): Promise<void> {
  const { error } = await supabase.from('physique_entries').delete().eq('id', id).eq('user_id', userId);
  if (error) {
    if (__DEV__) console.warn('Delete cloud physique failed:', error.message);
    throw error;
  }
  const paths = [`${userId}/${id}.jpg`, `${userId}/${id}.png`];
  await supabase.storage.from(PHYSIQUE_BUCKET).remove(paths).catch(() => {});
}
