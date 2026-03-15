/**
 * Protein Tracker App
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Linking } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
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
import { ResetPasswordScreen } from './src/screens/ResetPasswordScreen';
import { RootStackParamList } from './src/navigation/types';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useAuthStore } from './src/stores/authStore';
import { supabase } from './src/services/supabase';

// Deep linking configuration
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['proteintracker://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
      Login: 'login',
    },
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Auth screens (Login, Register, ResetPassword)
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
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
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
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    initialize();
    handleDeepLink();
  }, []);

  const handleDeepLink = async () => {
    const handleUrl = async (url: string | null) => {
      if (!url) return;
      
      // Check if this is a password reset link
      // Supabase sends: proteintracker://reset-password#access_token=...&type=recovery
      if (url.includes('type=recovery') || url.includes('reset-password')) {
        // Extract the hash fragment
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          const hash = url.substring(hashIndex + 1);
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (accessToken) {
            // Set the session with the tokens from the URL
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            setShowResetPassword(true);
          }
        }
      }
    };

    // Handle initial URL (app opened via deep link)
    const initialUrl = await Linking.getInitialURL();
    await handleUrl(initialUrl);

    // Listen for URL changes while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => subscription.remove();
  };

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

  // Show password reset screen if opened via deep link
  if (showResetPassword) {
    return (
      <NavigationContainer linking={linking}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Not logged in -> show auth screens
  if (!isAuthenticated) {
    return (
      <NavigationContainer linking={linking}>
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
