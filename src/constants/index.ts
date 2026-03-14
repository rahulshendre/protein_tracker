/**
 * App-wide constants
 * 
 * Centralized place for colors, sizes, and configuration.
 * Makes it easy to maintain consistent styling and change values globally.
 */

// Color palette
export const COLORS = {
  primary: '#4CAF50',       // Green - represents health/protein
  primaryDark: '#388E3C',
  primaryLight: '#C8E6C9',
  
  secondary: '#2196F3',     // Blue - accent color
  
  background: '#F5F5F5',
  surface: '#FFFFFF',
  
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  
  border: '#E0E0E0',
  disabled: '#BDBDBD',
};

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

// Default settings for new users
export const DEFAULTS = {
  dailyProteinGoal: 150,  // 150g is common fitness goal
  theme: 'light' as const,
};

// Storage keys for AsyncStorage
export const STORAGE_KEYS = {
  SETTINGS: '@protein_tracker/settings',
  DAILY_LOG_PREFIX: '@protein_tracker/daily/',  // + YYYY-MM-DD
  HISTORY_INDEX: '@protein_tracker/history',
};
