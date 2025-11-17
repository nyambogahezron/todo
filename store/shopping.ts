import useGenerateId from '@/utils/generateId';
import { Store } from 'tinybase';

// Table names
export const SHOPPING_LISTS_TABLE = 'shoppingLists';
export const SHOPPING_ITEMS_TABLE = 'shoppingItems';

// Schema definitions with QUOTED string literals
export const shoppingListsTableSchema = {
  id: { type: 'string' as const },
  title: { type: 'string' as const },
  createdAt: { type: 'number' as const },
  updatedAt: { type: 'number' as const }
};

export const shoppingItemsTableSchema = {
  id: { type: 'string' as const },
  listId: { type: 'string' as const },
  name: { type: 'string' as const },
  quantity: { type: 'number' as const },
  price: { type: 'number' as const },
  checked: { type: 'boolean' as const },
  createdAt: { type: 'number' as const },
  updatedAt: { type: 'number' as const }
};

// Initialize the shopping lists table
export const setupShoppingTables = (store: Store) => {
  // Initialize tables with schemas
  if (!store.hasTable(SHOPPING_LISTS_TABLE)) {
    store.setTablesSchema({
      [SHOPPING_LISTS_TABLE]: shoppingListsTableSchema,
      [SHOPPING_ITEMS_TABLE]: shoppingItemsTableSchema
    });
    
    // Create empty tables
    store.setTable(SHOPPING_LISTS_TABLE, {});
    store.setTable(SHOPPING_ITEMS_TABLE, {});
  }
};

// Safe getter for tables that might not exist yet
const safeGetTable = (store: Store, tableName: string) => {
  try {
    const table = store.getTable(tableName);
    return table || {};
  } catch (error) {
    console.warn(`Error getting table ${tableName}:`, error);
    return {};
  }
};

// CRUD operations for shopping lists
export const createShoppingList = (store: Store, title: string) => {
  const id = useGenerateId();
  const now = Date.now();
  
  try {
    store.setRow(SHOPPING_LISTS_TABLE, id, {
      id,
      title,
      createdAt: now,
      updatedAt: now
    });
    return id;
  } catch (error) {
    console.error("Error creating shopping list:", error);
    return "";
  }
};

export const getShoppingList = (store: Store, id: string) => {
  try {
    return store.getRow(SHOPPING_LISTS_TABLE, id) || null;
  } catch (error) {
    console.warn(`Error getting list ${id}:`, error);
    return null;
  }
};

export const getAllShoppingLists = (store: Store) => {
  return safeGetTable(store, SHOPPING_LISTS_TABLE);
};

export const updateShoppingList = (store: Store, id: string, title: string) => {
  try {
    store.setPartialRow(SHOPPING_LISTS_TABLE, id, {
      title,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error(`Error updating list ${id}:`, error);
  }
};

export const deleteShoppingList = (store: Store, id: string) => {
  try {
    // Delete all items in the list first
    const items = safeGetTable(store, SHOPPING_ITEMS_TABLE);
    Object.entries(items).forEach(([itemId, item]) => {
      if (item && item.listId === id) {
        try {
          store.delRow(SHOPPING_ITEMS_TABLE, itemId);
        } catch (e) {
          console.warn(`Error deleting item ${itemId}:`, e);
        }
      }
    });
    
    // Then delete the list
    store.delRow(SHOPPING_LISTS_TABLE, id);
  } catch (error) {
    console.error(`Error deleting list ${id}:`, error);
  }
};

// CRUD operations for shopping items
export const createShoppingItem = (
  store: Store, 
  listId: string, 
  name: string, 
  quantity: number = 1, 
  price: number = 0
) => {
  const id = useGenerateId();
  const now = Date.now();
  
  try {
    // Ensure quantity and price are valid numbers
    const safeQuantity = isNaN(Number(quantity)) ? 1 : Number(quantity);
    const safePrice = isNaN(Number(price)) ? 0 : Number(price);
    
    store.setRow(SHOPPING_ITEMS_TABLE, id, {
      id,
      listId,
      name: name || "Unnamed Item",
      quantity: safeQuantity,
      price: safePrice,
      checked: false,
      createdAt: now,
      updatedAt: now
    });
    
    return id;
  } catch (error) {
    console.error("Error creating shopping item:", error);
    return "";
  }
};

export const getShoppingItem = (store: Store, id: string) => {
  try {
    return store.getRow(SHOPPING_ITEMS_TABLE, id) || null;
  } catch (error) {
    console.warn(`Error getting item ${id}:`, error);
    return null;
  }
};

export const getItemsByListId = (store: Store, listId: string) => {
  try {
    const items = store.getTable(SHOPPING_ITEMS_TABLE) || {};
    const listItems: Record<string, any> = {};
    
    Object.entries(items).forEach(([id, item]) => {
      if (item && item.listId === listId) {
        listItems[id] = {
          ...item,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0
        };
      }
    });
    
    return listItems;
  } catch (error) {
    console.warn(`Error getting items for list ${listId}:`, error);
    return {};
  }
};

export const updateShoppingItem = (
  store: Store, 
  id: string, 
  updates: {
    name?: string;
    quantity?: number;
    price?: number;
    checked?: boolean;
  }
) => {
  try {
    // Ensure quantity and price are valid numbers if provided
    const safeUpdates = { ...updates };
    if (updates.quantity !== undefined) {
      safeUpdates.quantity = isNaN(Number(updates.quantity)) ? 0 : Number(updates.quantity);
    }
    if (updates.price !== undefined) {
      safeUpdates.price = isNaN(Number(updates.price)) ? 0 : Number(updates.price);
    }
    
    store.setPartialRow(SHOPPING_ITEMS_TABLE, id, {
      ...safeUpdates,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error(`Error updating item ${id}:`, error);
  }
};

export const deleteShoppingItem = (store: Store, id: string) => {
  try {
    store.delRow(SHOPPING_ITEMS_TABLE, id);
  } catch (error) {
    console.error(`Error deleting item ${id}:`, error);
  }
};

// Helper functions for calculations
export const getTotalItems = (store: Store, listId: string): number => {
  try {
    const items = getItemsByListId(store, listId);
    if (!items || Object.keys(items).length === 0) return 0;
    
    return Object.values(items).reduce((total, item: any) => {
      const quantity = Number(item?.quantity) || 0;
      return total + quantity;
    }, 0);
  } catch (error) {
    console.error(`Error calculating total items for list ${listId}:`, error);
    return 0;
  }
};

export const getTotalPrice = (store: Store, listId: string): number => {
  try {
    const items = getItemsByListId(store, listId);
    if (!items || Object.keys(items).length === 0) return 0;
    
    return Object.values(items).reduce((total, item: any) => {
      if (!item) return total;
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      return total + (quantity * price);
    }, 0);
  } catch (error) {
    console.error(`Error calculating total price for list ${listId}:`, error);
    return 0;
  }
};
