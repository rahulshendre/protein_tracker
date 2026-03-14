import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FONT_SIZES, SPACING } from '../constants';
import { useMealStore } from '../stores/mealStore';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../context/ThemeContext';
import { ThemedDialog } from '../components';

export function SettingsScreen() {
  const navigation = useNavigation();
  const { colors, isDark, toggleTheme } = useTheme();
  const { settings, updateGoal } = useMealStore();
  const { signOut, user } = useAuthStore();
  const [goalInput, setGoalInput] = useState(settings.dailyProteinGoal.toString());

  // Dialog states
  const [errorDialog, setErrorDialog] = useState(false);
  const [signOutDialog, setSignOutDialog] = useState(false);

  const handleSave = async () => {
    const goal = parseInt(goalInput, 10);
    if (isNaN(goal) || goal < 1 || goal > 500) {
      setErrorDialog(true);
      return;
    }
    await updateGoal(goal);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        {/* Protein Goal */}
        <View style={[styles.setting, { backgroundColor: colors.surface }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Daily Protein Goal (g)</Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={goalInput}
            onChangeText={setGoalInput}
            keyboardType="number-pad"
            maxLength={3}
            placeholderTextColor={colors.disabled}
          />
        </View>

        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Recommended: 0.8-1g per pound of body weight for muscle building
        </Text>

        {/* Dark Mode Toggle */}
        <View style={[styles.setting, styles.toggleSetting, { backgroundColor: colors.surface }]}>
          <View>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
              {isDark ? 'Currently on' : 'Currently off'}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={isDark ? colors.primary : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>

        {/* Account Section */}
        <View style={[styles.setting, { backgroundColor: colors.surface, marginTop: SPACING.xl }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Account</Text>
          <Text style={[styles.email, { color: colors.text }]}>{user?.email}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.signOutButton, { borderColor: colors.error }]} 
          onPress={() => setSignOutDialog(true)}
        >
          <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Error Dialog */}
      <ThemedDialog
        visible={errorDialog}
        title="Invalid Goal"
        message="Please enter a value between 1 and 500"
        onClose={() => setErrorDialog(false)}
      />

      {/* Sign Out Confirmation */}
      <ThemedDialog
        visible={signOutDialog}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
          { text: 'Sign Out', style: 'destructive', onPress: signOut },
        ]}
        onClose={() => setSignOutDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  backButton: {
    fontSize: FONT_SIZES.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  content: {
    padding: SPACING.lg,
  },
  setting: {
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.sm,
  },
  input: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    padding: 0,
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.lg,
  },
  toggleSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  toggleHint: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  saveButton: {
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  email: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  signOutButton: {
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    borderWidth: 2,
  },
  signOutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
