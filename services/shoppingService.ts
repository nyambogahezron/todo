import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { getCurrentUser } from '@/lib/auth';
import { ShoppingList, ShoppingItem } from '@/store/models';

const LISTS_COLLECTION = 'shoppingLists';
const ITEMS_COLLECTION = 'shoppingItems';

// Helper to get user ID
const getUserId = (): string => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }
  return user.uid;
};

// ===== Shopping Lists =====

// Create a new shopping list
export const createShoppingList = async (title: string): Promise<string> => {
  const db = getFirebaseDb();
  const userId = getUserId();
  const now = Date.now();

  const docRef = await addDoc(collection(db, LISTS_COLLECTION), {
    userId,
    title,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
};

// Get a single shopping list with its items
export const getShoppingList = async (
  id: string
): Promise<(ShoppingList & { items: ShoppingItem[] }) | null> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const listRef = doc(db, LISTS_COLLECTION, id);
  const listSnap = await getDoc(listRef);

  if (!listSnap.exists()) {
    return null;
  }

  const listData = listSnap.data() as ShoppingList;

  // Get items for this list
  const itemsQuery = query(
    collection(db, ITEMS_COLLECTION),
    where('listId', '==', id),
    orderBy('createdAt', 'asc')
  );

  const itemsSnap = await getDocs(itemsQuery);
  const items: ShoppingItem[] = [];

  itemsSnap.forEach((doc) => {
    items.push({
      id: doc.id,
      ...doc.data(),
    } as ShoppingItem);
  });

  return {
    id: listSnap.id,
    ...listData,
    items,
  };
};

// Get all shopping lists for the current user
export const getAllShoppingLists = async (): Promise<
  (ShoppingList & { items: ShoppingItem[] })[]
> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const q = query(
    collection(db, LISTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const lists: (ShoppingList & { items: ShoppingItem[] })[] = [];

  for (const docSnap of querySnapshot.docs) {
    const listData = docSnap.data() as ShoppingList;
    
    // Get items for this list
    const itemsQuery = query(
      collection(db, ITEMS_COLLECTION),
      where('listId', '==', docSnap.id),
      orderBy('createdAt', 'asc')
    );

    const itemsSnap = await getDocs(itemsQuery);
    const items: ShoppingItem[] = [];

    itemsSnap.forEach((itemDoc) => {
      items.push({
        id: itemDoc.id,
        ...itemDoc.data(),
      } as ShoppingItem);
    });

    lists.push({
      id: docSnap.id,
      ...listData,
      items,
    });
  }

  return lists;
};

// Update a shopping list
export const updateShoppingList = async (
  id: string,
  title: string
): Promise<void> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const docRef = doc(db, LISTS_COLLECTION, id);
  await updateDoc(docRef, {
    title,
    updatedAt: Date.now(),
  });
};

// Delete a shopping list and all its items
export const deleteShoppingList = async (id: string): Promise<void> => {
  const db = getFirebaseDb();
  const userId = getUserId();
  const batch = writeBatch(db);

  // Delete the list
  const listRef = doc(db, LISTS_COLLECTION, id);
  batch.delete(listRef);

  // Get all items for this list
  const itemsQuery = query(
    collection(db, ITEMS_COLLECTION),
    where('listId', '==', id)
  );

  const itemsSnap = await getDocs(itemsQuery);
  
  // Delete all items
  itemsSnap.forEach((itemDoc) => {
    batch.delete(itemDoc.ref);
  });

  await batch.commit();
};

// ===== Shopping Items =====

// Create a new shopping item
export const createShoppingItem = async (
  listId: string,
  name: string,
  quantity: number = 1,
  price: number = 0
): Promise<string> => {
  const db = getFirebaseDb();
  const userId = getUserId();
  const now = Date.now();

  const docRef = await addDoc(collection(db, ITEMS_COLLECTION), {
    userId,
    listId,
    name: name || 'Unnamed Item',
    quantity: isNaN(Number(quantity)) ? 1 : Number(quantity),
    price: isNaN(Number(price)) ? 0 : Number(price),
    checked: false,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
};

// Get a single shopping item
export const getShoppingItem = async (
  id: string
): Promise<ShoppingItem | null> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const docRef = doc(db, ITEMS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as ShoppingItem;
  }

  return null;
};

// Get all items for a specific list
export const getItemsByListId = async (listId: string): Promise<ShoppingItem[]> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const q = query(
    collection(db, ITEMS_COLLECTION),
    where('listId', '==', listId),
    orderBy('createdAt', 'asc')
  );

  const querySnapshot = await getDocs(q);
  const items: ShoppingItem[] = [];

  querySnapshot.forEach((doc) => {
    items.push({
      id: doc.id,
      ...doc.data(),
    } as ShoppingItem);
  });

  return items;
};

// Update a shopping item
export const updateShoppingItem = async (
  id: string,
  updates: {
    name?: string;
    quantity?: number;
    price?: number;
    checked?: boolean;
  }
): Promise<void> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const safeUpdates: any = { ...updates, updatedAt: Date.now() };

  if (updates.quantity !== undefined) {
    safeUpdates.quantity = isNaN(Number(updates.quantity))
      ? 0
      : Number(updates.quantity);
  }
  if (updates.price !== undefined) {
    safeUpdates.price = isNaN(Number(updates.price)) ? 0 : Number(updates.price);
  }

  const docRef = doc(db, ITEMS_COLLECTION, id);
  await updateDoc(docRef, safeUpdates);
};

// Delete a shopping item
export const deleteShoppingItem = async (id: string): Promise<void> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const docRef = doc(db, ITEMS_COLLECTION, id);
  await deleteDoc(docRef);
};

// ===== Helper Functions =====

// Get total items count for a list
export const getTotalItems = async (listId: string): Promise<number> => {
  const items = await getItemsByListId(listId);
  if (!items || items.length === 0) return 0;

  return items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    return total + quantity;
  }, 0);
};

// Get total price for a list
export const getTotalPrice = async (listId: string): Promise<number> => {
  const items = await getItemsByListId(listId);
  if (!items || items.length === 0) return 0;

  return items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return total + quantity * price;
  }, 0);
};
