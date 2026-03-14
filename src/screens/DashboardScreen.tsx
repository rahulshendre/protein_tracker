import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { useMealStore } from '../stores/mealStore';
import { ProgressBar } from '../components/ProgressBar';
import { MealCard } from '../components/MealCard';
import { RootStackParamList } from '../navigation/types';
import { Meal } from '../types';

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { colors, isDark } = useTheme();
  
  const { 
    todayLog, 
    settings, 
    loadSettings, 
    loadTodayLog, 
    deleteMeal,
    getDailyStats,
  } = useMealStore();
  
  const stats = getDailyStats();
  const todayFormatted = format(new Date(), 'EEEE, MMMM d');
  
  useEffect(() => {
    loadSettings();
    loadTodayLog();
  }, []);
  
  const handleAddMeal = () => {
    navigation.navigate('AddMeal');
  };
  
  const handleEditMeal = (meal: Meal) => {
    navigation.navigate('AddMeal', { meal });
  };

  const handleDeleteMeal = (mealId: string) => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMeal(mealId) },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Today's Progress</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{todayFormatted}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.surface }]} 
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.headerButtonText}>📅</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.headerButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Meals</Text>
          <Text style={[styles.mealCount, { color: colors.textSecondary }]}>{stats.mealsCount} meals</Text>
        </View>
        
        {todayLog?.meals && todayLog.meals.length > 0 ? (
          <FlatList
            data={todayLog.meals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MealCard meal={item} onEdit={handleEditMeal} onDelete={handleDeleteMeal} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mealsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={[styles.emptyText, { color: colors.text }]}>No meals logged yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Tap the + button to add your first meal
            </Text>
          </View>
        )}
      </View>
      
      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={handleAddMeal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 18,
  },
  greeting: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  date: {
    fontSize: FONT_SIZES.md,
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
  },
  mealCount: {
    fontSize: FONT_SIZES.sm,
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
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
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
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
});
