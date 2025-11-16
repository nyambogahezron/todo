import { Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import CustomHeader from '@/components/ui/CustomHeader';
import { useRoute } from '@react-navigation/native';
import { useTodo, useUpdateTodo } from '@/store/todo';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withDelay, 
  Easing, 
} from 'react-native-reanimated';
import { Calendar, Clock, Flag } from 'lucide-react-native';
import { Chip } from 'react-native-paper';

export default function EditTodoScreen() {
	const route = useRoute();
	const navigation = useNavigation();
	const routeParams = route.params as { id: string };
	const { themeClrs } = useTheme();
	
	// Get the todo ID from route params
	const todoId = routeParams?.id ? String(routeParams.id) : '';
	
	// Use the todo data with Prisma
	const todoData = useTodo(todoId);
	const updateTodo = useUpdateTodo();
	
	// State for form fields
	const [text, setText] = useState('');
	const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
	const [dueDate, setDueDate] = useState<Date | null>(null);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showTimePicker, setShowTimePicker] = useState(false);
	
	// Animation values for each section
	const titleOpacity = useSharedValue(0);
	const titleY = useSharedValue(30);
	const textInputOpacity = useSharedValue(0);
	const textInputY = useSharedValue(30);
	const priorityOpacity = useSharedValue(0);
	const priorityY = useSharedValue(30);
	const dateOpacity = useSharedValue(0);
	const dateY = useSharedValue(30);
	const buttonsOpacity = useSharedValue(0);
	const buttonsY = useSharedValue(30);
	
	// Start animations when component mounts
	useEffect(() => {
		const animationConfig = {
			duration: 400,
			easing: Easing.out(Easing.cubic),
		};
		
		// Animate elements with staggered delays
		titleOpacity.value = withTiming(1, animationConfig);
		titleY.value = withTiming(0, animationConfig);
		
		textInputOpacity.value = withDelay(100, withTiming(1, animationConfig));
		textInputY.value = withDelay(100, withTiming(0, animationConfig));
		
		priorityOpacity.value = withDelay(200, withTiming(1, animationConfig));
		priorityY.value = withDelay(200, withTiming(0, animationConfig));
		
		dateOpacity.value = withDelay(300, withTiming(1, animationConfig));
		dateY.value = withDelay(300, withTiming(0, animationConfig));
		
		buttonsOpacity.value = withDelay(400, withTiming(1, animationConfig));
		buttonsY.value = withDelay(400, withTiming(0, animationConfig));
	}, []);
	
	// Create animated styles
	const titleStyle = useAnimatedStyle(() => ({
		opacity: titleOpacity.value,
		transform: [{ translateY: titleY.value }],
	}));
	
	const textInputStyle = useAnimatedStyle(() => ({
		opacity: textInputOpacity.value,
		transform: [{ translateY: textInputY.value }],
	}));
	
	const priorityStyle = useAnimatedStyle(() => ({
		opacity: priorityOpacity.value,
		transform: [{ translateY: priorityY.value }],
	}));
	
	const dateStyle = useAnimatedStyle(() => ({
		opacity: dateOpacity.value,
		transform: [{ translateY: dateY.value }],
	}));
	
	const buttonsStyle = useAnimatedStyle(() => ({
		opacity: buttonsOpacity.value,
		transform: [{ translateY: buttonsY.value }],
	}));
	
	// Initialize form with todo data
	useEffect(() => {
		if (todoData && Object.keys(todoData).length > 0) {
			console.log('Setting form data from todo:', todoData);
			setText(todoData.text || '');
			setPriority((todoData.priority as 'low' | 'medium' | 'high') || 'medium');
			setDueDate(todoData.dueDate ? new Date(todoData.dueDate) : null);
		}
	}, [todoData]);
	
	// Handle save
	const handleSave = async () => {
		if (todoId) {
			try {
				await updateTodo(todoId, {
					text,
					priority,
					dueDate: dueDate ? dueDate.toISOString() : '',
				});
				
				navigation.goBack();
			} catch (error) {
				console.error('Error updating todo:', error);
			}
		}
	};
	
	// Date and time picker handlers
	const handleDateChange = (_event: any, selectedDate?: Date) => {
		setShowDatePicker(false);
		if (selectedDate) {
			if (dueDate) {
				// Preserve the current time when selecting a new date
				const newDate = new Date(selectedDate);
				newDate.setHours(dueDate.getHours(), dueDate.getMinutes());
				setDueDate(newDate);
			} else {
				setDueDate(selectedDate);
			}
		}
	};
	
	const handleTimeChange = (_event: any, selectedTime?: Date) => {
		setShowTimePicker(false);
		if (selectedTime) {
			// Create a new date or use existing one
			const newDate = dueDate ? new Date(dueDate) : new Date();
			newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
			setDueDate(newDate);
		}
	};
	
	// Format date for display like in KeyboardTodoInput
	const formatDate = (date: Date | null) => {
		if (!date) return 'No due date';
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};
	
	// Format time for display
	const formatTime = (date: Date | null) => {
		if (!date) return 'No time set';
		return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
	};
	
	// Priority colors similar to KeyboardTodoInput
	const priorityColors = {
		low: themeClrs.colors.tertiary || '#4caf50',
		medium: themeClrs.colors.outlineVariant || '#ff9800',
		high: themeClrs.colors.error || '#f44336'
	};
	
	return (
		<View style={[styles.container, { backgroundColor: themeClrs.colors.background }]}>
			<Stack.Screen
				options={{
					headerShown: true,
					headerTitle: '',
					headerStyle: {
						backgroundColor: themeClrs.colors.background,
					},
					header: () => <CustomHeader title='Edit Todo' />,
				}}
			/>
			
			<ScrollView style={styles.form}>
				{todoData && Object.keys(todoData).length > 0 ? (
					<>
						
						<Animated.View style={textInputStyle}>
							<Text style={[styles.label, { color: themeClrs.colors.text }]}>Task</Text>
							<TextInput
								value={text}
								onChangeText={setText}
								style={[styles.input, { 
									backgroundColor: themeClrs.colors.card,
									color: themeClrs.colors.text,
								}]}
								placeholderTextColor={themeClrs.colors.textMuted}
								placeholder="What needs to be done?"
							/>
						</Animated.View>
						
						<Animated.View style={priorityStyle}>
							<Text style={[styles.label, { color: themeClrs.colors.text }]}>Priority</Text>
							<View style={styles.priorityContainer}>
								{(['low', 'medium', 'high'] as const).map((p) => (
									<TouchableOpacity
										key={p}
										style={[
											styles.priorityButton,
											priority === p && styles.selectedPriority,
											priority === p && { borderColor: priorityColors[p] },
											{ backgroundColor: themeClrs.colors.card }
										]}
										onPress={() => setPriority(p)}
									>
										<Flag 
											size={16} 
											color={priority === p ? priorityColors[p] : themeClrs.colors.textMuted} 
											style={styles.priorityIcon}
										/>
										<Text style={[
											styles.priorityText,
											{ color: priority === p ? priorityColors[p] : themeClrs.colors.text }
										]}>
											{p.charAt(0).toUpperCase() + p.slice(1)}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</Animated.View>
						
						<Animated.View style={dateStyle}>
							<Text style={[styles.label, { color: themeClrs.colors.text }]}>Due Date & Time</Text>
							
							<View style={styles.dateChipsContainer}>
								<Chip
									mode="outlined"
									icon={() => <Calendar size={16} color={themeClrs.colors.primary} />}
									onPress={() => setShowDatePicker(true)}
									style={styles.dateChip}
									textStyle={{ color: themeClrs.colors.text }}
								>
									{dueDate ? formatDate(dueDate) : "Set date"}
								</Chip>
								
								<Chip
									mode="outlined"
									icon={() => <Clock size={16} color={themeClrs.colors.primary} />}
									onPress={() => dueDate ? setShowTimePicker(true) : setShowDatePicker(true)}
									style={styles.dateChip}
									textStyle={{ color: themeClrs.colors.text }}
									disabled={!dueDate}
								>
									{dueDate ? formatTime(dueDate) : "Set time"}
								</Chip>
							</View>
							
							{dueDate && (
								<TouchableOpacity
									style={[styles.clearDateButton, { borderColor: themeClrs.colors.border }]}
									onPress={() => setDueDate(null)}
								>
									<Text style={{ color: themeClrs.colors.error }}>Clear date & time</Text>
								</TouchableOpacity>
							)}
						</Animated.View>
						
						{showDatePicker && (
							<DateTimePicker
								value={dueDate || new Date()}
								mode="date"
								display="default"
								onChange={handleDateChange}
							/>
						)}
						
						{showTimePicker && (
							<DateTimePicker
								value={dueDate || new Date()}
								mode="time"
								display="default"
								onChange={handleTimeChange}
							/>
						)}
						
						<Animated.View style={buttonsStyle}>
							<TouchableOpacity
								style={[styles.saveButton, { backgroundColor: themeClrs.colors.primary }]}
								onPress={handleSave}
							>
								<Text style={styles.saveButtonText}>Save Changes</Text>
							</TouchableOpacity>
							
							<TouchableOpacity
								style={[styles.cancelButton, { borderColor: themeClrs.colors.border }]}
								onPress={() => navigation.goBack()}
							>
								<Text style={{ color: themeClrs.colors.text }}>Cancel</Text>
							</TouchableOpacity>
						</Animated.View>
					</>
				) : (
					<Text style={{ color: themeClrs.colors.text, textAlign: 'center', marginTop: 50 }}>
						Loading todo data...
					</Text>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	form: {
		padding: 16,
	},
	title: {
		fontSize: 22,
		fontWeight: '700',
		marginBottom: 20,
		textAlign: 'center',
	},
	label: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 8,
		marginTop: 16,
	},
	input: {
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		minHeight: 50,
	},
	priorityContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop:5
	},
	priorityButton: {
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 8,
		borderWidth: 2,
		borderColor: 'transparent',
		alignItems: 'center',
		flexDirection: 'row',
		flex: 1,
		marginHorizontal: 4,
		justifyContent: 'center',
	},
	priorityIcon: {
		marginRight: 5,
	},
	selectedPriority: {
		borderWidth: 2,
	},
	priorityText: {
		fontWeight: '500',
	},
	dateChipsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 10,
		marginTop:20
	},
	dateChip: {
		marginRight: 8,
		marginBottom: 8,
	},
	clearDateButton: {
		padding: 10,
		borderRadius: 8,
		alignItems: 'center',
		borderWidth: 1,
		marginBottom: 20,
	},
	saveButton: {
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 30,
	},
	saveButtonText: {
		color: 'white',
		fontWeight: '600',
		fontSize: 16,
	},
	cancelButton: {
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 10,
		borderWidth: 1,
	},
});
