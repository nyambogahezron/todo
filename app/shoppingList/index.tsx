import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	FlatList,
	Alert,
	Dimensions,
} from 'react-native';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	withSpring,
	Easing as ReanimatedEasing,
} from 'react-native-reanimated';
import {
	useShoppingLists,
	useShoppingItems,
	createShoppingList,
	createShoppingItem,
	updateShoppingItem,
	deleteShoppingItem,
	deleteShoppingList,
	getTotalItems,
	getTotalPrice,
} from '@/store/shopping';

// Add type definitions
interface ShoppingItem {
	id: string;
	listId: string;
	name: string;
	quantity: number;
	price: number;
	checked: boolean;
	createdAt: number;
	updatedAt: number;
}

export default function ShoppingList() {
	const [selectedListId, setSelectedListId] = useState<string | null>(null);
	const [newListTitle, setNewListTitle] = useState('');
	const [newItemName, setNewItemName] = useState('');
	const [newItemQuantity, setNewItemQuantity] = useState('1');
	const [newItemPrice, setNewItemPrice] = useState('0');
	const [editingItemId, setEditingItemId] = useState<string | null>(null);
	const [editItemData, setEditItemData] = useState({
		name: '',
		quantity: '',
		price: '',
	});
	// Track if bottom sheet has been opened
	const [hasOpenedSheet, setHasOpenedSheet] = useState(false);

	// Bottom sheet ref
	const bottomSheetRef = useRef<BottomSheet>(null);

	// Get shopping lists using Prisma
	const { lists: shoppingListsData, loading: listsLoading, refresh: refreshLists } = useShoppingLists();
	
	// Get shopping items for selected list
	const { items: shoppingItemsData, loading: itemsLoading, refresh: refreshItems } = useShoppingItems(selectedListId || '');

	// Animation for grid container
	const gridOpacity = useSharedValue(0);
	const gridY = useSharedValue(20);
	
	// Initialize grid animation
	useEffect(() => {
		gridOpacity.value = withTiming(1, {
			duration: 400,
			easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
		});
		gridY.value = withSpring(0, {
			damping: 15,
			stiffness: 100,
		});
	}, []);
	
	const gridAnimatedStyle = useAnimatedStyle(() => ({
		opacity: gridOpacity.value,
		transform: [{ translateY: gridY.value }],
	}));

	// Convert lists array to object for compatibility
	const shoppingLists = React.useMemo(() => {
		const listsObj: Record<string, any> = {};
		shoppingListsData.forEach(list => {
			listsObj[list.id] = list;
		});
		return listsObj;
	}, [shoppingListsData]);

	// Convert items array to object for compatibility
	const shoppingItems = React.useMemo(() => {
		const itemsObj: Record<string, ShoppingItem> = {};
		shoppingItemsData.forEach(item => {
			itemsObj[item.id] = item as ShoppingItem;
		});
		return itemsObj;
	}, [shoppingItemsData]);

	// Calculate totals
	const totalItems = React.useMemo(() => {
		return shoppingItemsData.reduce(
			(sum, item) => sum + (Number(item.quantity) || 0),
			0
		);
	}, [shoppingItemsData]);

	const totalPrice = React.useMemo(() => {
		return shoppingItemsData.reduce((sum, item) => {
			const quantity = Number(item.quantity) || 0;
			const price = Number(item.price) || 0;
			return sum + quantity * price;
		}, 0);
	}, [shoppingItemsData]);

	// Create a new shopping list
	const handleAddList = async () => {
		if (!newListTitle.trim()) {
			Alert.alert('Error', 'Please enter a list title');
			return;
		}

		try {
			const listId = await createShoppingList(newListTitle);
			setNewListTitle('');
			setSelectedListId(listId);
			refreshLists();
		} catch (error) {
			console.error('Error creating list:', error);
			Alert.alert('Error', 'Failed to create list');
		}
	};

	// Create a new shopping item
	const handleAddItem = async () => {
		if (!selectedListId) return;

		if (!newItemName.trim()) {
			Alert.alert('Error', 'Please enter an item name');
			return;
		}

		try {
			await createShoppingItem(
				selectedListId,
				newItemName,
				Number(newItemQuantity) || 1,
				Number(newItemPrice) || 0
			);

			setNewItemName('');
			setNewItemQuantity('1');
			setNewItemPrice('0');
			refreshItems();
		} catch (error) {
			console.error('Error adding item:', error);
			Alert.alert('Error', 'Failed to add item');
		}
	};

	// Toggle item checked status
	const toggleItemChecked = async (itemId: string, currentValue: boolean) => {
		try {
			await updateShoppingItem(itemId, { checked: !currentValue });
			refreshItems();
		} catch (error) {
			console.error('Error toggling item:', error);
		}
	};

	// Delete a shopping item
	const handleDeleteItem = (itemId: string) => {
		Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				onPress: async () => {
					try {
						await deleteShoppingItem(itemId);
						refreshItems();
					} catch (error) {
						console.error('Error deleting item:', error);
						Alert.alert('Error', 'Failed to delete item');
					}
				},
				style: 'destructive',
			},
		]);
	};

	// Delete a shopping list
	const handleDeleteList = (listId: string) => {
		Alert.alert(
			'Delete List',
			'Are you sure you want to delete this list and all its items?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					onPress: async () => {
						try {
							await deleteShoppingList(listId);
							if (selectedListId === listId) {
								setSelectedListId(null);
							}
							refreshLists();
						} catch (error) {
							console.error('Error deleting list:', error);
							Alert.alert('Error', 'Failed to delete list');
						}
					},
					style: 'destructive',
				},
			]
		);
	};

	// Define multiple snap points as fixed numbers instead of percentages
	const snapPoints = React.useMemo(() => [200, 400, 600], []);

	// Get window dimensions for containerHeight
	const { height: windowHeight } = React.useMemo(() => {
		const { height } = require('react-native').Dimensions.get('window');
		return { height };
	}, []);

	// Helper function to safely open the sheet
	const safelyOpenSheet = useCallback((index: number = 0) => {
		console.log('Trying to open bottom sheet to index:', index);
		try {
			if (bottomSheetRef.current) {
				console.log('Bottom sheet ref exists, calling snapToIndex');
				bottomSheetRef.current.snapToIndex(index);
				setHasOpenedSheet(true);
				console.log('Bottom sheet opened successfully');
			} else {
				console.log('Bottom sheet ref is null');
			}
		} catch (error) {
			console.error('Error opening bottom sheet:', error);
		}
	}, []);

	// Add an effect to try opening the sheet when selectedListId changes
	useEffect(() => {
		if (selectedListId) {
			console.log('selectedListId changed to:', selectedListId);
			// Wait until component is fully mounted and rendered
			const timer = setTimeout(() => {
				console.log('Timeout elapsed, trying to open sheet');
				safelyOpenSheet(0);
			}, 500);

			return () => clearTimeout(timer);
		}
	}, [selectedListId, safelyOpenSheet]);

	// Callbacks
	const handleListSelect = useCallback((listId: string) => {
		console.log('List selected:', listId);
		setSelectedListId(listId);
	}, []);

	const handleEditItem = (item: ShoppingItem) => {
		setEditingItemId(item.id);
		setEditItemData({
			name: item.name,
			quantity: String(item.quantity),
			price: String(item.price),
		});
	};

	const handleUpdateItem = async () => {
		if (!editingItemId) return;

		try {
			await updateShoppingItem(editingItemId, {
				name: editItemData.name,
				quantity: Number(editItemData.quantity),
				price: Number(editItemData.price),
			});

			setEditingItemId(null);
			setEditItemData({ name: '', quantity: '', price: '' });
			refreshItems();
		} catch (error) {
			console.error('Error updating item:', error);
			Alert.alert('Error', 'Failed to update item');
		}
	};

	// Add a function to initialize and configure the BottomSheet instance
	const handleSheetChanges = useCallback((index: number) => {
		console.log('BottomSheet index changed to:', index);
		if (index === -1) {
			setSelectedListId(null);
		}
	}, []);

	// Create a dynamic BottomSheet component based on whether a list is selected
	const renderBottomSheet = () => (
		<BottomSheet
			ref={bottomSheetRef}
			snapPoints={snapPoints}
			enablePanDownToClose={true}
			index={-1}
			animateOnMount={false}
			enableContentPanningGesture={true}
			enableHandlePanningGesture={true}
			handleComponent={() => (
				<View style={styles.handleComponent}>
					<View style={styles.handle} />
				</View>
			)}
			onChange={handleSheetChanges}
		>
			<View style={styles.bottomSheetContent}>
				{selectedListId && (
					<>
						<Text style={styles.bottomSheetTitle}>
							{shoppingLists[selectedListId]?.title || 'Items'}
						</Text>

						{/* Add Item Form */}
						<View style={styles.addItemContainer}>
							<TextInput
								style={styles.itemInput}
								placeholder='Item name'
								value={newItemName}
								onChangeText={setNewItemName}
							/>
							<TextInput
								style={styles.quantityInput}
								placeholder='Qty'
								value={newItemQuantity}
								onChangeText={setNewItemQuantity}
								keyboardType='numeric'
							/>
							<TextInput
								style={styles.priceInput}
								placeholder='Price'
								value={newItemPrice}
								onChangeText={setNewItemPrice}
								keyboardType='numeric'
							/>
							<TouchableOpacity
								style={styles.addItemButton}
								onPress={handleAddItem}
							>
								<Ionicons name='add' size={24} color='white' />
							</TouchableOpacity>
						</View>

						{/* Items List */}
						<FlatList
							data={Object.values(shoppingItems)}
							renderItem={renderItem}
							keyExtractor={(item: ShoppingItem) => item.id}
							style={styles.listContainer}
							ListEmptyComponent={
								<Text style={styles.emptyText}>No items in this list</Text>
							}
						/>

						{/* Summary */}
						<View style={styles.summary}>
							<Text style={styles.summaryText}>Total Items: {totalItems}</Text>
							<Text style={styles.summaryText}>
								Total Price: ${totalPrice.toFixed(2)}
							</Text>
						</View>
					</>
				)}
			</View>
		</BottomSheet>
	);

	// Render item with edit functionality
	const renderItem = ({ item }: { item: ShoppingItem }) => (
		<View>
			<View style={styles.itemContainer}>
				<TouchableOpacity
					style={styles.checkBox}
					onPress={() => toggleItemChecked(item.id, item.checked)}
				>
					{item.checked ? (
						<Ionicons name='checkmark-circle' size={24} color='green' />
					) : (
						<Ionicons name='ellipse-outline' size={24} color='gray' />
					)}
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.itemDetails}
					onPress={() => handleEditItem(item)}
				>
					<Text style={[styles.itemName, item.checked && styles.checkedText]}>
						{item.name}
					</Text>
					<Text style={styles.itemInfo}>
						Qty: {item.quantity || 0} × ${(item.price || 0).toFixed(2)} = $
						{((item.quantity || 0) * (item.price || 0)).toFixed(2)}
					</Text>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
					<Ionicons name='trash-outline' size={24} color='red' />
				</TouchableOpacity>
			</View>

			{/* Edit form */}
			{editingItemId === item.id && (
				<View style={styles.editContainer}>
					<TextInput
						style={styles.editInput}
						value={editItemData.name}
						onChangeText={(text) =>
							setEditItemData((prev) => ({ ...prev, name: text }))
						}
						placeholder='Item name'
					/>
					<TextInput
						style={styles.editInput}
						value={editItemData.quantity}
						onChangeText={(text) =>
							setEditItemData((prev) => ({ ...prev, quantity: text }))
						}
						keyboardType='numeric'
						placeholder='Quantity'
					/>
					<TextInput
						style={styles.editInput}
						value={editItemData.price}
						onChangeText={(text) =>
							setEditItemData((prev) => ({ ...prev, price: text }))
						}
						keyboardType='numeric'
						placeholder='Price'
					/>
					<View style={styles.editButtons}>
						<TouchableOpacity
							style={[styles.editButton, styles.cancelButton]}
							onPress={() => setEditingItemId(null)}
						>
							<Text style={styles.editButtonText}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.editButton, styles.saveButton]}
							onPress={handleUpdateItem}
						>
							<Text style={styles.editButtonText}>Save</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</View>
	);

	return (
		<GestureHandlerRootView style={styles.rootView}>
			<View style={styles.container}>
				<Text style={styles.title}>Shopping Lists</Text>

				{/* Shopping Lists Grid */}
				<Animated.View style={[styles.listsGrid, gridAnimatedStyle]}>
					{shoppingLists &&
						Object.entries(shoppingLists).map(([id, list]: [string, any]) => (
							<TouchableOpacity
								key={id}
								style={[
									styles.gridItem,
									selectedListId === id && styles.selectedGridItem,
								]}
								onPress={() => handleListSelect(id)}
							>
								<Text style={styles.gridItemTitle}>
									{list?.title || 'Untitled'}
								</Text>
								<View style={styles.gridItemFooter}>
									<Text style={styles.gridItemCount}>
										{list.items?.length || 0} items
									</Text>
									<TouchableOpacity onPress={() => handleDeleteList(id)}>
										<Ionicons name='trash-outline' size={20} color='red' />
									</TouchableOpacity>
								</View>
							</TouchableOpacity>
						))}

					{/* Add New List Button */}
					<View style={styles.addListContainer}>
						<TextInput
							style={styles.addListInput}
							placeholder='New list name...'
							value={newListTitle}
							onChangeText={setNewListTitle}
						/>
						<TouchableOpacity
							style={styles.addListButton}
							onPress={handleAddList}
						>
							<Ionicons name='add' size={24} color='white' />
						</TouchableOpacity>
					</View>
				</Animated.View>

				{/* Dynamically render the BottomSheet */}
				{renderBottomSheet()}
			</View>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#f8f8f8',
		marginTop: 48,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 16,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 12,
	},
	section: {
		backgroundColor: 'white',
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	addContainer: {
		flexDirection: 'row',
		marginBottom: 16,
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 4,
		padding: 8,
		marginRight: 8,
	},
	addButton: {
		backgroundColor: '#007AFF',
		borderRadius: 4,
		paddingHorizontal: 12,
		paddingVertical: 8,
		justifyContent: 'center',
	},
	buttonText: {
		color: 'white',
		fontWeight: 'bold',
	},
	listsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	listItem: {
		backgroundColor: '#f0f0f0',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 4,
		marginBottom: 8,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		minWidth: 150,
	},
	selectedListItem: {
		backgroundColor: '#e0f0ff',
		borderWidth: 1,
		borderColor: '#007AFF',
	},
	listTitle: {
		fontSize: 16,
		marginRight: 8,
	},
	addItemContainer: {
		flexDirection: 'row',
		marginBottom: 16,
	},
	itemInput: {
		flex: 3,
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 4,
		padding: 8,
		marginRight: 8,
	},
	quantityInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 4,
		padding: 8,
		marginRight: 8,
	},
	priceInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 4,
		padding: 8,
		marginRight: 8,
	},
	addItemButton: {
		backgroundColor: '#007AFF',
		borderRadius: 4,
		width: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	listContainer: {
		maxHeight: 300,
		marginBottom: 16,
	},
	itemContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	checkBox: {
		marginRight: 8,
	},
	itemDetails: {
		flex: 1,
		marginRight: 8,
	},
	itemName: {
		fontSize: 16,
		marginBottom: 4,
	},
	checkedText: {
		textDecorationLine: 'line-through',
		color: '#888',
	},
	itemInfo: {
		fontSize: 14,
		color: '#666',
	},
	emptyText: {
		textAlign: 'center',
		color: '#888',
		padding: 16,
	},
	summary: {
		borderTopWidth: 1,
		borderTopColor: '#eee',
		paddingTop: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	summaryText: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	listsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	gridItem: {
		backgroundColor: '#f0f0f0',
		padding: 12,
		borderRadius: 4,
		minWidth: '45%',
		marginBottom: 8,
	},
	selectedGridItem: {
		backgroundColor: '#e0f0ff',
		borderWidth: 1,
		borderColor: '#007AFF',
	},
	gridItemTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	gridItemFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	gridItemCount: {
		fontSize: 14,
		color: '#666',
	},
	addListContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		backgroundColor: '#f0f0f0',
		borderRadius: 4,
		marginBottom: 8,
	},
	addListInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 4,
		padding: 8,
		marginRight: 8,
	},
	addListButton: {
		backgroundColor: '#007AFF',
		borderRadius: 4,
		padding: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	bottomSheetContent: {
		padding: 16,
	},
	bottomSheetTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 16,
	},
	editContainer: {
		padding: 16,
	},
	editInput: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 4,
		padding: 8,
		marginBottom: 8,
	},
	editButtons: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 16,
	},
	editButton: {
		padding: 8,
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 4,
	},
	cancelButton: {
		marginRight: 8,
	},
	saveButton: {
		backgroundColor: '#007AFF',
		borderWidth: 1,
		borderColor: '#007AFF',
		borderRadius: 4,
	},
	editButtonText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: 'white',
	},
	handleComponent: {
		backgroundColor: 'white',
		paddingVertical: 10,
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		alignItems: 'center',
	},
	handle: {
		width: 40,
		height: 5,
		backgroundColor: '#DDDDDD',
		borderRadius: 3,
	},
	rootView: {
		flex: 1,
	},
});
