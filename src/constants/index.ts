/**
 * App-wide constants
 * 
 * Centralized place for colors, sizes, and configuration.
 * Makes it easy to maintain consistent styling and change values globally.
 */

// Light theme - Matching app icon blue (#05AAF4)
export const LIGHT_COLORS = {
  primary: '#05AAF4',           // Icon blue - main brand color
  primaryDark: '#0288D1',       // Darker blue
  primaryLight: '#B3E5FC',      // Light blue
  secondary: '#4FC3F7',         // Secondary water blue
  background: '#F5FAFD',        // Light blue-tinted background
  surface: '#FFFFFF',
  text: '#1A2E3B',              // Dark blue-gray text
  textSecondary: '#607D8B',     // Muted blue-gray
  textLight: '#FFFFFF',
  success: '#66BB6A',           // Green
  warning: '#FFB74D',           // Amber
  error: '#EF5350',             // Red
  border: '#B3E5FC',            // Light blue border
  disabled: '#90A4AE',
};

// Dark theme - Matching app icon blue
export const DARK_COLORS = {
  primary: '#29B6F6',           // Lighter blue for dark mode
  primaryDark: '#05AAF4',
  primaryLight: '#01579B',      // Dark blue
  secondary: '#4FC3F7',         // Water blue
  background: '#0A1520',        // Very dark blue
  surface: '#122330',           // Dark blue surface
  text: '#E1F5FE',              // Light blue-white text
  textSecondary: '#81D4FA',     // Muted light blue
  textLight: '#FFFFFF',
  success: '#81C784',
  warning: '#FFB74D',
  error: '#EF5350',
  border: '#1E3A4A',            // Dark blue border
  disabled: '#546E7A',
};

// Default export (light theme) - will be overridden by context
export const COLORS = LIGHT_COLORS;

// Spacing scale (multiples of 4 for consistency)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Font sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

// 1 glass = 250 ml (standard)
export const GLASSES_ML = 250;

// Default settings for new users
export const DEFAULTS = {
  dailyProteinGoal: 150,
  dailyWaterGoalMl: 3000,  // 12 glasses
  waterUnit: 'ml' as const,
  theme: 'light' as const,
  reminderEnabled: false,
  reminderTimes: ['08:00', '13:00', '20:00'] as [string, string, string],
};

// Storage keys for AsyncStorage
export const STORAGE_KEYS = {
  SETTINGS: '@protein_tracker/settings',
  DAILY_LOG_PREFIX: '@protein_tracker/daily/',  // + YYYY-MM-DD
  WATER_PREFIX: '@protein_tracker/water/',      // + YYYY-MM-DD
  HISTORY_INDEX: '@protein_tracker/history',
};
