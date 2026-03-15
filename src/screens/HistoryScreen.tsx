import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { DailyLog } from '../types';
import * as storage from '../services/storage';
import * as cloudData from '../services/supabaseData';
import { useAuthStore } from '../stores/authStore';
import { HistorySkeleton } from '../components/Skeleton';

interface HistoryItem {
  date: string;
  log: DailyLog | null;
}

export function HistoryScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      let dates: string[] = [];
      
      // Try cloud first if logged in
      if (user?.id) {
        dates = await cloudData.getCloudHistory(user.id, 30);
      }
      
      // Fallback to local
      if (dates.length === 0) {
        dates = await storage.getHistoryDates();
      }

      const items: HistoryItem[] = [];
      for (const date of dates.slice(0, 30)) {
        let log: DailyLog | null = null;
        
        if (user?.id) {
          log = await cloudData.getCloudDailyLog(user.id, date);
        }
        
        if (!log) {
          log = await storage.getDailyLog(date);
        }
        
        items.push({ date, log });
      }

      setHistory(items);
    } catch (error) {
      console.error('Failed to load history:', error);
      // Fallback to local only
      const dates = await storage.getHistoryDates();
      const items: HistoryItem[] = [];
      for (const date of dates.slice(0, 30)) {
        const log = await storage.getDailyLog(date);
        items.push({ date, log });
      }
      setHistory(items);
    } finally {
      setLoading(false);
    }
  };

  const getTotalProtein = (log: DailyLog | null) => {
    if (!log) return 0;
    return log.meals.reduce((sum, m) => sum + m.proteinGrams, 0);
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const total = getTotalProtein(item.log);
    const goal = item.log?.goalGrams || 150;
    const percent = Math.round((total / goal) * 100);
    const metGoal = percent >= 100;

    return (
      <TouchableOpacity
        style={[styles.historyCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('DayDetail', { date: item.date })}
        activeOpacity={0.7}
      >
        <View style={styles.dateSection}>
          <Text style={[styles.dateText, { color: colors.text }]}>
            {format(parseISO(item.date), 'EEE, MMM d')}
          </Text>
          <Text style={[styles.mealsCount, { color: colors.textSecondary }]}>
            {item.log?.meals.length || 0} meals
          </Text>
        </View>
        
        <View style={styles.statsSection}>
          <Text style={[styles.proteinText, { color: metGoal ? colors.success : colors.text }]}>
            {total}g / {goal}g
          </Text>
          <Text style={[styles.statusText, { color: metGoal ? colors.success : colors.textSecondary }]}>
            {metGoal ? '✓ Goal met' : `${percent}%`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>History</Text>
        <TouchableOpacity onPress={() => navigation.navigate('WeeklyStats')}>
          <Text style={[styles.weekButton, { color: colors.primary }]}>Week</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <HistorySkeleton key={i} />
          ))}
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={[styles.emptyText, { color: colors.text }]}>No history yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Log meals on the dashboard and they'll show up here by day
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.date}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
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
  weekButton: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  list: {
    padding: SPACING.md,
  },
  skeletonContainer: {
    padding: SPACING.md,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  dateSection: {
    flex: 1,
  },
  dateText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  mealsCount: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  statsSection: {
    alignItems: 'flex-end',
  },
  proteinText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.xs,
  },
});
