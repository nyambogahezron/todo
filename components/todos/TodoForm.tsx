import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
	TextInput,
	Button,
	HelperText,
	Subheading,
	RadioButton,
	Text,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { validateTodoForm } from '@/utils/validation';
import { Todo } from '@/store/models';
import { useUpdateTodo } from '@/store/todo.prisma';
import { useTheme } from '@/context/ThemeContext';

type TodoFormProps = {
	initialData: Todo; 
	onCancel: () => void;
	isEditing?: boolean;
};

export default function TodoForm({ initialData, onCancel, isEditing = true }: TodoFormProps) {
	const { themeClrs } = useTheme();
	const updateTodo = useUpdateTodo();

	// Initialize form with existing todo data
	const [title, setTitle] = useState(initialData.text || '');
	const [priority, setPriority] = useState<Todo['priority']>(
		initialData.priority || 'medium'
	);
	const [dueDate, setDueDate] = useState<Date | null>(
		initialData.dueDate ? new Date(initialData.dueDate) : null
	);
	const [done, setDone] = useState(initialData.done || false);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

	const handleSubmit = async () => {
		const errors = validateTodoForm({ title });

		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			return;
		}

		// Update the todo using Prisma
		try {
			await updateTodo(initialData.id, {
				text: title,
				done: done,
				priority: priority,
				dueDate: dueDate?.toISOString() || '',
			});

			// Close the modal
			onCancel();
		} catch (error) {
			console.error('Error updating todo:', error);
		}
	};

	const handleDateChange = (event: any, selectedDate?: Date) => {
		setShowDatePicker(false);
		if (selectedDate) {
			setDueDate(selectedDate);
		}
	};

	return (
		<View
			style={[styles.container, { backgroundColor: themeClrs.colors.card }]}
		>
			<TextInput
				label='Title'
				value={title}
				onChangeText={(text) => {
					setTitle(text);
					if (formErrors.title) {
						const newErrors = { ...formErrors };
						delete newErrors.title;
						setFormErrors(newErrors);
					}
				}}
				mode='outlined'
				error={!!formErrors.title}
				style={[
					styles.input,
					{
						backgroundColor: themeClrs.colors.surface,
						color: themeClrs.colors.text,
					},
				]}
				placeholderTextColor={themeClrs.colors.text}
			/>
			{/* Show the error message if the title is invalid */}
			{formErrors.title && (
				<HelperText type='error' visible={!!formErrors.title}>
					{formErrors.title}
				</HelperText>
			)}

			<Subheading
				style={[styles.sectionTitle, { color: themeClrs.colors.text }]}
			>
				Priority
			</Subheading>
			<View style={styles.priorityContainer}>
				<View style={styles.priorityOption}>
					<RadioButton
						color={themeClrs.colors.onBackground}
						value='low'
						status={priority === 'low' ? 'checked' : 'unchecked'}
						onPress={() => setPriority('low')}
					/>
					<Text style={{ color: themeClrs.colors.text }}>Low</Text>
				</View>

				<View style={styles.priorityOption}>
					<RadioButton
						value='medium'
						status={priority === 'medium' ? 'checked' : 'unchecked'}
						onPress={() => setPriority('medium')}
					/>
					<Text style={{ color: themeClrs.colors.text }}>Medium</Text>
				</View>

				<View style={styles.priorityOption}>
					<RadioButton
						value='high'
						status={priority === 'high' ? 'checked' : 'unchecked'}
						onPress={() => setPriority('high')}
					/>
					<Text style={{ color: themeClrs.colors.text }}>High</Text>
				</View>
			</View>

			<Subheading
				style={[styles.sectionTitle, { color: themeClrs.colors.text }]}
			>
				Status
			</Subheading>
			<View style={styles.statusContainer}>
				<View style={styles.statusOption}>
					<RadioButton
						color={themeClrs.colors.onBackground}
						value='pending'
						status={!done ? 'checked' : 'unchecked'}
						onPress={() => setDone(false)}
					/>
					<Text style={{ color: themeClrs.colors.text }}>Pending</Text>
				</View>

				<View style={styles.statusOption}>
					<RadioButton
						value='done'
						status={done ? 'checked' : 'unchecked'}
						onPress={() => setDone(true)}
					/>
					<Text style={{ color: themeClrs.colors.text }}>Completed</Text>
				</View>
			</View>

			<Subheading
				style={[styles.sectionTitle, { color: themeClrs.colors.text }]}
			>
				Due Date
			</Subheading>
			<Button
				mode='outlined'
				onPress={() => setShowDatePicker(true)}
				style={styles.dateButton}
			>
				{dueDate ? dueDate.toLocaleDateString() : 'Set due date'}
			</Button>
			{dueDate && (
				<Button
					mode='text'
					onPress={() => setDueDate(null)}
					style={styles.clearButton}
				>
					Clear date
				</Button>
			)}

			{showDatePicker && (
				<DateTimePicker
					value={dueDate || new Date()}
					mode='date'
					display='default'
					onChange={handleDateChange}
				/>
			)}

			<View style={styles.buttonsContainer}>
				<Button 
					mode="outlined" 
					onPress={onCancel} 
					style={[styles.button, styles.cancelButton]}
				>
					Cancel
				</Button>
				<Button 
					mode='contained' 
					onPress={handleSubmit} 
					style={styles.button}
				>
					Update
				</Button>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		height: 'auto',
		width: '100%',
		borderRadius: 8,
		padding: 16,
	},
	input: {
		marginBottom: 16,
	},
	sectionTitle: {
		marginBottom: 8,
	},
	priorityContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
	priorityOption: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statusContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
	statusOption: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	dateButton: {
		marginBottom: 8,
	},
	clearButton: {
		marginBottom: 16,
	},
	buttonsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 16,
	},
	button: {
		flex: 1,
		marginHorizontal: 4,
	},
	cancelButton: {
		marginRight: 8,
	},
});
