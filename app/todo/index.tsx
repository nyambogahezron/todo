import { router, Stack } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useState, useRef, useEffect } from 'react';
import {
	TouchableOpacity,
	StyleSheet,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	Animated,
	Easing,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, Portal, useTheme } from 'react-native-paper';
import CustomHeader from '@/components/ui/CustomHeader';
import EmptyState from '@/components/ui/EmptyState';
import TodoItem from '@/components/todos/TodoItem';
import KeyboardTodoInput from '@/components/todos/KeyboardTodoInput';
import { useTodos } from '@/store/todo.prisma';
import { useTheme as ThemeContext } from '@/context/ThemeContext';

export default function TodosScreen() {
	const [menuVisible, setMenuVisible] = React.useState(false);
	const [keyboardInputVisible, setKeyboardInputVisible] = useState(false);
	const theme = useTheme();
	const inputRef = React.useRef<any>(null);
	const { theme: currentTheme, themeClrs } = ThemeContext();

	// Handle todo item click for editing
	const handleTodoEdit = (todoId: string) => {
		router.push(`/todo/?id=${todoId}`);
	};

	const renderItem = ({ item: id }: any) => (
		<TodoItem id={id} onEdit={handleTodoEdit} />
	);

	// Animation values
	const fabScaleAnim = useRef(new Animated.Value(1)).current;
	const fabOpacityAnim = useRef(new Animated.Value(1)).current;

	// Handle FAB animation when keyboard input visibility changes
	useEffect(() => {
		if (keyboardInputVisible) {
			// Animate FAB out
			Animated.parallel([
				Animated.timing(fabScaleAnim, {
					toValue: 0,
					duration: 250,
					useNativeDriver: true,
					easing: Easing.out(Easing.cubic),
				}),
				Animated.timing(fabOpacityAnim, {
					toValue: 0,
					duration: 200,
					useNativeDriver: true,
				}),
			]).start();
		} else {
			// Animate FAB in
			Animated.parallel([
				Animated.timing(fabScaleAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
					easing: Easing.elastic(1.2),
				}),
				Animated.timing(fabOpacityAnim, {
					toValue: 1,
					duration: 250,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [keyboardInputVisible]);

	// Show keyboard input for quick adding todos
	const showKeyboardInput = () => {
		setKeyboardInputVisible(true);
	};

	// Get todos using Prisma
	const { todos, loading, refresh } = useTodos();
	
	// Refresh todos when component mounts or when needed
	React.useEffect(() => {
		refresh();
	}, [refresh]);
	
	// Convert todos to IDs for compatibility with existing renderItem
	const sortedTodoIds = React.useMemo(() => {
		return todos.map(todo => todo.id);
	}, [todos]);

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
									title='Todos'
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
							<FlatList
								data={sortedTodoIds}
								renderItem={renderItem}
								style={styles.container}
								keyExtractor={(id) => id}
								ListEmptyComponent={() => <EmptyState />}
								contentContainerStyle={{ paddingBottom: 10 }}
							/>
							<KeyboardTodoInput
								visible={keyboardInputVisible}
								onClose={() => setKeyboardInputVisible(false)}
								inputRef={inputRef}
							/>
						</KeyboardAvoidingView>

						{/* Animated FAB for quick entry */}
						<Animated.View
							style={[
								styles.addButtonContainer,
								{
									opacity: fabOpacityAnim,
									transform: [{ scale: fabScaleAnim }],
									position: 'absolute',
								},
							]}
						>
							<TouchableOpacity
								style={[
									styles.addButton,
									{ backgroundColor: theme.colors.primary },
								]}
								onPress={showKeyboardInput}
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
	clearTodos: {
		margin: 16,
		flex: 0,
		textAlign: 'center',
		fontSize: 16,
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
