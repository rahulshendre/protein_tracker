/**
 * Navigation Types
 * 
 * Defines the navigation structure for type-safe navigation.
 */

export type RootStackParamList = {
  Dashboard: undefined;
  AddMeal: undefined;
  History: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
