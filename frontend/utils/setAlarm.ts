import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';

export interface SetAlarmOptions {
  hour: number;
  minutes: number;
  message?: string;
  days?: number[]; // 1=Sunday, 2=Monday, ..., 7=Saturday
  vibrate?: boolean;
}

/**
 * Launches Android AlarmClock intent to set an alarm
 * @param opts - Alarm configuration options
 * @returns Promise that resolves when intent is launched
 */
export async function launchSetAlarm(opts: SetAlarmOptions): Promise<void> {
  // Only works on Android
  if (Platform.OS !== 'android') {
    throw new Error('Set alarm feature is only available on Android');
  }

  const { hour, minutes, message, days, vibrate } = opts;

  // Validate hour and minutes
  if (hour < 0 || hour > 23) {
    throw new Error('Hour must be between 0 and 23');
  }
  if (minutes < 0 || minutes > 59) {
    throw new Error('Minutes must be between 0 and 59');
  }

  // Prepare intent extras
  const extras: Record<string, any> = {
    'android.intent.extra.alarm.HOUR': hour,
    'android.intent.extra.alarm.MINUTES': minutes,
  };

  // Add optional message
  if (message) {
    extras['android.intent.extra.alarm.MESSAGE'] = message;
  }

  // Add optional days (repeat days)
  if (days && days.length > 0) {
    // Validate days array
    const validDays = days.filter(day => day >= 1 && day <= 7);
    if (validDays.length > 0) {
      extras['android.intent.extra.alarm.DAYS'] = validDays;
    }
  }

  // Add optional vibrate setting
  if (vibrate !== undefined) {
    extras['android.intent.extra.alarm.VIBRATE'] = vibrate;
  }

  try {
    await IntentLauncher.startActivityAsync('android.intent.action.SET_ALARM', {
      extra: extras,
    });
  } catch (error) {
    console.error('Failed to launch alarm intent:', error);
    throw new Error('Failed to open alarm settings. Please check if a clock app is installed.');
  }
}

/**
 * Helper function to set a one-time alarm for tomorrow
 * @param hour - Hour (0-23)
 * @param minutes - Minutes (0-59)
 * @param message - Optional alarm message
 */
export async function setAlarmForTomorrow(
  hour: number,
  minutes: number,
  message?: string
): Promise<void> {
  return launchSetAlarm({
    hour,
    minutes,
    message: message || 'Wake up time!',
    vibrate: true,
  });
}

/**
 * Helper function to set a recurring weekday alarm
 * @param hour - Hour (0-23)
 * @param minutes - Minutes (0-59)
 * @param message - Optional alarm message
 */
export async function setWeekdayAlarm(
  hour: number,
  minutes: number,
  message?: string
): Promise<void> {
  return launchSetAlarm({
    hour,
    minutes,
    message: message || 'Weekday wake up!',
    days: [2, 3, 4, 5, 6], // Monday to Friday
    vibrate: true,
  });
}
