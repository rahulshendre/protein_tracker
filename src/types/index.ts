/**
 * Core data types for Protein Tracker
 * 
 * These interfaces define the structure of all data in the app.
 * TypeScript will enforce these shapes throughout the codebase,
 * catching errors at compile time rather than runtime.
 */

// Meal types for categorization
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// A single meal entry
export interface Meal {
  id: string;              // Unique identifier (UUID)
  name: string;            // e.g., "Chicken Breast", "Protein Shake"
  proteinGrams: number;    // Amount of protein in grams
  mealType: MealType;      // Category of the meal
  timestamp: string;       // ISO 8601 date string (when meal was logged)
}

// Daily log containing all meals for a single day
export interface DailyLog {
  date: string;            // Format: YYYY-MM-DD
  meals: Meal[];           // All meals logged that day
  goalGrams: number;       // Protein goal for that day (snapshot)
}

// User preferences and settings
export interface UserSettings {
  dailyProteinGoal: number;  // Default daily goal in grams
  theme: 'light' | 'dark';   // UI theme preference
  createdAt: string;         // When user first opened app
}

// Computed stats for display (not stored, calculated on the fly)
export interface DailyStats {
  totalProtein: number;      // Sum of all meal proteins
  remainingProtein: number;  // Goal minus total
  percentComplete: number;   // 0-100 percentage
  mealsCount: number;        // Number of meals logged
}
