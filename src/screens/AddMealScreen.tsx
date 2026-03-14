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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { useMealStore } from '../stores/mealStore';
import { ThemedDialog } from '../components';
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
  const { colors } = useTheme();
  const editingMeal = route.params?.meal;
  const isEditing = !!editingMeal;
  
  const { addMeal, updateMeal } = useMealStore();
  
  const [name, setName] = useState(editingMeal?.name || '');
  const [protein, setProtein] = useState(editingMeal?.proteinGrams.toString() || '');
  const [selectedType, setSelectedType] = useState<MealType>(editingMeal?.mealType || 'lunch');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  const showError = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogVisible(true);
  };

  const handlePreset = (preset: typeof quickPresets[0]) => {
    setName(preset.name);
    setProtein(preset.protein.toString());
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showError('Missing Name', 'Please enter a meal name');
      return;
    }
    
    const proteinValue = parseFloat(protein);
    if (isNaN(proteinValue) || proteinValue <= 0) {
      showError('Invalid Protein', 'Please enter a valid protein amount');
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
      showError('Error', 'Failed to save meal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
              <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              {isEditing ? 'Edit Meal' : 'Add Meal'}
            </Text>
            <View style={{ width: 60 }} />
          </View>
          
          {/* Quick Presets */}
          {!isEditing && (
            <View style={styles.presetsSection}>
              <Text style={[styles.presetsLabel, { color: colors.text }]}>Quick Add</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.presetsRow}>
                  {quickPresets.map((preset) => (
                    <TouchableOpacity
                      key={preset.name}
                      style={[styles.presetButton, { 
                        backgroundColor: colors.surface, 
                        borderColor: colors.border 
                      }]}
                      onPress={() => handlePreset(preset)}
                    >
                      <Text style={styles.presetIcon}>{preset.icon}</Text>
                      <Text style={[styles.presetName, { color: colors.text }]} numberOfLines={1}>
                        {preset.name}
                      </Text>
                      <Text style={[styles.presetProtein, { color: colors.primary }]}>
                        {preset.protein}g
                      </Text>
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
              <Text style={[styles.label, { color: colors.text }]}>Meal Name</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: colors.surface, 
                  color: colors.text,
                  borderColor: colors.border 
                }]}
                placeholder="e.g., Chicken Breast, Protein Shake"
                placeholderTextColor={colors.disabled}
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>
            
            {/* Protein Amount */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Protein (grams)</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: colors.surface, 
                  color: colors.text,
                  borderColor: colors.border 
                }]}
                placeholder="e.g., 25"
                placeholderTextColor={colors.disabled}
                value={protein}
                onChangeText={setProtein}
                keyboardType="decimal-pad"
              />
            </View>
            
            {/* Meal Type */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Meal Type</Text>
              <View style={styles.typeGrid}>
                {mealTypes.map((item) => (
                  <TouchableOpacity
                    key={item.type}
                    style={[
                      styles.typeButton,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      selectedType === item.type && { 
                        borderColor: colors.primary, 
                        backgroundColor: colors.primaryLight 
                      },
                    ]}
                    onPress={() => setSelectedType(item.type)}
                  >
                    <Text style={styles.typeIcon}>{item.icon}</Text>
                    <Text 
                      style={[
                        styles.typeLabel,
                        { color: colors.textSecondary },
                        selectedType === item.type && { color: colors.primaryDark },
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
            style={[
              styles.submitButton, 
              { backgroundColor: colors.primary },
              isSubmitting && { backgroundColor: colors.disabled }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Meal'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Dialog */}
      <ThemedDialog
        visible={dialogVisible}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
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
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  typeLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  presetsSection: {
    marginBottom: SPACING.lg,
  },
  presetsLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  presetButton: {
    borderRadius: 12,
    padding: SPACING.sm,
    alignItems: 'center',
    width: 80,
    borderWidth: 1,
  },
  presetIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  presetName: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
  presetProtein: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});
