/**
 * Meal Store (Zustand)
 * 
 * WHY ZUSTAND?
 * - Simpler than Redux (no boilerplate, no actions/reducers)
 * - Built-in TypeScript support
 * - Works great with React hooks
 * - Tiny bundle size (~1KB)
 * 
 * HOW IT WORKS:
 * - `create` makes a hook that components use to access/update state
 * - State changes trigger re-renders only in components that use that state
 * - We sync with AsyncStorage for persistence
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { DailyLog, DailyStats, Meal, MealType, UserSettings } from '../types';
import * as storage from '../services/storage';
import { DEFAULTS } from '../constants';

// ============================================
// STORE STATE INTERFACE
// ============================================

interface MealStore {
  // State
  settings: UserSettings;
  todayLog: DailyLog | null;
  isLoading: boolean;
  
  // Actions - Settings
  loadSettings: () => Promise<void>;
  updateGoal: (goal: number) => Promise<void>;
  
  // Actions - Meals
  loadTodayLog: () => Promise<void>;
  addMeal: (name: string, proteinGrams: number, mealType: MealType) => Promise<void>;
  updateMeal: (meal: Meal) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  
  // Computed (getters)
  getDailyStats: () => DailyStats;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

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

// ============================================
// STORE CREATION
// ============================================

export const useMealStore = create<MealStore>((set, get) => ({
  // Initial state
  settings: {
    dailyProteinGoal: DEFAULTS.dailyProteinGoal,
    theme: DEFAULTS.theme,
    createdAt: new Date().toISOString(),
  },
  todayLog: null,
  isLoading: true,
  
  // Load settings from storage
  loadSettings: async () => {
    try {
      const settings = await storage.getSettings();
      set({ settings });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },
  
  // Update daily protein goal
  updateGoal: async (goal: number) => {
    const { settings } = get();
    const newSettings = { ...settings, dailyProteinGoal: goal };
    await storage.saveSettings(newSettings);
    set({ settings: newSettings });
  },
  
  // Load today's meal log
  loadTodayLog: async () => {
    set({ isLoading: true });
    try {
      const today = getTodayDate();
      const log = await storage.getDailyLog(today);
      set({ todayLog: log, isLoading: false });
    } catch (error) {
      console.error('Failed to load today log:', error);
      set({ isLoading: false });
    }
  },
  
  // Add a new meal
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
    
    const updatedLog = await storage.addMeal(today, newMeal, settings.dailyProteinGoal);
    set({ todayLog: updatedLog });
  },
  
  // Update an existing meal
  updateMeal: async (meal: Meal) => {
    const today = getTodayDate();
    const updatedLog = await storage.updateMeal(today, meal);
    set({ todayLog: updatedLog });
  },

  // Delete a meal
  deleteMeal: async (mealId: string) => {
    const today = getTodayDate();
    const updatedLog = await storage.deleteMeal(today, mealId);
    set({ todayLog: updatedLog });
  },
  
  // Get computed stats (not stored, calculated on access)
  getDailyStats: () => {
    const { todayLog, settings } = get();
    return calculateStats(todayLog, settings.dailyProteinGoal);
  },
}));
