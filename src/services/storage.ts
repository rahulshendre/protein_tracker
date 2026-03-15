/**
 * Storage Service
 * 
 * Handles all interactions with AsyncStorage (local persistence).
 * 
 * WHY A SERVICE LAYER?
 * - Abstracts storage implementation (could swap AsyncStorage for SQLite later)
 * - Centralizes error handling
 * - Provides typed interfaces for data access
 * - Makes testing easier (can mock this service)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULTS } from '../constants';
import { DailyLog, Meal, UserSettings } from '../types';

// ============================================
// USER SETTINGS
// ============================================

export async function getSettings(): Promise<UserSettings> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsed = json ? JSON.parse(json) : null;
    return {
      dailyProteinGoal: parsed?.dailyProteinGoal ?? DEFAULTS.dailyProteinGoal,
      dailyWaterGoalMl: parsed?.dailyWaterGoalMl ?? parsed?.dailyWaterGoal != null ? parsed.dailyWaterGoal * 250 : DEFAULTS.dailyWaterGoalMl,
      waterUnit: parsed?.waterUnit ?? DEFAULTS.waterUnit,
      theme: parsed?.theme ?? DEFAULTS.theme,
      reminderEnabled: parsed?.reminderEnabled ?? DEFAULTS.reminderEnabled,
      reminderTimes: (parsed?.reminderTimes && Array.isArray(parsed.reminderTimes) && parsed.reminderTimes.length === 3)
        ? parsed.reminderTimes
        : (parsed?.reminderTime != null ? [parsed.reminderTime, DEFAULTS.reminderTimes[1], DEFAULTS.reminderTimes[2]] : DEFAULTS.reminderTimes),
      createdAt: parsed?.createdAt ?? new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error reading settings:', error);
    throw error;
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

// ============================================
// DAILY LOGS
// ============================================

// Get the storage key for a specific date
function getDailyLogKey(date: string): string {
  return `${STORAGE_KEYS.DAILY_LOG_PREFIX}${date}`;
}

export async function getDailyLog(date: string): Promise<DailyLog | null> {
  try {
    const json = await AsyncStorage.getItem(getDailyLogKey(date));
    if (json) {
      return JSON.parse(json);
    }
    return null;
  } catch (error) {
    console.error('Error reading daily log:', error);
    throw error;
  }
}

export async function saveDailyLog(log: DailyLog): Promise<void> {
  try {
    await AsyncStorage.setItem(getDailyLogKey(log.date), JSON.stringify(log));
    // Also update the history index
    await addToHistoryIndex(log.date);
  } catch (error) {
    console.error('Error saving daily log:', error);
    throw error;
  }
}

// ============================================
// MEALS (convenience functions)
// ============================================

export async function addMeal(date: string, meal: Meal, goalGrams: number): Promise<DailyLog> {
  const existingLog = await getDailyLog(date);
  
  const updatedLog: DailyLog = existingLog
    ? { ...existingLog, meals: [...existingLog.meals, meal] }
    : { date, meals: [meal], goalGrams };
  
  await saveDailyLog(updatedLog);
  return updatedLog;
}

export async function updateMeal(date: string, updatedMeal: Meal): Promise<DailyLog | null> {
  const log = await getDailyLog(date);
  if (!log) return null;
  
  const updatedLog: DailyLog = {
    ...log,
    meals: log.meals.map(m => m.id === updatedMeal.id ? updatedMeal : m),
  };
  
  await saveDailyLog(updatedLog);
  return updatedLog;
}

export async function deleteMeal(date: string, mealId: string): Promise<DailyLog | null> {
  const log = await getDailyLog(date);
  if (!log) return null;
  
  const updatedLog: DailyLog = {
    ...log,
    meals: log.meals.filter(m => m.id !== mealId),
  };
  
  await saveDailyLog(updatedLog);
  return updatedLog;
}

// ============================================
// WATER (ml per day, stored canonically)
// ============================================

function getWaterKey(date: string): string {
  return `${STORAGE_KEYS.WATER_PREFIX}${date}`;
}

export async function getWater(date: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(getWaterKey(date));
    if (raw == null) return 0;
    const n = parseInt(raw, 10);
    return isNaN(n) ? 0 : Math.max(0, n);
  } catch (error) {
    console.error('Error reading water:', error);
    return 0;
  }
}

export async function setWater(date: string, ml: number): Promise<void> {
  try {
    await AsyncStorage.setItem(getWaterKey(date), String(Math.max(0, Math.floor(ml))));
  } catch (error) {
    console.error('Error saving water:', error);
    throw error;
  }
}

// ============================================
// HISTORY INDEX
// ============================================

// Keeps track of which dates have data (for history screen)
async function addToHistoryIndex(date: string): Promise<void> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY_INDEX);
    const dates: string[] = json ? JSON.parse(json) : [];
    
    if (!dates.includes(date)) {
      dates.push(date);
      dates.sort().reverse(); // Most recent first
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY_INDEX, JSON.stringify(dates));
    }
  } catch (error) {
    console.error('Error updating history index:', error);
  }
}

export async function getHistoryDates(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY_INDEX);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error reading history index:', error);
    return [];
  }
}

// ============================================
// UTILITY
// ============================================

// Clear all app data (for debugging/reset)
export async function clearAllData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const appKeys = keys.filter(k => k.startsWith('@protein_tracker'));
    await AsyncStorage.multiRemove(appKeys);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}
