import { Platform } from 'react-native';

import * as Notifications from 'expo-notifications';

type ReminderResult =
  | { ok: true; notificationId?: string; disabled?: true }
  | { ok: false; error: string };

const ANDROID_REMINDER_CHANNEL = 'daily-reminders';
const DISABLED_REMINDER_VALUE = 'off';

function isReminderDisabled(reminderTime: string): boolean {
  return reminderTime.trim().toLowerCase() === DISABLED_REMINDER_VALUE;
}

function parseReminderTime(reminderTime: string): { hour: number; minute: number } | null {
  const trimmed = reminderTime.trim();
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(trimmed);

  if (!match) {
    return null;
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

async function ensureNotificationPermission(): Promise<boolean> {
  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_REMINDER_CHANNEL, {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

async function cancelScheduledRemindersForProfile(profileId: string): Promise<void> {
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = existing.filter(
    (entry) => entry.content.data?.profileId === profileId && entry.content.data?.type === 'daily-reminder'
  );

  await Promise.all(toCancel.map((entry) => Notifications.cancelScheduledNotificationAsync(entry.identifier)));
}

export async function scheduleDailyReminderForProfile(
  profileId: string,
  profileName: string,
  reminderTime: string
): Promise<ReminderResult> {
  const disabled = isReminderDisabled(reminderTime);
  const parsed = parseReminderTime(reminderTime);
  if (!parsed && !disabled) {
    return { ok: false, error: 'Reminder time must use HH:MM format or OFF.' };
  }

  try {
    await cancelScheduledRemindersForProfile(profileId);

    if (disabled) {
      return { ok: true, disabled: true };
    }

    if (!parsed) {
      return { ok: false, error: 'Reminder time must use HH:MM format or OFF.' };
    }

    const permissionGranted = await ensureNotificationPermission();
    if (!permissionGranted) {
      return {
        ok: false,
        error: 'Notifications are denied on this device. Manual check-in remains available.',
      };
    }

    await ensureAndroidChannel();

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Habit check-in reminder',
        body: `${profileName} has a daily habit check-in ready.`,
        data: {
          profileId,
          type: 'daily-reminder',
          reminderTime,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: parsed.hour,
        minute: parsed.minute,
      },
    });

    return {
      ok: true,
      notificationId,
    };
  } catch {
    return {
      ok: false,
      error: 'Notifications are unavailable on this device. Manual check-in remains available.',
    };
  }
}
