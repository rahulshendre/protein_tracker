/**
 * AddMeal Screen
 * 
 * Form to add a new meal entry.
 * - Meal name input
 * - Protein amount input
 * - Meal type selector
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { useMealStore } from '../stores/mealStore';
import { MealType } from '../types';

const mealTypes: { type: MealType; label: string; icon: string }[] = [
  { type: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { type: 'lunch', label: 'Lunch', icon: '☀️' },
  { type: 'dinner', label: 'Dinner', icon: '🌙' },
  { type: 'snack', label: 'Snack', icon: '🍎' },
];

export function AddMealScreen() {
  const navigation = useNavigation();
  const addMeal = useMealStore((state) => state.addMeal);
  
  const [name, setName] = useState('');
  const [protein, setProtein] = useState('');
  const [selectedType, setSelectedType] = useState<MealType>('lunch');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a meal name');
      return;
    }
    
    const proteinValue = parseFloat(protein);
    if (isNaN(proteinValue) || proteinValue <= 0) {
      Alert.alert('Invalid Protein', 'Please enter a valid protein amount');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addMeal(name.trim(), proteinValue, selectedType);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Add Meal</Text>
            <View style={{ width: 60 }} />
          </View>
          
          {/* Form */}
          <View style={styles.form}>
            {/* Meal Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Meal Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Chicken Breast, Protein Shake"
                placeholderTextColor={COLORS.disabled}
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>
            
            {/* Protein Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Protein (grams)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 25"
                placeholderTextColor={COLORS.disabled}
                value={protein}
                onChangeText={setProtein}
                keyboardType="decimal-pad"
              />
            </View>
            
            {/* Meal Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Meal Type</Text>
              <View style={styles.typeGrid}>
                {mealTypes.map((item) => (
                  <TouchableOpacity
                    key={item.type}
                    style={[
                      styles.typeButton,
                      selectedType === item.type && styles.typeButtonSelected,
                    ]}
                    onPress={() => setSelectedType(item.type)}
                  >
                    <Text style={styles.typeIcon}>{item.icon}</Text>
                    <Text 
                      style={[
                        styles.typeLabel,
                        selectedType === item.type && styles.typeLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Saving...' : 'Add Meal'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  cancelButton: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  typeButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  typeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  typeLabelSelected: {
    color: COLORS.primaryDark,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textLight,
  },
});
