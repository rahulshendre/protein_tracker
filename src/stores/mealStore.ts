/**
 * Meal Store (Zustand)
 * 
 * Syncs with both local storage (offline) and Supabase (cloud).
 * Local storage is the source of truth, Supabase syncs in background.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { DailyLog, DailyStats, Meal, MealType, UserSettings } from '../types';
import * as storage from '../services/storage';
import * as cloudData from '../services/supabaseData';
import { DEFAULTS } from '../constants';
import { useAuthStore } from './authStore';

interface MealStore {
  settings: UserSettings;
  todayLog: DailyLog | null;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  updateGoal: (goal: number) => Promise<void>;
  updateTheme: (theme: 'light' | 'dark') => Promise<void>;

  loadTodayLog: () => Promise<void>;
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
    theme: DEFAULTS.theme,
    createdAt: new Date().toISOString(),
  },
  todayLog: null,
  isLoading: true,

  // Load settings (local + cloud sync)
  loadSettings: async () => {
    try {
      // Load from local first
      const localSettings = await storage.getSettings();
      set({ settings: localSettings });

      // Sync from cloud if logged in
      const userId = getUserId();
      if (userId) {
        const cloudSettings = await cloudData.getCloudSettings(userId);
        if (cloudSettings) {
          set({ settings: cloudSettings });
          await storage.saveSettings(cloudSettings);
        } else {
          // First time - save local settings to cloud
          await cloudData.saveCloudSettings(userId, localSettings);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
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
        console.error('Failed to sync settings to cloud:', error);
      }
    }
  },

  // Update theme
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
        console.error('Failed to sync theme to cloud:', error);
      }
    }
  },

  // Load today's meals
  loadTodayLog: async () => {
    set({ isLoading: true });
    try {
      const today = getTodayDate();
      const userId = getUserId();

      if (userId) {
        // Try cloud first
        const cloudMeals = await cloudData.getCloudMeals(userId, today);
        if (cloudMeals.length > 0) {
          const { settings } = get();
          const log: DailyLog = {
            date: today,
            meals: cloudMeals,
            goalGrams: settings.dailyProteinGoal,
          };
          set({ todayLog: log, isLoading: false });
          // Save to local for offline access
          await storage.saveDailyLog(log);
          return;
        }
      }

      // Fallback to local
      const localLog = await storage.getDailyLog(today);
      set({ todayLog: localLog, isLoading: false });
    } catch (error) {
      console.error('Failed to load today log:', error);
      // Fallback to local on error
      const localLog = await storage.getDailyLog(getTodayDate());
      set({ todayLog: localLog, isLoading: false });
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
        console.error('Failed to sync meal to cloud:', error);
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
        console.error('Failed to sync meal update to cloud:', error);
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
        console.error('Failed to sync meal deletion to cloud:', error);
      }
    }
  },

  getDailyStats: () => {
    const { todayLog, settings } = get();
    return calculateStats(todayLog, settings.dailyProteinGoal);
  },
}));
