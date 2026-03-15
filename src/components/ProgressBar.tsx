import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';

const SIZE = 180;
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CENTER = SIZE / 2;

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

  // Circle circumference; stroke draws from 3 o'clock, so we offset to start from top
  const circumference = 2 * Math.PI * RADIUS;
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={styles.ringWrapper}>
        <Svg width={SIZE} height={SIZE} style={styles.svg}>
          {/* Background ring */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={colors.border}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          {/* Progress ring */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={getProgressColor()}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
        </Svg>
        <View style={styles.centerContent} pointerEvents="none">
          <Text style={[styles.percentageText, { color: colors.text }]}>
            {Math.round(clampedPercentage)}%
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
  ringWrapper: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
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
