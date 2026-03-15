import { Platform, Vibration } from 'react-native';

/** Light haptic feedback (e.g. on add/save). Android only, safe to call. */
export function lightHaptic() {
  if (Platform.OS !== 'android') return;
  try {
    Vibration.vibrate(10);
  } catch (_) {
    // ignore if vibration fails (permission or unsupported)
  }
}

/** Slightly longer feedback (e.g. on delete). Android only, safe to call. */
export function mediumHaptic() {
  if (Platform.OS !== 'android') return;
  try {
    Vibration.vibrate(20);
  } catch (_) {
    // ignore if vibration fails
  }
}
