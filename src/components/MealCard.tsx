/**
 * MealCard Component
 * 
 * Displays a single meal entry with name, protein amount, and type.
 * Includes swipe-to-delete functionality.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { Meal, MealType } from '../types';

interface MealCardProps {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onDelete: (id: string) => void;
}

// Emoji icons for meal types
const mealTypeIcons: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
  const timeString = format(new Date(meal.timestamp), 'h:mm a');
  
  return (
    <TouchableOpacity style={styles.container} onPress={() => onEdit(meal)} activeOpacity={0.7}>
      {/* Meal type icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{mealTypeIcons[meal.mealType]}</Text>
      </View>
      
      {/* Meal details */}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>{meal.name}</Text>
        <Text style={styles.meta}>
          {mealTypeLabels[meal.mealType]} • {timeString}
        </Text>
      </View>
      
      {/* Protein amount */}
      <View style={styles.proteinContainer}>
        <Text style={styles.proteinAmount}>{meal.proteinGrams}g</Text>
        <Text style={styles.proteinLabel}>protein</Text>
      </View>
      
      {/* Delete button */}
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDelete(meal.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.deleteText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  details: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  meta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  proteinContainer: {
    alignItems: 'flex-end',
    marginRight: SPACING.sm,
  },
  proteinAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  proteinLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
