import { Stack, router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, Portal, useTheme } from 'react-native-paper';
import CustomHeader from '@/components/ui/CustomHeader';
import NoteEditor from '@/components/notes/NoteEditor';
import { useTheme as ThemeContext } from '@/context/ThemeContext';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	Easing as ReanimatedEasing,
} from 'react-native-reanimated';

export default function CreateNoteScreen() {
	const theme = useTheme();
	const { themeName: currentTheme, themeClrs } = ThemeContext();

	// Animation for editor entrance
	const editorOpacity = useSharedValue(0);
	const editorY = useSharedValue(30);

	React.useEffect(() => {
		editorOpacity.value = withTiming(1, {
			duration: 400,
			easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
		});
		editorY.value = withTiming(0, {
			duration: 400,
			easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
		});
	}, []);

	const editorAnimatedStyle = useAnimatedStyle(() => ({
		opacity: editorOpacity.value,
		transform: [{ translateY: editorY.value }],
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
									title='New Note'
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
						<Animated.View style={[styles.editorContainer, editorAnimatedStyle]}>
							<NoteEditor
								onSave={() => {
									router.back();
								}}
							/>
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
	editorContainer: {
		flex: 1,
	},
});

