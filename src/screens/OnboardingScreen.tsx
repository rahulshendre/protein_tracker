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
import { FONT_SIZES, SPACING, LIGHT_COLORS } from '../constants';
import { useMealStore } from '../stores/mealStore';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>💪</Text>
        <Text style={styles.title}>Welcome to{'\n'}Protein Tracker</Text>
        <Text style={styles.subtitle}>
          Track your daily protein intake and reach your fitness goals
        </Text>

        <View style={styles.inputSection}>
          <Text style={styles.label}>What's your daily protein goal?</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="150"
              placeholderTextColor="#BDBDBD"
            />
            <Text style={styles.unit}>grams</Text>
          </View>
          <Text style={styles.hint}>
            Tip: 0.8-1g per pound of body weight is recommended for muscle building
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>

      {/* Error Dialog */}
      <Modal visible={showError} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Invalid Goal</Text>
            <Text style={styles.dialogMessage}>
              Please enter a value between 1 and 500
            </Text>
            <TouchableOpacity
              style={styles.dialogButton}
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

const colors = LIGHT_COLORS;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  inputSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.text,
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
    color: colors.primary,
    minWidth: 120,
  },
  unit: {
    fontSize: FONT_SIZES.xl,
    color: colors.textSecondary,
    marginLeft: SPACING.sm,
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.primary,
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
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: FONT_SIZES.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  dialogButton: {
    width: '100%',
    backgroundColor: colors.primary,
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
