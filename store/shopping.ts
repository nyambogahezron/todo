import { getDb } from '@/lib/db';
import { shoppingLists, shoppingItems } from '@/db/schema';
import type { ShoppingList, ShoppingItem, InsertShoppingList, InsertShoppingItem } from '@/db/schema';
import { useState, useEffect, useCallback } from 'react';
import { randomUUID } from 'expo-crypto';
import { eq, desc, asc } from 'drizzle-orm';

// Re-export types for compatibility
export type { ShoppingList, ShoppingItem };

// Type for shopping list with items
export type ShoppingListWithItems = ShoppingList & { items: ShoppingItem[] };

// CRUD operations for shopping lists
export const createShoppingList = async (title: string): Promise<string> => {
  const db = getDb();
  const id = randomUUID();
  const now = Date.now();

  await db.insert(shoppingLists).values({
    id,
    title,
    createdAt: now,
    updatedAt: now,
  });

  return id;
};

export const getShoppingList = async (id: string): Promise<ShoppingListWithItems | null> => {
  const db = getDb();
  const list = await db.select().from(shoppingLists).where(eq(shoppingLists.id, id)).limit(1);
  if (!list[0]) return null;

  const items = await db.select().from(shoppingItems).where(eq(shoppingItems.listId, id));
  
  return {
    ...list[0],
    items: items || [],
  };
};

export const getAllShoppingLists = async (): Promise<ShoppingListWithItems[]> => {
  const db = getDb();
  const lists = await db.select().from(shoppingLists).orderBy(desc(shoppingLists.updatedAt));
  
  // Fetch items for each list
  const listsWithItems = await Promise.all(
    lists.map(async (list) => {
      const items = await db.select().from(shoppingItems).where(eq(shoppingItems.listId, list.id));
      return {
        ...list,
        items: items || [],
      };
    })
  );

  return listsWithItems;
};

export const updateShoppingList = async (
  id: string,
  title: string
): Promise<void> => {
  const db = getDb();
  await db
    .update(shoppingLists)
    .set({
      title,
      updatedAt: Date.now(),
    })
    .where(eq(shoppingLists.id, id));
};

export const deleteShoppingList = async (id: string): Promise<void> => {
  const db = getDb();
  // Delete items first (or rely on CASCADE if supported)
  await db.delete(shoppingItems).where(eq(shoppingItems.listId, id));
  // Then delete the list
  await db.delete(shoppingLists).where(eq(shoppingLists.id, id));
};

// CRUD operations for shopping items
export const createShoppingItem = async (
  listId: string,
  name: string,
  quantity: number = 1,
  price: number = 0
): Promise<string> => {
  const db = getDb();
  const id = randomUUID();
  const now = Date.now();

  await db.insert(shoppingItems).values({
    id,
    listId,
    name: name || 'Unnamed Item',
    quantity: isNaN(Number(quantity)) ? 1 : Number(quantity),
    price: isNaN(Number(price)) ? 0 : Number(price),
    checked: false,
    createdAt: now,
    updatedAt: now,
  });

  return id;
};

export const getShoppingItem = async (id: string): Promise<ShoppingItem | null> => {
  const db = getDb();
  const result = await db.select().from(shoppingItems).where(eq(shoppingItems.id, id)).limit(1);
  return result[0] || null;
};

export const getItemsByListId = async (listId: string): Promise<ShoppingItem[]> => {
  const db = getDb();
  return await db
    .select()
    .from(shoppingItems)
    .where(eq(shoppingItems.listId, listId))
    .orderBy(asc(shoppingItems.createdAt));
};

export const updateShoppingItem = async (
  id: string,
  updates: {
    name?: string;
    quantity?: number;
    price?: number;
    checked?: boolean;
  }
): Promise<void> => {
  const db = getDb();
  const safeUpdates: any = { ...updates, updatedAt: Date.now() };

  if (updates.quantity !== undefined) {
    safeUpdates.quantity = isNaN(Number(updates.quantity)) ? 0 : Number(updates.quantity);
  }
  if (updates.price !== undefined) {
    safeUpdates.price = isNaN(Number(updates.price)) ? 0 : Number(updates.price);
  }

  await db
    .update(shoppingItems)
    .set(safeUpdates)
    .where(eq(shoppingItems.id, id));
};

export const deleteShoppingItem = async (id: string): Promise<void> => {
  const db = getDb();
  await db.delete(shoppingItems).where(eq(shoppingItems.id, id));
};

// Helper functions for calculations
export const getTotalItems = async (listId: string): Promise<number> => {
  const items = await getItemsByListId(listId);
  if (!items || items.length === 0) return 0;

  return items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    return total + quantity;
  }, 0);
};

export const getTotalPrice = async (listId: string): Promise<number> => {
  const items = await getItemsByListId(listId);
  if (!items || items.length === 0) return 0;

  return items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return total + quantity * price;
  }, 0);
};

// React hooks for components
export const useShoppingLists = (): {
  lists: ShoppingListWithItems[];
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  const [lists, setLists] = useState<ShoppingListWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const allLists = await getAllShoppingLists();
      setLists(allLists);
    } catch (error) {
      console.error('Error loading shopping lists:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { lists, loading, refresh };
};

export const useShoppingList = (id: string): {
  list: ShoppingListWithItems | null;
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  const [list, setList] = useState<ShoppingListWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getShoppingList(id);
      setList(result);
    } catch (error) {
      console.error('Error loading shopping list:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { list, loading, refresh };
};

export const useShoppingItems = (listId: string): {
  items: ShoppingItem[];
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const listItems = await getItemsByListId(listId);
      setItems(listItems);
    } catch (error) {
      console.error('Error loading shopping items:', error);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, refresh };
};
