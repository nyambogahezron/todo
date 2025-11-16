import { useState, useEffect, useCallback } from 'react';
import * as shoppingService from '@/services/shoppingService';
import { ShoppingList, ShoppingItem } from './models';

// Re-export all service functions
export const createShoppingList = shoppingService.createShoppingList;
export const getShoppingList = shoppingService.getShoppingList;
export const getAllShoppingLists = shoppingService.getAllShoppingLists;
export const updateShoppingList = shoppingService.updateShoppingList;
export const deleteShoppingList = shoppingService.deleteShoppingList;
export const createShoppingItem = shoppingService.createShoppingItem;
export const getShoppingItem = shoppingService.getShoppingItem;
export const getItemsByListId = shoppingService.getItemsByListId;
export const updateShoppingItem = shoppingService.updateShoppingItem;
export const deleteShoppingItem = shoppingService.deleteShoppingItem;
export const getTotalItems = shoppingService.getTotalItems;
export const getTotalPrice = shoppingService.getTotalPrice;

// React hooks for shopping lists
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

export const useShoppingList = (
  id: string
): {
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

export const useShoppingItems = (
  listId: string
): {
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

