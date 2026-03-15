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
import Svg, { Line, Circle, Path, Text as SvgText } from 'react-native-svg';
import { format, subDays } from 'date-fns';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';
import * as storage from '../services/storage';
import * as cloudData from '../services/supabaseData';
import { useAuthStore } from '../stores/authStore';
import { useMealStore } from '../stores/mealStore';

const CHART_PLOT_HEIGHT = 120;
const PADDING_LEFT = 32;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 28;
const PADDING_RIGHT = 12;
const CHART_SVG_HEIGHT = PADDING_TOP + CHART_PLOT_HEIGHT + PADDING_BOTTOM;

function getChartWidth() {
  const padding = SPACING.md * 2 + 32;
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
  const { settings } = useMealStore();
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeekData();
  }, []);

  const loadWeekData = async () => {
    setLoading(true);
    const dates = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));
    const startDate = dates[0];
    const endDate = dates[6];
    const goal = settings.dailyProteinGoal || 150;

    try {
      if (user?.id) {
        const weekMeals = await cloudData.getCloudMealsForDateRange(user.id, startDate, endDate);
        const totalByDate: Record<string, number> = {};
        for (const date of dates) totalByDate[date] = 0;
        for (const m of weekMeals) {
          totalByDate[m.date] = (totalByDate[m.date] ?? 0) + m.proteinGrams;
        }
        const result: DayData[] = dates.map((date) => {
          const totalProtein = totalByDate[date] ?? 0;
          return { date, totalProtein, goal, metGoal: totalProtein >= goal };
        });
        setDays(result);
        setLoading(false);
        return;
      }

      const result: DayData[] = [];
      for (const date of dates) {
        const log = await storage.getDailyLog(date);
        const totalProtein = log?.meals.reduce((sum, m) => sum + m.proteinGrams, 0) ?? 0;
        const dayGoal = log?.goalGrams ?? goal;
        result.push({ date, totalProtein, goal: dayGoal, metGoal: totalProtein >= dayGoal });
      }
      setDays(result);
    } catch (error) {
      console.error('Failed to load week data:', error);
      const result: DayData[] = [];
      for (const date of dates) {
        const log = await storage.getDailyLog(date);
        const totalProtein = log?.meals.reduce((sum, m) => sum + m.proteinGrams, 0) ?? 0;
        result.push({ date, totalProtein, goal, metGoal: totalProtein >= goal });
      }
      setDays(result);
    } finally {
      setLoading(false);
    }
  };

  const avgProtein = days.length
    ? Math.round(days.reduce((sum, d) => sum + d.totalProtein, 0) / days.length)
    : 0;
  const daysMetGoal = days.filter((d) => d.metGoal).length;
  const maxProtein = Math.max(...days.map((d) => d.totalProtein), 1);
  const maxY = Math.max(maxProtein, 150);
  const chartWidth = getChartWidth();
  const plotWidth = chartWidth - PADDING_LEFT - PADDING_RIGHT;

  const points = days.map((day, i) => {
    const x = PADDING_LEFT + (i / 6) * plotWidth;
    const y = PADDING_TOP + CHART_PLOT_HEIGHT - (day.totalProtein / maxY) * CHART_PLOT_HEIGHT;
    return { x, y, ...day };
  });

  const pathD = points.length
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';

  const yAxisX = PADDING_LEFT;
  const xAxisY = PADDING_TOP + CHART_PLOT_HEIGHT;
  const yStep = maxY <= 100 ? 25 : 50;
  const yTicks = [0, ...Array.from({ length: Math.ceil(maxY / yStep) }, (_, i) => (i + 1) * yStep)].filter((v) => v <= maxY);
  if (yTicks[yTicks.length - 1] !== maxY) yTicks.push(maxY);

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
            <Svg width={chartWidth} height={CHART_SVG_HEIGHT} style={styles.chartSvg}>
              {/* Y axis */}
              <Line
                x1={yAxisX}
                y1={PADDING_TOP}
                x2={yAxisX}
                y2={xAxisY}
                stroke={colors.border}
                strokeWidth={1}
              />
              {/* X axis */}
              <Line
                x1={yAxisX}
                y1={xAxisY}
                x2={PADDING_LEFT + plotWidth}
                y2={xAxisY}
                stroke={colors.border}
                strokeWidth={1}
              />
              {/* Y axis grid lines and labels */}
              {yTicks.map((tick) => {
                const y = xAxisY - (tick / maxY) * CHART_PLOT_HEIGHT;
                return (
                  <React.Fragment key={tick}>
                    <Line x1={yAxisX} y1={y} x2={PADDING_LEFT + plotWidth} y2={y} stroke={colors.border} strokeWidth={1} strokeDasharray="4,2" opacity={0.6} />
                    <SvgText x={yAxisX - 6} y={y + 4} fill={colors.textSecondary} fontSize={10} textAnchor="end">
                      {tick}
                    </SvgText>
                  </React.Fragment>
                );
              })}
              {/* X axis labels (day names) */}
              {points.map((p, i) => (
                <SvgText
                  key={p.date}
                  x={p.x}
                  y={xAxisY + 18}
                  fill={colors.textSecondary}
                  fontSize={10}
                  textAnchor="middle"
                >
                  {format(new Date(p.date), 'EEE')}
                </SvgText>
              ))}
              {/* Line connecting points */}
              {pathD ? (
                <Path d={pathD} stroke={colors.primary} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ) : null}
              {/* Dots at each point */}
              {points.map((p) => (
                <Circle
                  key={p.date}
                  cx={p.x}
                  cy={p.y}
                  r={5}
                  fill={p.metGoal ? colors.success : colors.primary}
                  stroke={colors.surface}
                  strokeWidth={2}
                />
              ))}
            </Svg>
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
    alignSelf: 'center',
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
