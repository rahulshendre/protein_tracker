/**
 * Protein Tracker App
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DashboardScreen } from './src/screens/DashboardScreen';
import { AddMealScreen } from './src/screens/AddMealScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { RootStackParamList } from './src/navigation/types';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useAuthStore } from './src/stores/authStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Auth screens (Login, Register)
function AuthNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Main app screens
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
  const { colors } = useTheme();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      checkOnboarding();
    }
  }, [isAuthenticated]);

  const checkOnboarding = async () => {
    const hasOnboarded = await AsyncStorage.getItem('@protein_tracker/has_onboarded');
    setNeedsOnboarding(hasOnboarded === null);
  };

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('@protein_tracker/has_onboarded', 'true');
    setNeedsOnboarding(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Not logged in -> show auth screens
  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  // Logged in but needs onboarding
  if (needsOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (needsOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Logged in and onboarded -> show main app
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
