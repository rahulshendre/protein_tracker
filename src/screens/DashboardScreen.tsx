/**
 * Dashboard Screen
 * 
 * Main screen showing today's protein progress and meal list.
 * Features:
 * - Circular progress bar with percentage
 * - List of today's meals
 * - FAB to add new meal
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { useMealStore } from '../stores/mealStore';
import { ProgressBar } from '../components/ProgressBar';
import { MealCard } from '../components/MealCard';
import { RootStackParamList } from '../navigation/types';

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  
  // Get state and actions from store
  const { 
    todayLog, 
    settings, 
    isLoading,
    loadSettings, 
    loadTodayLog, 
    deleteMeal,
    getDailyStats,
  } = useMealStore();
  
  const stats = getDailyStats();
  const todayFormatted = format(new Date(), 'EEEE, MMMM d');
  
  // Load data on mount
  useEffect(() => {
    loadSettings();
    loadTodayLog();
  }, []);
  
  const handleAddMeal = () => {
    navigation.navigate('AddMeal');
  };
  
  const handleDeleteMeal = (mealId: string) => {
    deleteMeal(mealId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Today's Progress</Text>
        <Text style={styles.date}>{todayFormatted}</Text>
      </View>
      
      {/* Progress Section */}
      <View style={styles.progressSection}>
        <ProgressBar
          percentage={stats.percentComplete}
          consumed={stats.totalProtein}
          goal={settings.dailyProteinGoal}
        />
      </View>
      
      {/* Meals Section */}
      <View style={styles.mealsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <Text style={styles.mealCount}>{stats.mealsCount} meals</Text>
        </View>
        
        {todayLog?.meals && todayLog.meals.length > 0 ? (
          <FlatList
            data={todayLog.meals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MealCard meal={item} onDelete={handleDeleteMeal} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mealsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>No meals logged yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first meal
            </Text>
          </View>
        )}
      </View>
      
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddMeal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  greeting: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  date: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  progressSection: {
    paddingVertical: SPACING.md,
  },
  mealsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  mealCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  mealsList: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: COLORS.textLight,
    fontWeight: '300',
    marginTop: -2,
  },
});
