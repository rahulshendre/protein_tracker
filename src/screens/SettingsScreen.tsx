import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Platform,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { FONT_SIZES, SPACING, GLASSES_ML } from '../constants';
import { useMealStore } from '../stores/mealStore';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../context/ThemeContext';
import { ThemedDialog } from '../components';

const REMINDER_PRESET_HOURS = [6, 7, 8, 9, 12, 18, 19, 20, 21, 22];

function formatReminderTime(s: string): string {
  const [h, m] = s.split(':').map(Number);
  const d = new Date();
  d.setHours(h ?? 20, m ?? 0, 0, 0);
  return format(d, 'h:mm a');
}

export function SettingsScreen() {
  const navigation = useNavigation();
  const { colors, isDark, toggleTheme } = useTheme();
  const { settings, syncStatus, updateGoal, updateWaterGoal, setWaterUnit, updateReminder } = useMealStore();
  const { signOut, user } = useAuthStore();
  const [goalInput, setGoalInput] = useState(settings.dailyProteinGoal.toString());
  const [waterGoalInput, setWaterGoalInput] = useState(() =>
    settings.waterUnit === 'glasses'
      ? String(Math.round(settings.dailyWaterGoalMl / GLASSES_ML))
      : String(settings.dailyWaterGoalMl)
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [modalTimes, setModalTimes] = useState<[string, string, string]>(() => settings.reminderTimes);
  const [editingSlot, setEditingSlot] = useState<0 | 1 | 2 | null>(null);
  const [customHour, setCustomHour] = useState('8');
  const [customMinute, setCustomMinute] = useState('00');

  const [errorDialog, setErrorDialog] = useState(false);
  const [waterErrorDialog, setWaterErrorDialog] = useState(false);
  const [timeErrorDialog, setTimeErrorDialog] = useState(false);
  const [signOutDialog, setSignOutDialog] = useState(false);

  useEffect(() => {
    if (showTimePicker) {
      setModalTimes(settings.reminderTimes);
      setEditingSlot(null);
    }
  }, [showTimePicker, settings.reminderTimes]);

  function formatReminderTimes(times: [string, string, string]): string {
    return times.map(formatReminderTime).join(', ');
  }

  useEffect(() => {
    setWaterGoalInput(
      settings.waterUnit === 'glasses'
        ? String(Math.round(settings.dailyWaterGoalMl / GLASSES_ML))
        : String(settings.dailyWaterGoalMl)
    );
  }, [settings.waterUnit, settings.dailyWaterGoalMl]);

  const handleSave = async () => {
    const goal = parseInt(goalInput, 10);
    if (isNaN(goal) || goal < 1 || goal > 500) {
      setErrorDialog(true);
      return;
    }
    const rawWater = parseInt(waterGoalInput, 10);
    if (isNaN(rawWater)) {
      setWaterErrorDialog(true);
      return;
    }
    const goalMl = settings.waterUnit === 'glasses' ? rawWater * GLASSES_ML : rawWater;
    if (goalMl < 250 || goalMl > 10000) {
      setWaterErrorDialog(true);
      return;
    }
    await updateGoal(goal);
    await updateWaterGoal(goalMl);
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

        {/* Water unit + goal */}
        <View style={[styles.setting, { backgroundColor: colors.surface }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Water unit</Text>
          <View style={styles.waterUnitRow}>
            <TouchableOpacity
              style={[
                styles.waterUnitBtn,
                settings.waterUnit === 'glasses' && { backgroundColor: colors.primaryLight },
                { borderColor: colors.border },
              ]}
              onPress={() => setWaterUnit('glasses')}
            >
              <Text style={[styles.waterUnitBtnText, { color: settings.waterUnit === 'glasses' ? colors.primary : colors.textSecondary }]}>Glasses</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.waterUnitBtn,
                settings.waterUnit === 'ml' && { backgroundColor: colors.primaryLight },
                { borderColor: colors.border },
              ]}
              onPress={() => setWaterUnit('ml')}
            >
              <Text style={[styles.waterUnitBtnText, { color: settings.waterUnit === 'ml' ? colors.primary : colors.textSecondary }]}>ml</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.setting, { backgroundColor: colors.surface }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Daily Water Goal ({settings.waterUnit === 'glasses' ? 'glasses' : 'ml'})
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={waterGoalInput}
            onChangeText={setWaterGoalInput}
            keyboardType="number-pad"
            maxLength={settings.waterUnit === 'ml' ? 5 : 2}
            placeholderTextColor={colors.disabled}
          />
        </View>

        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {settings.waterUnit === 'glasses' ? 'Common: 8 glasses (~2L).' : 'Common: 2000 ml.'} Adjust to your needs.
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

        {/* Reminders – 3x daily (Android) */}
        {Platform.OS === 'android' && (
          <View style={[styles.setting, styles.toggleSetting, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => settings.reminderEnabled && setShowTimePicker(true)}
              disabled={!settings.reminderEnabled}
            >
              <Text style={[styles.toggleLabel, { color: colors.text }]}>Reminders</Text>
              <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
                {settings.reminderEnabled ? `3x daily: ${formatReminderTimes(settings.reminderTimes)}` : 'Off'}
              </Text>
            </TouchableOpacity>
            <Switch
              value={settings.reminderEnabled}
              onValueChange={(v) => {
                updateReminder(v);
                if (v) setShowTimePicker(true);
              }}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={settings.reminderEnabled ? colors.primary : '#f4f3f4'}
            />
          </View>
        )}
        {Platform.OS === 'android' && (
          <Modal visible={showTimePicker} transparent animationType="fade">
            <Pressable style={styles.timePickerOverlay} onPress={() => setShowTimePicker(false)}>
              <Pressable style={[styles.timePickerBox, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
                <Text style={[styles.timePickerTitle, { color: colors.text }]}>Reminder times (3 per day)</Text>
                {([0, 1, 2] as const).map((i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.reminderSlotRow, editingSlot === i && { backgroundColor: colors.primaryLight }]}
                    onPress={() => {
                      setEditingSlot(editingSlot === i ? null : i);
                      const [h, m] = modalTimes[i].split(':').map(Number);
                      setCustomHour(String(h ?? 8));
                      setCustomMinute(String(m ?? 0).padStart(2, '0'));
                    }}
                  >
                    <Text style={[styles.reminderSlotLabel, { color: colors.textSecondary }]}>Reminder {i + 1}</Text>
                    <Text style={[styles.reminderSlotTime, { color: colors.text }]}>{formatReminderTime(modalTimes[i])}</Text>
                  </TouchableOpacity>
                ))}
                {editingSlot !== null && (
                  <>
                    <View style={styles.customTimeRow}>
                      <View style={styles.customTimeField}>
                        <Text style={[styles.customTimeLabel, { color: colors.textSecondary }]}>Hour</Text>
                        <TextInput
                          style={[styles.customTimeInput, { color: colors.text, borderColor: colors.border }]}
                          value={customHour}
                          onChangeText={setCustomHour}
                          keyboardType="number-pad"
                          maxLength={2}
                          placeholder="8"
                          placeholderTextColor={colors.disabled}
                        />
                      </View>
                      <Text style={[styles.customTimeColon, { color: colors.text }]}>:</Text>
                      <View style={styles.customTimeField}>
                        <Text style={[styles.customTimeLabel, { color: colors.textSecondary }]}>Min</Text>
                        <TextInput
                          style={[styles.customTimeInput, { color: colors.text, borderColor: colors.border }]}
                          value={customMinute}
                          onChangeText={(t) => setCustomMinute(t.replace(/\D/g, '').slice(0, 2))}
                          keyboardType="number-pad"
                          maxLength={2}
                          placeholder="00"
                          placeholderTextColor={colors.disabled}
                        />
                      </View>
                      <TouchableOpacity
                        style={[styles.customTimeSetBtn, { backgroundColor: colors.primary }]}
                        onPress={() => {
                          const h = parseInt(customHour, 10);
                          const m = parseInt(customMinute, 10);
                          if (isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59) {
                            setTimeErrorDialog(true);
                            return;
                          }
                          const time = `${h}:${String(m).padStart(2, '0')}`;
                          setModalTimes((prev) => {
                            const next: [string, string, string] = [...prev];
                            next[editingSlot] = time;
                            return next;
                          });
                          setEditingSlot(null);
                        }}
                      >
                        <Text style={styles.customTimeSetText}>Set</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.timePickerPresetLabel, { color: colors.textSecondary }]}>Or pick a preset</Text>
                    <ScrollView style={styles.timePickerList}>
                      {REMINDER_PRESET_HOURS.map((h) => {
                        const time = `${h}:00`;
                        return (
                          <TouchableOpacity
                            key={time}
                            style={[styles.timePickerRow, modalTimes[editingSlot!] === time && { backgroundColor: colors.primaryLight }]}
                            onPress={() => {
                              setModalTimes((prev) => {
                                const next: [string, string, string] = [...prev];
                                next[editingSlot!] = time;
                                return next;
                              });
                              setEditingSlot(null);
                            }}
                          >
                            <Text style={[styles.timePickerRowText, { color: colors.text }]}>{formatReminderTime(time)}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </>
                )}
                <View style={styles.timePickerActions}>
                  <TouchableOpacity style={[styles.timePickerCancel, { borderColor: colors.border }]} onPress={() => setShowTimePicker(false)}>
                    <Text style={[styles.timePickerCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.timePickerSave, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      updateReminder(true, modalTimes);
                      setShowTimePicker(false);
                    }}
                  >
                    <Text style={styles.customTimeSetText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        )}
        <ThemedDialog
          visible={timeErrorDialog}
          title="Invalid time"
          message="Hour must be 0–23, minute must be 0–59."
          onClose={() => setTimeErrorDialog(false)}
        />

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>

        {/* Sync status (when logged in) */}
        {user && (
          <View style={[styles.setting, { backgroundColor: colors.surface, marginTop: SPACING.xl }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Sync status</Text>
            <Text style={[styles.syncStatusText, { color: syncStatus === 'synced' ? colors.success : syncStatus === 'offline' ? colors.warning : colors.text }]}>
              {syncStatus === 'syncing' ? 'Syncing…' : syncStatus === 'synced' ? 'Synced' : syncStatus === 'offline' ? 'Offline' : 'Idle'}
            </Text>
          </View>
        )}

        {/* Account Section */}
        <View style={[styles.setting, { backgroundColor: colors.surface, marginTop: SPACING.md }]}>
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

      <ThemedDialog
        visible={waterErrorDialog}
        title="Invalid Water Goal"
        message={settings.waterUnit === 'glasses' ? 'Enter 1–40 glasses.' : 'Enter 250–10000 ml.'}
        onClose={() => setWaterErrorDialog(false)}
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
  waterUnitRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  waterUnitBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  waterUnitBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
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
  syncStatusText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
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
  timePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  timePickerBox: {
    borderRadius: 12,
    padding: SPACING.md,
    maxHeight: 420,
  },
  reminderSlotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  reminderSlotLabel: {
    fontSize: FONT_SIZES.sm,
  },
  reminderSlotTime: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  timePickerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  customTimeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  customTimeField: {
    flex: 1,
  },
  customTimeLabel: {
    fontSize: FONT_SIZES.xs,
    marginBottom: 2,
  },
  customTimeInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.lg,
  },
  customTimeColon: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    paddingBottom: SPACING.sm,
  },
  customTimeSetBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
    borderRadius: 8,
  },
  customTimeSetText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  timePickerPresetLabel: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
  timePickerList: {
    maxHeight: 220,
  },
  timePickerRow: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  timePickerRowText: {
    fontSize: FONT_SIZES.md,
  },
  timePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  timePickerSave: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  timePickerCancel: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 80,
  },
  timePickerCancelText: {
    fontSize: FONT_SIZES.md,
  },
});
