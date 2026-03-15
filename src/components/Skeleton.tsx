import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../constants';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: object;
  borderRadius?: number;
}

export function Skeleton({
  width = '100%',
  height = 16,
  style,
  borderRadius = 6,
}: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function HistorySkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.row}>
        <Skeleton width={120} height={18} />
        <Skeleton width={60} height={14} style={{ marginTop: 4 }} />
      </View>
      <View style={[styles.stats, { borderLeftColor: colors.border }]}>
        <Skeleton width={70} height={16} />
        <Skeleton width={36} height={14} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {},
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  row: {
    flex: 1,
  },
  stats: {
    alignItems: 'flex-end',
    borderLeftWidth: 1,
    paddingLeft: SPACING.md,
  },
});
