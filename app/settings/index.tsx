import { router, Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
	List,
	Switch,
	Divider,
	Button,
	Dialog,
	Portal,
	Text,
	useTheme,
	RadioButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme as ThemeContext } from '@/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import {
	getNotificationPermissionStatus,
	setNotificationsEnabled,
	areNotificationsEnabled,
	registerForPushNotificationsAsync,
	sendImmediateNotification,
} from '@/utils/notificationService';
import { ThemeName } from '@/constants/Colors';

export default function SettingsScreen() {
	const theme = useTheme();
	const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
	const [syncEnabled, setSyncEnabled] = useState(false);
	const [clearDataDialogVisible, setClearDataDialogVisible] = useState(false);
	const [themeDialogVisible, setThemeDialogVisible] = useState(false);
	const [testNotificationSent, setTestNotificationSent] = useState(false);
	const { setTheme, themeName, themeClrs, isDarkMode } = ThemeContext();

	useEffect(() => {
		// Load notification preference
		const loadNotificationPreference = async () => {
			const enabled = await areNotificationsEnabled();
			setNotificationsEnabledState(enabled);
		};
		loadNotificationPreference();
	}, []);

	const toggleDarkMode = () => {
		setTheme(isDarkMode ? 'light' : 'dark');
	};

	const toggleNotifications = async () => {
		const newValue = !notificationsEnabled;
		
		if (newValue) {
			// Check if we have permissions
			const { status } = await getNotificationPermissionStatus();
			
			if (status !== 'granted') {
				// Request permissions
				const token = await registerForPushNotificationsAsync();
				if (!token) {
					// Permission denied, don't enable
					return;
				}
			}
		}
		
		setNotificationsEnabledState(newValue);
		await setNotificationsEnabled(newValue);
	};

	const toggleSync = () => {
		setSyncEnabled(!syncEnabled);
		// Here you would handle cloud sync setup
	};

	const showClearDataDialog = () => {
		setClearDataDialogVisible(true);
	};

	const hideClearDataDialog = () => {
		setClearDataDialogVisible(false);
	};

	const showThemeDialog = () => {
		setThemeDialogVisible(true);
	};

	const hideThemeDialog = () => {
		setThemeDialogVisible(false);
	};

	const handleThemeSelect = async (selectedTheme: ThemeName) => {
		await setTheme(selectedTheme);
		hideThemeDialog();
	};

	const handleClearAllData = async () => {};

	const handleExportData = () => {};

	const handleTestNotification = async () => {
		await sendImmediateNotification(
			'Test Notification',
			'This is a test notification from 2DO app!'
		);
		setTestNotificationSent(true);
		setTimeout(() => setTestNotificationSent(false), 3000);
	};

	const themeOptions: { label: string; value: ThemeName; color: string }[] = [
		{ label: 'Light', value: 'light', color: '#ffffff' },
		{ label: 'Dark', value: 'dark', color: '#000000' },
		{ label: 'Blue', value: 'blue', color: '#2563eb' },
		{ label: 'Green', value: 'green', color: '#16a34a' },
		{ label: 'Purple', value: 'purple', color: '#7c3aed' },
		{ label: 'Pink', value: 'pink', color: '#db2777' },
		{ label: 'Orange', value: 'orange', color: '#ea580c' },
		{ label: 'Teal', value: 'teal', color: '#0d9488' },
		{ label: 'Rose', value: 'rose', color: '#e11d48' },
	];

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar
				style={isDarkMode ? 'light' : 'dark'}
				backgroundColor={themeClrs.colors.background}
			/>
			<Stack.Screen
				options={{
					headerShown: true,
					headerTitle: 'Settings',
					headerTitleAlign: 'center',
					headerShadowVisible: false,
					headerStyle: {
						backgroundColor: themeClrs.colors.background,
					},
					headerTintColor: themeClrs.colors.secondary,
					headerTitleStyle: {
						fontWeight: 'bold',
						color: themeClrs.colors.text,
					},
					headerLeft: () => (
						<Ionicons
							onPress={() => router.back()}
							name='arrow-back'
							size={24}
							color={themeClrs.colors.secondary}
							style={{ marginLeft: 16 }}
						/>
					),
				}}
			/>
			<ScrollView
				style={{
					marginTop: Platform.OS === 'ios' ? 0 : -50,
					paddingHorizontal: 8,
					backgroundColor: themeClrs.colors.background,
				}}
			>
				<List.Section>
					<List.Subheader>Appearance</List.Subheader>
					<List.Item
						titleStyle={{
							color: themeClrs.colors.textGrey,
							marginBottom: 10,
						}}
						title='Dark Mode'
						description='Enable dark theme'
						left={(props) => <List.Icon {...props} icon='theme-light-dark' />}
						right={(props) => (
							<Switch
								value={isDarkMode}
								onValueChange={toggleDarkMode}
							/>
						)}
					/>
					<Divider />
					<List.Item
						titleStyle={{
							color: themeClrs.colors.textGrey,
							marginBottom: 10,
						}}
						title='Choose Theme'
						description={`Current: ${themeName.charAt(0).toUpperCase() + themeName.slice(1)}`}
						left={(props) => <List.Icon {...props} icon='palette-outline' />}
						onPress={showThemeDialog}
						right={(props) => (
							<View
								style={{
									width: 24,
									height: 24,
									borderRadius: 12,
									backgroundColor: themeClrs.colors.primary,
									marginRight: 16,
								}}
							/>
						)}
					/>
					<Divider />
					<List.Subheader style={{ marginTop: 20 }}>
						Notifications
					</List.Subheader>
					<List.Item
						titleStyle={{
							color: themeClrs.colors.textGrey,
							marginBottom: 10,
						}}
						title='Enable Notifications'
						description='Get reminded of upcoming tasks'
						left={(props) => <List.Icon {...props} icon='bell-outline' />}
						right={(props) => (
							<Switch
								value={notificationsEnabled}
								onValueChange={toggleNotifications}
							/>
						)}
					/>
					<Divider />
					<List.Item
						titleStyle={{
							color: themeClrs.colors.textGrey,
							marginBottom: 10,
						}}
						title='Test Notification'
						description={testNotificationSent ? 'Notification sent!' : 'Send a test notification'}
						left={(props) => <List.Icon {...props} icon='bell-ring-outline' />}
						onPress={handleTestNotification}
						disabled={!notificationsEnabled}
					/>
					<Divider />
					<List.Subheader style={{ marginTop: 20 }}>Data</List.Subheader>
					<List.Item
						titleStyle={{ color: themeClrs.colors.textGrey, marginBottom: 10 }}
						title='Cloud Sync'
						description='Sync your data across devices'
						left={(props) => <List.Icon {...props} icon='cloud-sync-outline' />}
						right={(props) => (
							<Switch value={syncEnabled} onValueChange={toggleSync} />
						)}
					/>
					<List.Item
						titleStyle={{ color: themeClrs.colors.textGrey, marginBottom: 10 }}
						title='Export Data'
						description='Save your data as a file'
						left={(props) => <List.Icon {...props} icon='export' />}
						onPress={handleExportData}
					/>
					<List.Item
						titleStyle={{ color: themeClrs.colors.textGrey, marginBottom: 10 }}
						title='Clear All Data'
						description='Remove all your data from this device'
						left={(props) => (
							<List.Icon {...props} icon='delete' color={theme.colors.error} />
						)}
						onPress={showClearDataDialog}
					/>
				</List.Section>
				<List.Section>
					<List.Subheader style={{ marginTop: 20 }}>About</List.Subheader>
					<List.Item
						titleStyle={{
							color: themeClrs.colors.textGrey,
							marginBottom: 10,
						}}
						title='Version'
						description='1.0.0'
						left={(props) => (
							<List.Icon {...props} icon='information-outline' />
						)}
					/>

					<List.Item
						titleStyle={{
							color: themeClrs.colors.textGrey,
							marginBottom: 10,
						}}
						title='Share App'
						left={(props) => (
							<List.Icon {...props} icon='share-variant-outline' />
						)}
					/>
					<List.Item
						titleStyle={{
							color: themeClrs.colors.textGrey,
							marginBottom: 10,
						}}
						title='Rate us'
						left={(props) => <List.Icon {...props} icon='star-plus-outline' />}
					/>
				</List.Section>
			</ScrollView>

			<Portal>
				<Dialog
					visible={clearDataDialogVisible}
					onDismiss={hideClearDataDialog}
					style={{ backgroundColor: theme.colors.background, borderRadius: 10 }}
				>
					<Dialog.Title style={{ color: themeClrs.colors.textGrey }}>
						Clear All Data
					</Dialog.Title>
					<Dialog.Content>
						<Text variant='bodyMedium' style={{ color: themeClrs.colors.text }}>
							This will permanently delete all your todos, shopping lists, and
							notes. This action cannot be undone.
						</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={hideClearDataDialog}>Cancel</Button>
						<Button onPress={handleClearAllData} textColor={theme.colors.error}>
							Clear Data
						</Button>
					</Dialog.Actions>
				</Dialog>

				<Dialog
					visible={themeDialogVisible}
					onDismiss={hideThemeDialog}
					style={{ backgroundColor: themeClrs.colors.background, borderRadius: 10 }}
				>
					<Dialog.Title style={{ color: themeClrs.colors.text }}>
						Choose Theme
					</Dialog.Title>
					<Dialog.Content>
						<RadioButton.Group
							onValueChange={(value) => handleThemeSelect(value as ThemeName)}
							value={themeName}
						>
							{themeOptions.map((option) => (
								<View key={option.value} style={styles.themeOption}>
									<View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
										<View
											style={{
												width: 20,
												height: 20,
												borderRadius: 10,
												backgroundColor: option.color,
												marginRight: 12,
												borderWidth: 1,
												borderColor: themeClrs.colors.border,
											}}
										/>
										<Text style={{ color: themeClrs.colors.text }}>
											{option.label}
										</Text>
									</View>
									<RadioButton value={option.value} color={themeClrs.colors.primary} />
								</View>
							))}
						</RadioButton.Group>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={hideThemeDialog}>Close</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	themeOption: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 8,
	},
});
