/**
 * Android local notifications – daily "Log your protein" reminder (Notifee).
 */

import { Platform, PermissionsAndroid } from 'react-native';
import notifee, { AndroidImportance, RepeatFrequency, TriggerType } from '@notifee/react-native';

const CHANNEL_ID = 'protein_reminder';
const NOTIFICATION_ID = 'daily_protein_reminder';
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

export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  if (Platform.OS !== 'android') return;
  const granted = await requestPermission();
  if (!granted) return;

  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Log your protein',
    importance: AndroidImportance.DEFAULT,
  });

  await notifee.cancelTriggerNotification(NOTIFICATION_ID);

  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);

  await notifee.createTriggerNotification(
    {
      id: NOTIFICATION_ID,
      title: 'Log your protein',
      body: 'Time to log your protein for today.',
      android: { channelId: CHANNEL_ID },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: d.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    }
  );
}

export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await notifee.cancelTriggerNotification(NOTIFICATION_ID);
}
