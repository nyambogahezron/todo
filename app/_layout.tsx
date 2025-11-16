import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '@/context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import { db } from '@/db/connect';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import SCREENS from './navigation/screens';
import DrawerContent from './navigation/Drawer';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

SplashScreen.preventAutoHideAsync();

const Drawer = createDrawerNavigator();

export default function App() {
	const { success, error } = useMigrations(db, migrations);

	if (error) {
		console.error('Migration error:', error);
	}

	useDrizzleStudio(db.$client);
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
					<Drawer.Screen name='ShoppingList' component={SCREENS.ShoppingList} />
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
