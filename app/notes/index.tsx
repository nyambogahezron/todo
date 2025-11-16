import { Stack, router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useState, useRef, useEffect } from 'react';
import {
	TouchableOpacity,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, Portal, useTheme } from 'react-native-paper';
import CustomHeader from '@/components/ui/CustomHeader';
import EmptyState from '@/components/ui/EmptyState';
import NotesList from '@/components/notes/NotesList';
import { useNotes } from '@/store/notes';
import { useTheme as ThemeContext } from '@/context/ThemeContext';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	withSpring,
	Easing as ReanimatedEasing,
} from 'react-native-reanimated';

export default function NotesScreen() {
	const [menuVisible, setMenuVisible] = React.useState(false);
	const theme = useTheme();
	const { theme: currentTheme, themeClrs } = ThemeContext();

	// Get all notes using Prisma
	const { notes: allNotes, loading, refresh } = useNotes();
	
	// Refresh notes when component mounts
	React.useEffect(() => {
		refresh();
	}, [refresh]);

	// Animation values for FAB
	const fabScale = useSharedValue(1);
	const fabOpacity = useSharedValue(1);
	const fabRotation = useSharedValue(0);

	// Animation for list items
	const listOpacity = useSharedValue(0);
	const listY = useSharedValue(20);

	// Animate list on mount
	useEffect(() => {
		listOpacity.value = withTiming(1, {
			duration: 400,
			easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
		});
		listY.value = withSpring(0, {
			damping: 15,
			stiffness: 100,
		});
	}, []);

	// Animate FAB on press
	const handleFabPress = () => {
		fabScale.value = withSpring(0.9, {
			damping: 10,
			stiffness: 200,
		});
		fabRotation.value = withSpring(45, {
			damping: 10,
			stiffness: 200,
		});
		
		setTimeout(() => {
			fabScale.value = withSpring(1, {
				damping: 10,
				stiffness: 200,
			});
			fabRotation.value = withSpring(0, {
				damping: 10,
				stiffness: 200,
			});
		}, 150);

		// Navigate to create note
		router.push('/notes/create' as any);
	};

	// Handle note press for viewing/editing
	const handleNotePress = (noteId: string) => {
		router.push(`/notes/${noteId}` as any);
	};

	// Animated styles
	const fabAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ scale: fabScale.value },
			{ rotate: `${fabRotation.value}deg` },
		],
		opacity: fabOpacity.value,
	}));

	const listAnimatedStyle = useAnimatedStyle(() => ({
		opacity: listOpacity.value,
		transform: [{ translateY: listY.value }],
	}));

	return (
		<SafeAreaProvider>
			<StatusBar
				style={currentTheme === 'light' ? 'dark' : 'light'}
				backgroundColor={theme.colors.background}
			/>

			<PaperProvider>
				<Portal>
					<Stack.Screen
						options={{
							headerShown: true,
							headerTitle: '',
							headerStyle: {
								backgroundColor: theme.colors.background,
							},
							header: () => (
								<CustomHeader
									menuVisible={menuVisible}
									title='Notes'
									setMenuVisible={setMenuVisible}
								/>
							),
						}}
					/>
					<SafeAreaView
						style={[
							styles.container,
							{
								backgroundColor: theme.colors.background,
							},
						]}
					>
						<KeyboardAvoidingView
							behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
							style={styles.keyboardAvoidingContainer}
							keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
						>
							{allNotes.length === 0 ? (
								<EmptyState />
							) : (
								<Animated.View style={[styles.listContainer, listAnimatedStyle]}>
									<NotesList
										notes={allNotes}
										onPress={handleNotePress}
									/>
								</Animated.View>
							)}
						</KeyboardAvoidingView>

						{/* Animated FAB for creating new note */}
						<Animated.View
							style={[
								styles.addButtonContainer,
								fabAnimatedStyle,
								{
									position: 'absolute',
								},
							]}
						>
							<TouchableOpacity
								style={[
									styles.addButton,
									{ backgroundColor: theme.colors.primary },
								]}
								onPress={handleFabPress}
								activeOpacity={0.7}
							>
								<Plus size={24} color={theme.colors.onPrimary} />
							</TouchableOpacity>
						</Animated.View>
					</SafeAreaView>
				</Portal>
			</PaperProvider>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 10,
	},
	keyboardAvoidingContainer: {
		flex: 1,
		width: '100%',
	},
	listContainer: {
		flex: 1,
	},
	addButtonContainer: {
		position: 'absolute',
		bottom: 25,
		right: 20,
	},
	addButton: {
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
});
