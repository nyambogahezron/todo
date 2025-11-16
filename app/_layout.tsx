import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { initializeFirebase } from '@/lib/firebase';
import SCREENS from './navigation/screens';
import DrawerContent from './navigation/Drawer';
import { router } from 'expo-router';

const Drawer = createDrawerNavigator();

// Inner app component that uses auth
function AppContent() {
	const { user, loading } = useAuth();
	const [firebaseInitialized, setFirebaseInitialized] = useState(false);

	// Initialize Firebase
	useEffect(() => {
		const initFirebase = async () => {
			try {
				await initializeFirebase();
				setFirebaseInitialized(true);
			} catch (error) {
				console.error('Failed to initialize Firebase:', error);
				setFirebaseInitialized(true);
			}
		};

		initFirebase();
	}, []);

	// Show loading state while Firebase initializes or auth state is loading
	if (!firebaseInitialized || loading) {
		return null; // Or return a loading component
	}

	// Redirect to login if not authenticated
	if (!user) {
		router.replace('/auth/login');
		return null;
	}

	return (
		<Drawer.Navigator
			drawerContent={(props) => <DrawerContent {...props} />}
			screenOptions={{
				headerShown: false,
				drawerStyle: {
					borderRadius: 0,
					marginTop: 0,
					borderBottomRightRadius: 0,
					borderTopRightRadius: 0,
					zIndex: 999,
					backgroundColor: '#f4f4f4',
				},
				headerStyle: { backgroundColor: 'tomato' },
				sceneStyle: { borderRadius: 0 },
				drawerStatusBarAnimation: 'slide',
				drawerActiveTintColor: 'yellow',
				drawerInactiveTintColor: 'black',
			}}
			initialRouteName='Home'
		>
			<Drawer.Screen
				name='Home'
				component={SCREENS.TodosScreen}
				options={{ headerShown: false }}
			/>
			<Drawer.Screen name='Notes' component={SCREENS.Notes} />
			<Drawer.Screen
				name='ShoppingList'
				component={SCREENS.ShoppingList}
			/>
			<Drawer.Screen name='Theme' component={SCREENS.Theme} />
			<Drawer.Screen name='Widget' component={SCREENS.Widget} />
			<Drawer.Screen name='Donate' component={SCREENS.Donate} />
			<Drawer.Screen name='Profile' component={SCREENS.Profile} />
			<Drawer.Screen name='Settings' component={SCREENS.SettingsScreen} />
			<Drawer.Screen name='EditTodo' component={SCREENS.EditTodoScreen} />
		</Drawer.Navigator>
	);
}

// The main app with providers
export default function App() {
	return (
		<GestureHandlerRootView style={styles.container}>
			<ThemeProvider>
				<AuthProvider>
					<AppContent />
				</AuthProvider>
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
