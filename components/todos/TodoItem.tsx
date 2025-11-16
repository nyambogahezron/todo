import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { priorityColors } from '@/lib/utils';
import { Bell, Circle, CircleCheckBig } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useDeleteTodo, useTodo, useToggleTodoDone } from '@/store/todo';
import SwipeableRow from '../ui/SwipeableRow';
import { useNavigation } from '@react-navigation/native';

interface TodoItemProps {
	id: string;
	onEdit?: (todoData: any) => void;
}

export default function TodoItem({ id, onEdit }: TodoItemProps) {
	const { themeClrs } = useTheme();
	const todoData = useTodo(id);

	const navigation = useNavigation<any>();
	
	const toggleTodoDone = useToggleTodoDone(id);
	const deleteTodo = useDeleteTodo();
	
	const handlePress = async () => {
		if (todoData) {
			await toggleTodoDone();
		}
	};
	
	const handleDelete = async () => {
		await deleteTodo(id);
	};
	
	if (!todoData) {
		return null;
	}
	
	const { id: todoId, text, done, priority, dueDate } = todoData;
	const color = priorityColors[priority as 'low' | 'medium' | 'high'];

	//show due date month/day when curren year is same as due date year
	const currentDate = new Date(); // 1/1/2022 12:00:00
	const currentYear = currentDate.getFullYear(); // 2022
	const dueDateYear = new Date(dueDate).getFullYear();

	const getDueDate = () => {
		if (!dueDate) {
			return '';
		}

		if (currentYear === dueDateYear && dueDate) {
			return new Date(dueDate).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			});
		}
		if (currentYear !== dueDateYear && dueDate) {
			return new Date(dueDate).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			});
		}
	};
	const showDueDate = getDueDate();

	const styles = createStyles(themeClrs);

	// Handle edit when todo item is pressed
	const handleEditPress = () => {
		navigation.navigate('EditTodo', { id: todoData.id });
	};

	return (
		<SwipeableRow onSwipe={handleDelete} key={id}>
			<View style={styles.container}>
				{/* toggle icon  */}
				<TouchableOpacity onPress={handlePress} style={styles.iconsWrapper}>
					{done ? (
						<CircleCheckBig style={[styles.icon, styles.doneIcon]} size={22} />
					) : (
						<Circle style={styles.icon} color={color} size={22} />
					)}
				</TouchableOpacity>

				<TouchableOpacity
					key={id}
					style={styles.todo}
					onPress={handleEditPress}
					activeOpacity={0.7}
				>
					<Text style={[styles.todoText, done ? styles.done : null]}>
						{text}
					</Text>

					<View style={styles.action}>
						{!done && showDueDate && (
							<>
								<Bell color={themeClrs.colors.textGrey} size={13} />
								<Text style={styles.date}>{showDueDate}</Text>
							</>
						)}
					</View>
				</TouchableOpacity>
			</View>
		</SwipeableRow>
	);
}

const createStyles = (themeClrs: any) =>
	StyleSheet.create({
		container: {
			flex: 1,
			display: 'flex',
			flexDirection: 'row',
			width: '100%',
			minHeight: 65,
			backgroundColor: themeClrs.colors.card,
			alignItems: 'center',
			justifyContent: 'flex-start',
			overflow: 'hidden',
			borderRadius: 8,
		},
		iconsWrapper: {
			flexDirection: 'row',
		},
		icon: {
			marginRight: 8,
			marginLeft: 10,
			color: themeClrs.colors.textGrey,
		},

		todo: {
			flex: 1,
			marginLeft: 8,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			width: '100%',
			paddingRight: 10,
		},
		action: {
			display: 'flex',
			flexDirection: 'row',
			marginTop: 8,
			gap: 5,
			justifyContent: 'flex-start',
			alignItems: 'center',
		},
		date: {
			fontSize: 12,
			color: themeClrs.colors.textMuted,
		},
		done: {
			textDecorationStyle: 'solid',
			textDecorationLine: 'line-through',
			color: themeClrs.colors.accent,
			opacity: 0.8,
		},
		doneIcon: {
			color: themeClrs.colors.accent,
			opacity: 0.8,
		},
		todoText: {
			fontSize: 18,
			color: themeClrs.colors.text,
			fontFamily: 'Inter_400Regular',
			fontWeight: '400',
			lineHeight: 24,
		},
	});
