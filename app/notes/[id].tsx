import { Stack, useLocalSearchParams, router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, Portal, useTheme } from 'react-native-paper';
import CustomHeader from '@/components/ui/CustomHeader';
import NoteItem from '@/components/notes/NoteItem';
import { useTheme as ThemeContext } from '@/context/ThemeContext';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	Easing as ReanimatedEasing,
} from 'react-native-reanimated';

export default function ViewNoteScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const theme = useTheme();
	const { theme: currentTheme, themeClrs } = ThemeContext();

	// Animation for note view entrance
	const noteOpacity = useSharedValue(0);
	const noteY = useSharedValue(20);

	React.useEffect(() => {
		noteOpacity.value = withTiming(1, {
			duration: 400,
			easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
		});
		noteY.value = withTiming(0, {
			duration: 400,
			easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
		});
	}, []);

	const noteAnimatedStyle = useAnimatedStyle(() => ({
		opacity: noteOpacity.value,
		transform: [{ translateY: noteY.value }],
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
									title='Note'
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
						<Animated.View style={[styles.noteContainer, noteAnimatedStyle]}>
							{id && <NoteItem />}
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
	},
	noteContainer: {
		flex: 1,
	},
});

