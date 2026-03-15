import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { FONT_SIZES, SPACING } from '../constants';
import { LIGHT_COLORS } from '../constants';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💪</Text>
      <Text style={styles.title}>Protein Tracker</Text>
      <ActivityIndicator size="large" color="#FFFFFF" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: SPACING.xl,
  },
  spinner: {
    marginTop: SPACING.lg,
  },
});
