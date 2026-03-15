import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { DailyLog, Meal, MealType } from '../types';
import { RootStackParamList } from '../navigation/types';
import * as storage from '../services/storage';
import * as cloudData from '../services/supabaseData';
import { useAuthStore } from '../stores/authStore';

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export function DayDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'DayDetail'>>();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const date = route.params.date;

  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDayLog();
  }, [date]);

  const loadDayLog = async () => {
    setLoading(true);
    try {
      let dayLog: DailyLog | null = null;
      if (user?.id) {
        dayLog = await cloudData.getCloudDailyLog(user.id, date);
      }
      if (!dayLog) {
        dayLog = await storage.getDailyLog(date);
      }
      setLog(dayLog);
    } catch (error) {
      console.error('Failed to load day log:', error);
      const fallback = await storage.getDailyLog(date);
      setLog(fallback);
    } finally {
      setLoading(false);
    }
  };

  const totalProtein = log?.meals.reduce((sum, m) => sum + m.proteinGrams, 0) ?? 0;
  const goal = log?.goalGrams ?? 150;
  const formattedDate = format(parseISO(date), 'EEEE, MMMM d');

  const renderMeal = ({ item }: { item: Meal }) => (
    <View style={[styles.mealRow, { backgroundColor: colors.surface }]}>
      <View style={styles.mealLeft}>
        <Text style={[styles.mealName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.mealMeta, { color: colors.textSecondary }]}>
          {mealTypeLabels[item.mealType]} • {format(new Date(item.timestamp), 'h:mm a')}
        </Text>
      </View>
      <Text style={[styles.mealProtein, { color: colors.primary }]}>
        {item.proteinGrams}g
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {formattedDate}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
        </View>
      ) : !log || log.meals.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={[styles.emptyText, { color: colors.text }]}>No meals logged</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            This day has no meal entries
          </Text>
        </View>
      ) : (
        <>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total protein</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {totalProtein}g / {goal}g
            </Text>
            <Text style={[styles.summaryPct, { color: totalProtein >= goal ? colors.success : colors.textSecondary }]}>
              {Math.round((totalProtein / goal) * 100)}%
            </Text>
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Meals</Text>
          <FlatList
            data={log.meals}
            keyExtractor={(item) => item.id}
            renderItem={renderMeal}
            contentContainerStyle={styles.list}
          />
        </>
      )}
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
    alignItems: 'center',
    padding: SPACING.md,
  },
  backButton: {
    fontSize: FONT_SIZES.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  summaryCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
  summaryValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
  },
  summaryPct: {
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  mealLeft: {
    flex: 1,
  },
  mealName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  mealMeta: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  mealProtein: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
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
});
