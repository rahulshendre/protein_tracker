/**
 * Android local notifications – 3x daily "Yoo buddy! Add your protein and water" (Notifee).
 */

import { Platform, PermissionsAndroid } from 'react-native';
import notifee, { AndroidImportance, RepeatFrequency, TriggerType } from '@notifee/react-native';

const CHANNEL_ID = 'protein_reminder';
const NOTIFICATION_IDS = ['daily_reminder_1', 'daily_reminder_2', 'daily_reminder_3'] as const;
const TITLE = 'Protein & Water';
const BODY = 'Yoo buddy! Add your protein and water.';
const POST_NOTIFICATIONS = 'android.permission.POST_NOTIFICATIONS';

async function requestPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Platform.Version < 33) return true;
  try {
    const granted = await PermissionsAndroid.request(POST_NOTIFICATIONS);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

export async function scheduleDailyReminders(times: [string, string, string]): Promise<void> {
  if (Platform.OS !== 'android') return;
  const granted = await requestPermission();
  if (!granted) return;

  await notifee.createChannel({
    id: CHANNEL_ID,
    name: TITLE,
    importance: AndroidImportance.DEFAULT,
  });

  for (const id of NOTIFICATION_IDS) {
    await notifee.cancelTriggerNotification(id);
  }

  for (let i = 0; i < 3; i++) {
    const [h, m] = times[i].split(':').map(Number);
    const d = new Date();
    d.setHours(h ?? 8, m ?? 0, 0, 0);
    if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);

    await notifee.createTriggerNotification(
      {
        id: NOTIFICATION_IDS[i],
        title: TITLE,
        body: BODY,
        android: { channelId: CHANNEL_ID },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: d.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      }
    );
  }
}

export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS !== 'android') return;
  for (const id of NOTIFICATION_IDS) {
    await notifee.cancelTriggerNotification(id);
  }
}
