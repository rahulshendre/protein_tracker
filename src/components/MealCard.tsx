import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { Meal, MealType } from '../types';

interface MealCardProps {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onDelete: (id: string) => void;
}

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
  const { colors } = useTheme();
  const timeString = format(new Date(meal.timestamp), 'h:mm a');
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.surface }]} 
      onPress={() => onEdit(meal)} 
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
        <Text style={styles.icon}>{mealTypeIcons[meal.mealType]}</Text>
      </View>
      
      <View style={styles.details}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {meal.name}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {mealTypeLabels[meal.mealType]} • {timeString}
        </Text>
      </View>
      
      <View style={styles.proteinContainer}>
        <Text style={[styles.proteinAmount, { color: colors.primary }]}>
          {meal.proteinGrams}g
        </Text>
        <Text style={[styles.proteinLabel, { color: colors.textSecondary }]}>
          protein
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.deleteButton, { backgroundColor: colors.border }]}
        onPress={() => onDelete(meal.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.deleteText, { color: colors.textSecondary }]}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  meta: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  proteinContainer: {
    alignItems: 'flex-end',
    marginRight: SPACING.sm,
  },
  proteinAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  proteinLabel: {
    fontSize: FONT_SIZES.xs,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
