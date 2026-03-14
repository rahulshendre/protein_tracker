import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { LIGHT_COLORS, DARK_COLORS } from '../constants';
import { useMealStore } from '../stores/mealStore';

type Theme = 'light' | 'dark';
type Colors = typeof LIGHT_COLORS;

interface ThemeContextType {
  theme: Theme;
  colors: Colors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateTheme } = useMealStore();
  const systemTheme = useColorScheme();
  
  const theme = settings.theme || 'light';
  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const isDark = theme === 'dark';

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    await updateTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
