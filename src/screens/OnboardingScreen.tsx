import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FONT_SIZES, SPACING } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { useMealStore } from '../stores/mealStore';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { colors } = useTheme();
  const { updateGoal } = useMealStore();
  const [goalInput, setGoalInput] = useState('150');
  const [showError, setShowError] = useState(false);

  const handleContinue = async () => {
    const goal = parseInt(goalInput, 10);
    if (isNaN(goal) || goal < 1 || goal > 500) {
      setShowError(true);
      return;
    }
    await updateGoal(goal);
    onComplete();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>💪</Text>
        <Text style={[styles.title, { color: colors.text }]}>Welcome to{'\n'}Protein Tracker</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your daily protein intake and reach your fitness goals
        </Text>

        <View style={[styles.inputSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.label, { color: colors.text }]}>What's your daily protein goal?</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { color: colors.primary }]}
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="150"
              placeholderTextColor={colors.disabled}
            />
            <Text style={[styles.unit, { color: colors.textSecondary }]}>grams</Text>
          </View>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Tip: 0.8-1g per pound of body weight is recommended for muscle building
          </Text>
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleContinue}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>

      {/* Error Dialog */}
      <Modal visible={showError} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>Invalid Goal</Text>
            <Text style={[styles.dialogMessage, { color: colors.textSecondary }]}>
              Please enter a value between 1 and 500
            </Text>
            <TouchableOpacity
              style={[styles.dialogButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowError(false)}
            >
              <Text style={styles.dialogButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  inputSection: {
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  input: {
    fontSize: 48,
    fontWeight: 'bold',
    minWidth: 120,
  },
  unit: {
    fontSize: FONT_SIZES.xl,
    marginLeft: SPACING.sm,
  },
  hint: {
    fontSize: FONT_SIZES.sm,
  },
  button: {
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  dialogBox: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  dialogButton: {
    width: '100%',
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: 'center',
  },
  dialogButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
