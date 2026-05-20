import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Hash function to convert string ID to numeric ID
export function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 2147483647; // stay within Java Integer limit (standard Android notification IDs)
}

// Request permissions
export async function requestNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const permission = await LocalNotifications.requestPermissions();
      return permission.display === 'granted';
    } catch (e) {
      console.error('Error requesting Capacitor local notifications permission:', e);
      return false;
    }
  } else {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}

// Check current permission state
export async function checkNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const permission = await LocalNotifications.checkPermissions();
      return permission.display === 'granted';
    } catch (e) {
      console.error('Error checking Capacitor local notifications permission:', e);
      return false;
    }
  } else {
    if ('Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }
}

// Show an immediate notification (for testing)
export async function showTestNotification(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert('Bitte erlaube Benachrichtigungen in den App-Einstellungen deines Handys.');
        return;
      }
    }
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 9999,
            title: 'Test: Guten Morgen! ☀️',
            body: 'Zeit für deine Morgen-Routine. Starte optimal in den Tag!',
            extra: { test: true }
          }
        ]
      });
    } catch (e) {
      console.error('Error scheduling test local notification:', e);
    }
  } else {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification('Test: Guten Morgen! ☀️', {
        body: 'Zeit für deine Morgen-Routine. Starte optimal in den Tag!',
        icon: '/favicon.ico'
      });
      notif.onclick = () => window.focus();
    }
  }
}

export interface NotificationScheduleItem {
  id: string;
  title: string;
  body: string;
  time: string; // HH:MM
}

// Reschedule all local notifications (Android/iOS only)
export async function rescheduleAllNativeNotifications(
  items: NotificationScheduleItem[]
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // 1. Cancel all existing pending notifications
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map(n => ({ id: n.id }))
      });
    }

    // 2. Schedule new ones
    if (items.length === 0) {
      console.log('No notifications to schedule.');
      return;
    }

    const notifications = items.map(item => {
      const [hour, minute] = item.time.split(':').map(Number);
      return {
        id: stringToHash(item.id),
        title: item.title,
        body: item.body,
        schedule: {
          on: {
            hour,
            minute
          },
          repeats: true,
          allowWhileIdle: true
        }
      };
    });

    await LocalNotifications.schedule({ notifications });
    console.log(`Successfully scheduled ${notifications.length} native local notifications:`, notifications);
  } catch (error) {
    console.error('Error rescheduling native notifications:', error);
  }
}
