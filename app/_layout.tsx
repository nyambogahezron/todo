import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { initializeDatabase } from '@/lib/db';
import SCREENS from './navigation/screens';
import DrawerContent from './navigation/Drawer';

const Drawer = createDrawerNavigator();

// The main app.
export default function App() {
	const [dbInitialized, setDbInitialized] = useState(false);

	// Initialize Prisma database
	useEffect(() => {
		const initDb = async () => {
			try {
				await initializeDatabase();
				setDbInitialized(true);
			} catch (error) {
				console.error('Failed to initialize database:', error);
				// Still set initialized to true to allow app to render
				// User will see errors if database operations fail
				setDbInitialized(true);
			}
		};

		initDb();
	}, []);

	// Show loading state while database initializes
	if (!dbInitialized) {
		return null; // Or return a loading component
	}

	return (
		<GestureHandlerRootView style={styles.container}>
			<ThemeProvider>
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
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
