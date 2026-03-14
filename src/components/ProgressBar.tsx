/**
 * ProgressBar Component
 * 
 * Circular progress indicator showing protein intake progress.
 * Shows percentage in the center with consumed/goal below.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

interface ProgressBarProps {
  percentage: number;      // 0-100
  consumed: number;        // grams consumed
  goal: number;            // goal in grams
}

export function ProgressBar({ percentage, consumed, goal }: ProgressBarProps) {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  
  // Calculate stroke properties for circular progress
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (clampedPercentage / 100) * circumference;
  
  // Color changes based on progress
  const getProgressColor = () => {
    if (clampedPercentage >= 100) return COLORS.success;
    if (clampedPercentage >= 70) return COLORS.primary;
    if (clampedPercentage >= 40) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <View style={styles.container}>
      {/* SVG-like circular progress using Views */}
      <View style={styles.progressContainer}>
        {/* Background circle */}
        <View style={[styles.circle, styles.backgroundCircle]} />
        
        {/* Progress arc - simplified with a colored border */}
        <View 
          style={[
            styles.circle, 
            styles.progressCircle,
            { 
              borderColor: getProgressColor(),
              transform: [{ rotate: '-90deg' }],
            }
          ]} 
        />
        
        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={styles.percentageText}>{clampedPercentage}%</Text>
          <Text style={styles.consumedText}>
            {consumed}g / {goal}g
          </Text>
        </View>
      </View>
      
      {/* Status text */}
      <Text style={styles.statusText}>
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
  backgroundCircle: {
    borderColor: COLORS.border,
  },
  progressCircle: {
    borderColor: COLORS.primary,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  centerContent: {
    alignItems: 'center',
  },
  percentageText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  consumedText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});
