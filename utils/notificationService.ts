import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPermissions {
  status: 'granted' | 'denied' | 'undetermined';
  canAskAgain: boolean;
}

/**
 * Request notification permissions from the user
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3498db',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: '2do-app', // You should replace this with your actual Expo project ID
      })).data;
      console.log('Push notification token:', token);
      
      // Store the token for later use with FCM
      await AsyncStorage.setItem('pushToken', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Check current notification permission status
 */
export async function getNotificationPermissionStatus(): Promise<NotificationPermissions> {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  
  return {
    status: status as 'granted' | 'denied' | 'undetermined',
    canAskAgain,
  };
}

/**
 * Schedule a local notification for a todo item
 */
export async function scheduleTodoNotification(
  todoTitle: string,
  todoDescription: string,
  dueDate: Date,
  todoId: string
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📝 Todo Reminder',
      body: `${todoTitle}${todoDescription ? ': ' + todoDescription : ''}`,
      data: { todoId, type: 'todo_reminder' },
      sound: true,
    },
    trigger: {
      date: dueDate,
    },
  });

  return notificationId;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Send an immediate local notification (for testing)
 */
export async function sendImmediateNotification(
  title: string,
  body: string,
  data?: any
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: true,
    },
    trigger: null, // Send immediately
  });

  return notificationId;
}

/**
 * Enable or disable notifications
 */
export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const enabled = await AsyncStorage.getItem('notificationsEnabled');
  return enabled === null ? true : JSON.parse(enabled); // Default to true
}

/**
 * Setup notification listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
) {
  // Handle notifications received while app is foregrounded
  const receivedListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
    onNotificationReceived?.(notification);
  });

  // Handle user tapping on notification
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification response:', response);
    onNotificationResponse?.(response);
  });

  // Return cleanup function
  return () => {
    Notifications.removeNotificationSubscription(receivedListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}
