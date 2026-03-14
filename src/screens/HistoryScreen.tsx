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
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { DailyLog } from '../types';
import * as storage from '../services/storage';

interface HistoryItem {
  date: string;
  log: DailyLog | null;
}

export function HistoryScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const dates = await storage.getHistoryDates();
    const items: HistoryItem[] = [];
    
    for (const date of dates.slice(0, 30)) {
      const log = await storage.getDailyLog(date);
      items.push({ date, log });
    }
    
    setHistory(items);
    setLoading(false);
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
      <View style={[styles.historyCard, { backgroundColor: colors.surface }]}>
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
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>History</Text>
        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.text }]}>Loading...</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={[styles.emptyText, { color: colors.text }]}>No history yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Start logging meals to see your history
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  backButton: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  list: {
    padding: SPACING.md,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
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
    color: COLORS.text,
  },
  mealsCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsSection: {
    alignItems: 'flex-end',
  },
  proteinText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  goalMet: {
    color: COLORS.success,
  },
  goalMissed: {
    color: COLORS.textSecondary,
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
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
