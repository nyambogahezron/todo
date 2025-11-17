# Push Notifications and Theme Features

This document describes the push notification and multi-theme features implemented in the 2DO app.

## Push Notifications

### Overview
The app now supports push notifications using Expo Notifications and Firebase Cloud Messaging (FCM). Users can receive reminders for their todos and tasks.

### Features
- **Permission Management**: Automatic request for notification permissions
- **Local Notifications**: Schedule notifications for todo reminders
- **FCM Support**: Ready for Firebase Cloud Messaging integration
- **Notification Settings**: Users can enable/disable notifications in settings
- **Test Notifications**: Ability to send test notifications from settings

### Setup

#### For Development
1. The app automatically requests notification permissions on first launch
2. On Android, notifications work out of the box
3. On iOS, you need to configure push notification certificates in your Apple Developer account

#### For Production (FCM Setup)
1. Create a Firebase project at https://console.firebase.google.com
2. Add your Android app to the Firebase project
3. Download `google-services.json` and place it in the root directory
4. For iOS, add the iOS app and configure APNs
5. Update the `projectId` in `utils/notificationService.ts` with your Expo project ID

### Usage

#### Scheduling a Todo Notification
```typescript
import { scheduleTodoNotification } from '@/utils/notificationService';

// Schedule a notification for a todo
const notificationId = await scheduleTodoNotification(
  'Todo Title',
  'Todo Description',
  new Date(dueDate),
  todoId
);
```

#### Managing Notification Permissions
```typescript
import { 
  registerForPushNotificationsAsync,
  getNotificationPermissionStatus 
} from '@/utils/notificationService';

// Register and get push token
const token = await registerForPushNotificationsAsync();

// Check permission status
const { status } = await getNotificationPermissionStatus();
```

#### Canceling Notifications
```typescript
import { cancelNotification, cancelAllNotifications } from '@/utils/notificationService';

// Cancel a specific notification
await cancelNotification(notificationId);

// Cancel all scheduled notifications
await cancelAllNotifications();
```

### Notification Service API

The `notificationService.ts` utility provides the following functions:

- `registerForPushNotificationsAsync()`: Request permissions and get push token
- `getNotificationPermissionStatus()`: Check current permission status
- `scheduleTodoNotification()`: Schedule a notification for a todo
- `cancelNotification()`: Cancel a scheduled notification
- `cancelAllNotifications()`: Cancel all scheduled notifications
- `sendImmediateNotification()`: Send a notification immediately (for testing)
- `setNotificationsEnabled()`: Enable/disable notifications in app settings
- `areNotificationsEnabled()`: Check if notifications are enabled
- `setupNotificationListeners()`: Setup listeners for notification events

## Multiple Theme Support

### Overview
The app now supports 9 different color themes that users can choose from, providing a personalized experience.

### Available Themes
1. **Light** - Clean and bright theme (default)
2. **Dark** - Easy on the eyes at night
3. **Blue** - Cool and professional
4. **Green** - Fresh and natural
5. **Purple** - Creative and vibrant
6. **Pink** - Playful and energetic
7. **Orange** - Warm and inviting
8. **Teal** - Calm and balanced
9. **Rose** - Elegant and bold

### Features
- Persistent theme selection (saved to AsyncStorage)
- Quick dark mode toggle in settings
- Full theme selector with preview colors
- Dedicated theme page accessible from drawer menu
- Consistent theming across all app screens

### Usage

#### Accessing Theme in Components
```typescript
import { useTheme } from '@/context/ThemeContext';

function MyComponent() {
  const { themeName, setTheme, themeClrs, isDarkMode } = useTheme();
  
  return (
    <View style={{ backgroundColor: themeClrs.colors.background }}>
      <Text style={{ color: themeClrs.colors.text }}>
        Current theme: {themeName}
      </Text>
    </View>
  );
}
```

#### Changing Theme Programmatically
```typescript
import { useTheme } from '@/context/ThemeContext';

const { setTheme } = useTheme();

// Change to a specific theme
await setTheme('blue');
await setTheme('green');
await setTheme('dark');
```

#### Adding New Themes
To add a new theme, edit `constants/Colors.ts`:

```typescript
export const myNewTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#color1',
    accent: '#color2',
    background: '#color3',
    surface: '#color4',
    text: '#color5',
    // ... other colors
  },
};

// Add to themes object
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  myNew: myNewTheme, // Add here
  // ...
};
```

### Theme Structure

Each theme has the following color properties:
- `primary`: Primary brand color
- `accent`: Accent/secondary color
- `background`: Main background color
- `surface`: Surface/card background color
- `text`: Primary text color
- `textMuted`: Muted/disabled text color
- `textGrey`: Secondary text color
- `onSurfaceVariant`: Text on surface variant
- `border`: Border color
- `notification`: Notification badge color
- `card`: Card background color
- `secondary`: Secondary interactive elements

## User Interface

### Settings Screen
- **Enable Notifications**: Toggle to enable/disable all notifications
- **Test Notification**: Send a test notification immediately
- **Dark Mode**: Quick toggle for dark/light mode
- **Choose Theme**: Opens theme selector dialog with all available themes

### Theme Screen
- Accessible from the app drawer menu
- Shows all available themes with preview colors
- Real-time theme switching
- Visual indication of currently selected theme

## Notes for Developers

### Important Files
- `utils/notificationService.ts`: Notification utility functions
- `constants/Colors.ts`: Theme definitions
- `context/ThemeContext.tsx`: Theme context provider
- `app/_layout.tsx`: Notification initialization
- `app/settings/index.tsx`: Settings UI with notification and theme controls
- `app/theme.tsx`: Dedicated theme selection page

### TypeScript Types
```typescript
// Theme names
type ThemeName = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'pink' | 'orange' | 'teal' | 'rose';

// Theme context type
interface ThemeContextType {
  themeName: ThemeName;
  setTheme: (theme: ThemeName) => Promise<void>;
  toggleTheme: () => Promise<void>;
  themeClrs: ThemeType;
  isDarkMode: boolean;
}
```

### Best Practices
1. Always use `themeClrs.colors.*` for colors instead of hardcoded values
2. Test notifications on physical devices (not simulators)
3. Request notification permissions at appropriate times, not on app launch
4. Handle notification permission denial gracefully
5. Keep theme color schemes accessible (good contrast ratios)

## Future Enhancements

Potential improvements:
- Custom theme creation by users
- Schedule notifications when creating/editing todos
- Push notification campaigns for task reminders
- Theme import/export functionality
- Notification sound customization
- Rich notifications with actions (mark complete, snooze)
