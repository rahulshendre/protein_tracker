import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';

interface ProgressBarProps {
  percentage: number;
  consumed: number;
  goal: number;
}

export function ProgressBar({ percentage, consumed, goal }: ProgressBarProps) {
  const { colors } = useTheme();
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const getProgressColor = () => {
    if (clampedPercentage >= 100) return colors.success;
    if (clampedPercentage >= 70) return colors.primary;
    if (clampedPercentage >= 40) return colors.warning;
    return colors.error;
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.circle, { borderColor: colors.border }]} />
        <View 
          style={[
            styles.circle, 
            styles.progressCircle,
            { 
              borderColor: getProgressColor(),
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
            }
          ]} 
        />
        <View style={styles.centerContent}>
          <Text style={[styles.percentageText, { color: colors.text }]}>
            {clampedPercentage}%
          </Text>
          <Text style={[styles.consumedText, { color: colors.textSecondary }]}>
            {consumed}g / {goal}g
          </Text>
        </View>
      </View>
      <Text style={[styles.statusText, { color: colors.textSecondary }]}>
        {clampedPercentage >= 100 
          ? '🎉 Goal reached!' 
          : `${goal - consumed}g remaining`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  progressContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
  },
  progressCircle: {
    transform: [{ rotate: '-90deg' }],
  },
  centerContent: {
    alignItems: 'center',
  },
  percentageText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
  },
  consumedText: {
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.md,
  },
});
