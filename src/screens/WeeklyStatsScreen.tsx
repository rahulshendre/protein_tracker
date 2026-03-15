import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Rect } from 'react-native-svg';
import { format, subDays } from 'date-fns';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { DailyLog } from '../types';
import * as storage from '../services/storage';
import * as cloudData from '../services/supabaseData';
import { useAuthStore } from '../stores/authStore';

const CHART_HEIGHT = 140;
const BAR_WIDTH = 32;
const BAR_GAP = 12;

function getChartWidth() {
  const padding = SPACING.md * 2 + 32; // screen padding + card padding
  return Dimensions.get('window').width - padding;
}

interface DayData {
  date: string;
  totalProtein: number;
  goal: number;
  metGoal: boolean;
}

export function WeeklyStatsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeekData();
  }, []);

  const loadWeekData = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const dates = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));
      const result: DayData[] = [];

      for (const date of dates) {
        let log: DailyLog | null = null;
        if (user?.id) {
          log = await cloudData.getCloudDailyLog(user.id, date);
        }
        if (!log) {
          log = await storage.getDailyLog(date);
        }
        const goal = log?.goalGrams ?? 150;
        const totalProtein = log?.meals.reduce((sum, m) => sum + m.proteinGrams, 0) ?? 0;
        result.push({
          date,
          totalProtein,
          goal,
          metGoal: totalProtein >= goal,
        });
      }
      setDays(result);
    } catch (error) {
      console.error('Failed to load week data:', error);
      setDays([]);
    } finally {
      setLoading(false);
    }
  };

  const avgProtein = days.length
    ? Math.round(days.reduce((sum, d) => sum + d.totalProtein, 0) / days.length)
    : 0;
  const daysMetGoal = days.filter((d) => d.metGoal).length;
  const maxProtein = Math.max(...days.map((d) => d.totalProtein), 1);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>This Week</Text>
        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>{avgProtein}g</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              avg protein per day
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.summaryValue, { color: colors.success }]}>{daysMetGoal}/7</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              days goal met
            </Text>
          </View>

          <Text style={[styles.chartTitle, { color: colors.text }]}>Daily protein</Text>
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <Svg width={getChartWidth()} height={CHART_HEIGHT + 28} style={styles.chartSvg}>
              {days.map((day, i) => {
                const barHeight = Math.max(4, (day.totalProtein / maxProtein) * CHART_HEIGHT);
                const x = 16 + i * (BAR_WIDTH + BAR_GAP);
                const y = CHART_HEIGHT - barHeight + 4;
                return (
                  <Rect
                    key={day.date}
                    x={x}
                    y={y}
                    width={BAR_WIDTH}
                    height={barHeight}
                    rx={6}
                    fill={day.metGoal ? colors.success : colors.primary}
                  />
                );
              })}
            </Svg>
            <View style={styles.chartLabels}>
              {days.map((day) => (
                <View key={day.date} style={styles.chartLabelSlot}>
                  <Text
                    style={[styles.chartLabel, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {format(new Date(day.date), 'EEE')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
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
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  scroll: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  summaryCard: {
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  chartTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  chartCard: {
    borderRadius: 12,
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  chartSvg: {
    marginBottom: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    paddingLeft: 16,
  },
  chartLabelSlot: {
    width: BAR_WIDTH + BAR_GAP,
    alignItems: 'center',
  },
  chartLabel: {
    fontSize: FONT_SIZES.xs,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
  },
});
