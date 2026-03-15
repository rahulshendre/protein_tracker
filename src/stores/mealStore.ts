/**
 * Meal Store (Zustand)
 * 
 * Syncs with both local storage (offline) and Supabase (cloud).
 * Local storage is the source of truth, Supabase syncs in background.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays } from 'date-fns';
import { DailyLog, DailyStats, Meal, MealType, UserSettings } from '../types';
import * as storage from '../services/storage';
import * as cloudData from '../services/supabaseData';
import * as notifications from '../services/notifications';
import { DEFAULTS, GLASSES_ML } from '../constants';
import { useAuthStore } from './authStore';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline';

interface MealStore {
  settings: UserSettings;
  todayLog: DailyLog | null;
  todayWater: number;
  water7DayAvg: number;   // average ml per day over last 7 days
  isLoading: boolean;
  syncStatus: SyncStatus;

  setSyncStatus: (status: SyncStatus) => void;
  loadSettings: () => Promise<void>;
  updateGoal: (goal: number) => Promise<void>;
  updateWaterGoal: (goalMl: number) => Promise<void>;
  setWaterUnit: (unit: 'glasses' | 'ml') => Promise<void>;
  updateTheme: (theme: 'light' | 'dark') => Promise<void>;
  updateReminder: (enabled: boolean, times?: [string, string, string]) => Promise<void>;

  loadTodayLog: () => Promise<void>;
  loadWater: () => Promise<void>;
  addWater: () => Promise<void>;
  addMeal: (name: string, proteinGrams: number, mealType: MealType) => Promise<void>;
  updateMeal: (meal: Meal) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;

  getDailyStats: () => DailyStats;
}

function getTodayDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function calculateStats(log: DailyLog | null, goal: number): DailyStats {
  if (!log || log.meals.length === 0) {
    return {
      totalProtein: 0,
      remainingProtein: goal,
      percentComplete: 0,
      mealsCount: 0,
    };
  }

  const totalProtein = log.meals.reduce((sum, meal) => sum + meal.proteinGrams, 0);
  const remainingProtein = Math.max(0, goal - totalProtein);
  const percentComplete = Math.min(100, Math.round((totalProtein / goal) * 100));

  return {
    totalProtein,
    remainingProtein,
    percentComplete,
    mealsCount: log.meals.length,
  };
}

// Helper to get current user ID
function getUserId(): string | null {
  return useAuthStore.getState().user?.id || null;
}

export const useMealStore = create<MealStore>((set, get) => ({
  settings: {
    dailyProteinGoal: DEFAULTS.dailyProteinGoal,
    dailyWaterGoalMl: DEFAULTS.dailyWaterGoalMl,
    waterUnit: DEFAULTS.waterUnit,
    theme: DEFAULTS.theme,
    reminderEnabled: DEFAULTS.reminderEnabled,
    reminderTimes: DEFAULTS.reminderTimes,
    createdAt: new Date().toISOString(),
  },
  todayLog: null,
  todayWater: 0,
  water7DayAvg: 0,
  isLoading: true,
  syncStatus: 'idle',

  setSyncStatus: (status) => set({ syncStatus: status }),

  // Load settings (local + cloud sync)
  loadSettings: async () => {
    const localSettings = await storage.getSettings();
    set({ settings: localSettings });

    const userId = getUserId();
    if (userId) {
      try {
        const cloudSettings = await cloudData.getCloudSettings(userId);
        if (cloudSettings) {
          const merged = { ...localSettings, ...cloudSettings };
          set({ settings: merged });
          await storage.saveSettings(merged);
        } else {
          await cloudData.saveCloudSettings(userId, localSettings);
        }
      } catch {
        get().setSyncStatus('offline');
        __DEV__ && console.warn('Cloud sync failed, using local data');
      }
    }

    const s = get().settings;
    try {
      if (s.reminderEnabled) {
        await notifications.scheduleDailyReminders(s.reminderTimes);
      } else {
        await notifications.cancelDailyReminder();
      }
    } catch {
      __DEV__ && console.warn('Reminder schedule failed');
    }
  },

  updateWaterGoal: async (goalMl: number) => {
    const { settings } = get();
    const newSettings = { ...settings, dailyWaterGoalMl: Math.max(0, Math.floor(goalMl)) };
    await storage.saveSettings(newSettings);
    set({ settings: newSettings });
    const userId = getUserId();
    if (userId) {
      try {
        await cloudData.saveCloudSettings(userId, newSettings);
      } catch {
        __DEV__ && console.warn('Sync water goal to cloud failed');
      }
    }
  },

  setWaterUnit: async (waterUnit: 'glasses' | 'ml') => {
    const { settings } = get();
    const newSettings = { ...settings, waterUnit };
    await storage.saveSettings(newSettings);
    set({ settings: newSettings });
    const userId = getUserId();
    if (userId) {
      try {
        await cloudData.saveCloudSettings(userId, newSettings);
      } catch {
        __DEV__ && console.warn('Sync water unit to cloud failed');
      }
    }
  },

  // Update protein goal
  updateGoal: async (goal: number) => {
    const { settings } = get();
    const newSettings = { ...settings, dailyProteinGoal: goal };
    
    // Save locally
    await storage.saveSettings(newSettings);
    set({ settings: newSettings });

    // Sync to cloud
    const userId = getUserId();
    if (userId) {
      try {
        await cloudData.saveCloudSettings(userId, newSettings);
      } catch (error) {
        __DEV__ && console.warn('Sync settings to cloud failed');
      }
    }
  },

  updateReminder: async (enabled: boolean, times?: [string, string, string]) => {
    const { settings } = get();
    const newSettings = {
      ...settings,
      reminderEnabled: enabled,
      reminderTimes: times ?? settings.reminderTimes,
    };
    await storage.saveSettings(newSettings);
    set({ settings: newSettings });
    if (enabled) {
      await notifications.scheduleDailyReminders(newSettings.reminderTimes);
    } else {
      await notifications.cancelDailyReminder();
    }
    const userId = getUserId();
    if (userId) {
      try {
        await cloudData.saveCloudSettings(userId, newSettings);
      } catch (e) {
        __DEV__ && console.warn('Sync reminder to cloud failed');
      }
    }
  },

  updateTheme: async (theme: 'light' | 'dark') => {
    const { settings } = get();
    const newSettings = { ...settings, theme };
    
    await storage.saveSettings(newSettings);
    set({ settings: newSettings });

    const userId = getUserId();
    if (userId) {
      try {
        await cloudData.saveCloudSettings(userId, newSettings);
      } catch (error) {
        __DEV__ && console.warn('Sync theme to cloud failed');
      }
    }
  },

  // Load today's meals (local-first: show local immediately, then sync from cloud)
  loadTodayLog: async () => {
    const today = getTodayDate();
    const userId = getUserId();

    // 1. Load from local first for instant UI
    const localLog = await storage.getDailyLog(today);
    set({ todayLog: localLog, isLoading: false });

    if (!userId) return;

    // 2. Fetch from cloud in background and overwrite when ready
    try {
      const cloudMeals = await cloudData.getCloudMeals(userId, today);
      const { settings } = get();
      const log: DailyLog = {
        date: today,
        meals: cloudMeals,
        goalGrams: settings.dailyProteinGoal,
      };
      set({ todayLog: log });
      await storage.saveDailyLog(log);
    } catch {
      __DEV__ && console.warn('Sync today log from cloud failed');
    }
  },

  loadWater: async () => {
    const today = getTodayDate();
    const local = await storage.getWater(today);
    set({ todayWater: local });

    const userId = getUserId();
    if (userId) {
      try {
        const cloud = await cloudData.getCloudWater(userId, today);
        const merged = Math.max(local, cloud);
        set({ todayWater: merged });
        await storage.setWater(today, merged);
      } catch {
        __DEV__ && console.warn('Sync water from cloud failed');
      }
    }

    // 7-day average (local storage only, minimal)
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      total += await storage.getWater(d);
    }
    set({ water7DayAvg: Math.round(total / 7) });
  },

  addWater: async () => {
    const today = getTodayDate();
    const current = get().todayWater;
    const next = current + GLASSES_ML;
    set({ todayWater: next });
    await storage.setWater(today, next);

    const userId = getUserId();
    if (userId) {
      try {
        await cloudData.saveCloudWater(userId, today, next);
      } catch {
        __DEV__ && console.warn('Sync water to cloud failed');
      }
    }
  },

  // Add meal
  addMeal: async (name: string, proteinGrams: number, mealType: MealType) => {
    const { settings } = get();
    const today = getTodayDate();

    const newMeal: Meal = {
      id: uuidv4(),
      name,
      proteinGrams,
      mealType,
      timestamp: new Date().toISOString(),
    };

    // Save locally first (instant UI update)
    const updatedLog = await storage.addMeal(today, newMeal, settings.dailyProteinGoal);
    set({ todayLog: updatedLog });

    // Sync to cloud
    const userId = getUserId();
    if (userId) {
      try {
        await cloudData.addCloudMeal(userId, newMeal, today);
      } catch (error) {
        __DEV__ && console.warn('Sync meal to cloud failed');
      }
    }
  },

  // Update meal
  updateMeal: async (meal: Meal) => {
    const today = getTodayDate();

    // Update locally
    const updatedLog = await storage.updateMeal(today, meal);
    set({ todayLog: updatedLog });

    // Sync to cloud
    const userId = getUserId();
    if (userId) {
      try {
        await cloudData.updateCloudMeal(meal);
      } catch (error) {
        __DEV__ && console.warn('Sync meal update to cloud failed');
      }
    }
  },

  // Delete meal
  deleteMeal: async (mealId: string) => {
    const today = getTodayDate();

    // Delete locally
    const updatedLog = await storage.deleteMeal(today, mealId);
    set({ todayLog: updatedLog });

    // Sync to cloud
    const userId = getUserId();
    if (userId) {
      try {
        await cloudData.deleteCloudMeal(mealId);
      } catch (error) {
        __DEV__ && console.warn('Sync meal deletion to cloud failed');
      }
    }
  },

  getDailyStats: () => {
    const { todayLog, settings } = get();
    return calculateStats(todayLog, settings.dailyProteinGoal);
  },
}));
