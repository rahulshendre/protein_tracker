/**
 * Protein Tracker App
 * 
 * Main entry point that sets up navigation and providers.
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DashboardScreen } from './src/screens/DashboardScreen';
import { AddMealScreen } from './src/screens/AddMealScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { RootStackParamList } from './src/navigation/types';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { STORAGE_KEYS } from './src/constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen 
        name="AddMeal" 
        component={AddMealScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    const hasLaunched = await AsyncStorage.getItem('@protein_tracker/has_launched');
    setIsFirstLaunch(hasLaunched === null);
  };

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('@protein_tracker/has_launched', 'true');
    setIsFirstLaunch(false);
  };

  if (isFirstLaunch === null) {
    return null; // Loading
  }

  if (isFirstLaunch) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
