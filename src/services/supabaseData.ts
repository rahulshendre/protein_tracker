import { supabase } from './supabase';
import { Meal, DailyLog, UserSettings } from '../types';
import { DEFAULTS } from '../constants';

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
    theme: data.theme,
    reminderEnabled: data.reminder_enabled ?? DEFAULTS.reminderEnabled,
    reminderTime: data.reminder_time ?? DEFAULTS.reminderTime,
    createdAt: data.created_at,
  };
}

export async function saveCloudSettings(userId: string, settings: UserSettings): Promise<void> {
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      id: userId,
      daily_protein_goal: settings.dailyProteinGoal,
      theme: settings.theme,
      reminder_enabled: settings.reminderEnabled,
      reminder_time: settings.reminderTime,
      created_at: settings.createdAt,
    });

  if (error) {
    console.error('Error saving cloud settings:', error);
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
    console.error('Error fetching cloud meals:', error);
    return [];
  }

  return data.map((row) => ({
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
    console.error('Error adding cloud meal:', error);
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
    console.error('Error updating cloud meal:', error);
    throw error;
  }
}

export async function deleteCloudMeal(mealId: string): Promise<void> {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', mealId);

  if (error) {
    console.error('Error deleting cloud meal:', error);
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
    console.error('Error fetching week meals:', error);
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
    console.error('Error fetching cloud history:', error);
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
