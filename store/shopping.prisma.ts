import { getDb } from '@/lib/db';
import { ShoppingList, ShoppingItem } from '@prisma/client';
import { useState, useEffect, useCallback } from 'react';
import { randomUUID } from 'expo-crypto';

// Re-export types for compatibility
export type { ShoppingList, ShoppingItem };

// CRUD operations for shopping lists
export const createShoppingList = async (title: string): Promise<string> => {
  const db = getDb();
  const id = randomUUID();
  const now = Date.now();

  await db.shoppingList.create({
    data: {
      id,
      title,
      createdAt: now,
      updatedAt: now,
    },
  });

  return id;
};

export const getShoppingList = async (id: string): Promise<(ShoppingList & { items: ShoppingItem[] }) | null> => {
  const db = getDb();
  return await db.shoppingList.findUnique({
    where: { id },
    include: { items: true },
  });
};

export const getAllShoppingLists = async (): Promise<(ShoppingList & { items: ShoppingItem[] })[]> => {
  const db = getDb();
  return await db.shoppingList.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { items: true },
  });
};

export const updateShoppingList = async (
  id: string,
  title: string
): Promise<void> => {
  const db = getDb();
  await db.shoppingList.update({
    where: { id },
    data: {
      title,
      updatedAt: Date.now(),
    },
  });
};

export const deleteShoppingList = async (id: string): Promise<void> => {
  const db = getDb();
  // Items will be deleted automatically due to cascade
  await db.shoppingList.delete({
    where: { id },
  });
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

  await db.shoppingItem.create({
    data: {
      id,
      listId,
      name: name || 'Unnamed Item',
      quantity: isNaN(Number(quantity)) ? 1 : Number(quantity),
      price: isNaN(Number(price)) ? 0 : Number(price),
      checked: false,
      createdAt: now,
      updatedAt: now,
    },
  });

  return id;
};

export const getShoppingItem = async (id: string): Promise<ShoppingItem | null> => {
  const db = getDb();
  return await db.shoppingItem.findUnique({
    where: { id },
  });
};

export const getItemsByListId = async (listId: string): Promise<ShoppingItem[]> => {
  const db = getDb();
  return await db.shoppingItem.findMany({
    where: { listId },
    orderBy: { createdAt: 'asc' },
  });
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

  await db.shoppingItem.update({
    where: { id },
    data: safeUpdates,
  });
};

export const deleteShoppingItem = async (id: string): Promise<void> => {
  const db = getDb();
  await db.shoppingItem.delete({
    where: { id },
  });
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
  lists: (ShoppingList & { items: ShoppingItem[] })[];
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  const [lists, setLists] = useState<(ShoppingList & { items: ShoppingItem[] })[]>([]);
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
  list: (ShoppingList & { items: ShoppingItem[] }) | null;
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  const [list, setList] = useState<(ShoppingList & { items: ShoppingItem[] }) | null>(null);
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

