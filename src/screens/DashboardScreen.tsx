import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { FONT_SIZES, SPACING, GLASSES_ML } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { useMealStore } from '../stores/mealStore';
import { ProgressBar, MealCard, ThemedDialog } from '../components';
import { RootStackParamList } from '../navigation/types';
import { Meal } from '../types';
import { mediumHaptic } from '../utils/haptics';

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { colors, isDark } = useTheme();
  
  const { 
    todayLog, 
    todayWater,
    water7DayAvg,
    settings, 
    syncStatus,
    setSyncStatus,
    loadSettings, 
    loadTodayLog,
    loadWater,
    addWater,
    deleteMeal,
    getDailyStats,
  } = useMealStore();
  
  const stats = getDailyStats();
  const todayFormatted = format(new Date(), 'EEEE, MMMM d');

  // Delete confirmation dialog state
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setSyncStatus('syncing');
    try {
      await Promise.all([loadSettings(), loadTodayLog(), loadWater()]);
      if (useMealStore.getState().syncStatus !== 'offline') setSyncStatus('synced');
    } catch {
      setSyncStatus('offline');
    }
    setRefreshing(false);
  }, [loadSettings, loadTodayLog, loadWater, setSyncStatus]);

  useEffect(() => {
    let mounted = true;
    setSyncStatus('syncing');
    Promise.all([loadSettings(), loadTodayLog(), loadWater()])
      .then(() => {
        if (mounted) {
          const { syncStatus: s } = useMealStore.getState();
          if (s !== 'offline') setSyncStatus('synced');
        }
      })
      .catch(() => { if (mounted) setSyncStatus('offline'); });
    return () => { mounted = false; };
  }, []);
  
  const handleAddMeal = () => {
    navigation.navigate('AddMeal');
  };
  
  const handleEditMeal = (meal: Meal) => {
    navigation.navigate('AddMeal', { meal });
  };

  const handleDeleteMeal = (mealId: string) => {
    setMealToDelete(mealId);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = () => {
    if (mealToDelete) {
      mediumHaptic();
      deleteMeal(mealToDelete);
      setMealToDelete(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Today's Progress</Text>
          <View style={styles.dateRow}>
            <Text style={[styles.date, { color: colors.textSecondary }]}>{todayFormatted}</Text>
            <Text style={[styles.syncBadge, { color: syncStatus === 'synced' ? colors.success : syncStatus === 'offline' ? colors.warning : colors.textSecondary }]}>
              {syncStatus === 'syncing' ? 'Syncing…' : syncStatus === 'synced' ? 'Synced' : syncStatus === 'offline' ? 'Offline' : ''}
            </Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.surface }]} 
            onPress={() => navigation.navigate('Physique')}
          >
            <Text style={styles.headerButtonText}>📷</Text>
          </TouchableOpacity>
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

      {/* Water Section */}
      <View style={[styles.waterSection, { backgroundColor: colors.surface }]}>
        <View style={styles.waterHeader}>
          <Text style={[styles.waterTitle, { color: colors.text }]}>Water</Text>
          <Text style={[styles.waterCount, { color: colors.textSecondary }]}>
            {settings.waterUnit === 'glasses'
              ? `${Math.round(todayWater / GLASSES_ML)} / ${Math.round(settings.dailyWaterGoalMl / GLASSES_ML)} glasses`
              : `${todayWater} / ${settings.dailyWaterGoalMl} ml`}
          </Text>
          <Text style={[styles.water7DayAvg, { color: colors.textSecondary }]}>
            7-day avg: {settings.waterUnit === 'glasses'
              ? `${Math.round(water7DayAvg / GLASSES_ML)} glasses`
              : `${water7DayAvg} ml`}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.waterAddBtn, { backgroundColor: colors.primaryLight }]}
          onPress={() => { mediumHaptic(); addWater(); }}
        >
          <Text style={[styles.waterAddText, { color: colors.primary }]}>
            {settings.waterUnit === 'glasses' ? '+1 glass' : '+250 ml'}
          </Text>
        </TouchableOpacity>
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.emptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={[styles.emptyText, { color: colors.text }]}>No meals logged yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Tap the + button to log your first meal and start hitting your protein goal
            </Text>
          </ScrollView>
        )}
      </View>
      
      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={handleAddMeal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Delete Confirmation Dialog */}
      <ThemedDialog
        visible={deleteDialogVisible}
        title="Delete Meal"
        message="Are you sure you want to delete this meal?"
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete },
        ]}
        onClose={() => setDeleteDialogVisible(false)}
      />
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  date: {
    fontSize: FONT_SIZES.md,
  },
  syncBadge: {
    fontSize: FONT_SIZES.sm,
  },
  progressSection: {
    paddingVertical: SPACING.md,
  },
  waterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  waterHeader: {
    flex: 1,
  },
  waterTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  waterCount: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  water7DayAvg: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  waterAddBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
  },
  waterAddText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
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
