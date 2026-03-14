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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { useMealStore } from '../stores/mealStore';
import { MealType } from '../types';
import { RootStackParamList } from '../navigation/types';

const mealTypes: { type: MealType; label: string; icon: string }[] = [
  { type: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { type: 'lunch', label: 'Lunch', icon: '☀️' },
  { type: 'dinner', label: 'Dinner', icon: '🌙' },
  { type: 'snack', label: 'Snack', icon: '🍎' },
];

const quickPresets = [
  { name: 'Chicken Breast', protein: 31, icon: '🍗' },
  { name: 'Eggs (2)', protein: 12, icon: '🥚' },
  { name: 'Protein Shake', protein: 25, icon: '🥤' },
  { name: 'Greek Yogurt', protein: 17, icon: '🥛' },
  { name: 'Salmon', protein: 25, icon: '🐟' },
  { name: 'Tofu', protein: 20, icon: '🧈' },
];

export function AddMealScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'AddMeal'>>();
  const editingMeal = route.params?.meal;
  const isEditing = !!editingMeal;
  
  const { addMeal, updateMeal } = useMealStore();
  
  const [name, setName] = useState(editingMeal?.name || '');
  const [protein, setProtein] = useState(editingMeal?.proteinGrams.toString() || '');
  const [selectedType, setSelectedType] = useState<MealType>(editingMeal?.mealType || 'lunch');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePreset = (preset: typeof quickPresets[0]) => {
    setName(preset.name);
    setProtein(preset.protein.toString());
  };

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
      if (isEditing && editingMeal) {
        await updateMeal({
          ...editingMeal,
          name: name.trim(),
          proteinGrams: proteinValue,
          mealType: selectedType,
        });
      } else {
        await addMeal(name.trim(), proteinValue, selectedType);
      }
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
            <Text style={styles.title}>{isEditing ? 'Edit Meal' : 'Add Meal'}</Text>
            <View style={{ width: 60 }} />
          </View>
          
          {/* Quick Presets */}
          {!isEditing && (
            <View style={styles.presetsSection}>
              <Text style={styles.presetsLabel}>Quick Add</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.presetsRow}>
                  {quickPresets.map((preset) => (
                    <TouchableOpacity
                      key={preset.name}
                      style={styles.presetButton}
                      onPress={() => handlePreset(preset)}
                    >
                      <Text style={styles.presetIcon}>{preset.icon}</Text>
                      <Text style={styles.presetName} numberOfLines={1}>{preset.name}</Text>
                      <Text style={styles.presetProtein}>{preset.protein}g</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

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
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Meal'}
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
  presetsSection: {
    marginBottom: SPACING.lg,
  },
  presetsLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  presetButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.sm,
    alignItems: 'center',
    width: 80,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  presetName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    textAlign: 'center',
  },
  presetProtein: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
