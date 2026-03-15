/**
 * Navigation Types
 * 
 * Defines the navigation structure for type-safe navigation.
 */

import { Meal, PhysiqueEntry } from '../types';

export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
  
  // App screens
  Dashboard: undefined;
  AddMeal: { meal?: Meal } | undefined;
  History: undefined;
  DayDetail: { date: string };
  WeeklyStats: undefined;
  Settings: undefined;
  Physique: undefined;
  AddPhysique: undefined;
  PhysiqueDetail: { entry: PhysiqueEntry };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
