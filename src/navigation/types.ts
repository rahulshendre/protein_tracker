/**
 * Navigation Types
 * 
 * Defines the navigation structure for type-safe navigation.
 */

import { Meal } from '../types';

export type RootStackParamList = {
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
