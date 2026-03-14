/**
 * Navigation Types
 * 
 * Defines the navigation structure for type-safe navigation.
 */

import { Meal } from '../types';

export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  Register: undefined;
  
  // App screens
  Dashboard: undefined;
  AddMeal: { meal?: Meal } | undefined;
  History: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
