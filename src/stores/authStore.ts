import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import * as auth from '../services/auth';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  // Initialize auth state on app start
  initialize: async () => {
    set({ isLoading: true });
    
    const user = await auth.getCurrentUser();
    set({ 
      user, 
      isAuthenticated: !!user, 
      isLoading: false 
    });

    // Listen for auth changes
    auth.onAuthStateChange((user) => {
      set({ 
        user, 
        isAuthenticated: !!user 
      });
    });
  },

  // Sign up
  signUp: async (email: string, password: string) => {
    const { error } = await auth.signUp(email, password);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  },

  // Sign in
  signIn: async (email: string, password: string) => {
    const { error } = await auth.signIn(email, password);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  },

  // Sign out
  signOut: async () => {
    await auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
