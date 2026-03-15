import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';

const SIZE = 180;
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ANIM_DURATION = 600;

interface ProgressBarProps {
  percentage: number;
  consumed: number;
  goal: number;
}

export function ProgressBar({ percentage, consumed, goal }: ProgressBarProps) {
  const { colors } = useTheme();
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const animatedValue = useRef(new Animated.Value(CIRCUMFERENCE)).current;
  const [strokeOffset, setStrokeOffset] = useState(CIRCUMFERENCE);
  const goalReachedScale = useRef(new Animated.Value(1)).current;
  const prevPercent = useRef(clampedPercentage);

  const getProgressColor = () => {
    if (clampedPercentage >= 100) return colors.success;
    if (clampedPercentage >= 70) return colors.primary;
    if (clampedPercentage >= 40) return colors.warning;
    return colors.error;
  };

  useEffect(() => {
    const targetOffset = CIRCUMFERENCE - (clampedPercentage / 100) * CIRCUMFERENCE;
    Animated.timing(animatedValue, {
      toValue: targetOffset,
      duration: ANIM_DURATION,
      useNativeDriver: false,
    }).start();
  }, [clampedPercentage]);

  useEffect(() => {
    const id = animatedValue.addListener(({ value }) => setStrokeOffset(value));
    return () => animatedValue.removeListener(id);
  }, []);

  useEffect(() => {
    if (clampedPercentage >= 100 && prevPercent.current < 100) {
      Animated.sequence([
        Animated.timing(goalReachedScale, {
          toValue: 1.2,
          duration: 180,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(goalReachedScale, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ]).start();
    }
    prevPercent.current = clampedPercentage;
  }, [clampedPercentage]);

  return (
    <View style={styles.container}>
      <View style={styles.ringWrapper}>
        <Svg width={SIZE} height={SIZE} style={styles.svg}>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={colors.border}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={getProgressColor()}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeOffset}
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
      {clampedPercentage >= 100 ? (
        <Animated.Text
          style={[
            styles.statusText,
            { color: colors.success, fontWeight: '700' },
            { transform: [{ scale: goalReachedScale }] },
          ]}
        >
          🎉 Goal reached!
        </Animated.Text>
      ) : (
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>
          {goal - consumed}g remaining
        </Text>
      )}
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
