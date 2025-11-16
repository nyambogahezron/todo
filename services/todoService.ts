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
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { getCurrentUser } from '@/lib/auth';
import { Todo } from '@/store/models';

const COLLECTION_NAME = 'todos';

// Helper to get user ID
const getUserId = (): string => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }
  return user.uid;
};

// Add a new todo
export const addTodo = async (
  todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const db = getFirebaseDb();
  const userId = getUserId();
  const now = new Date().toISOString();

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...todoData,
    userId,
    text: todoData.text || '',
    done: todoData.done ?? false,
    priority: todoData.priority || 'medium',
    dueDate: todoData.dueDate || '',
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
};

// Update a todo
export const updateTodo = async (
  id: string,
  updates: Partial<Omit<Todo, 'id' | 'createdAt'>>
): Promise<void> => {
  const db = getFirebaseDb();
  const userId = getUserId();
  const now = new Date().toISOString();

  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: now,
  });
};

// Delete a todo
export const deleteTodo = async (id: string): Promise<void> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

// Get a single todo by ID
export const getTodoById = async (id: string): Promise<Todo | null> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
    } as Todo;
  }

  return null;
};

// Get all todos for the current user
export const getAllTodos = async (): Promise<Todo[]> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('done', 'asc')
  );

  const querySnapshot = await getDocs(q);
  const todos: Todo[] = [];

  querySnapshot.forEach((doc) => {
    todos.push({
      id: doc.id,
      ...doc.data(),
    } as Todo);
  });

  return todos;
};

// Get todos by priority
export const getTodosByPriority = async (
  priority: 'low' | 'medium' | 'high'
): Promise<Todo[]> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('priority', '==', priority),
    orderBy('done', 'asc')
  );

  const querySnapshot = await getDocs(q);
  const todos: Todo[] = [];

  querySnapshot.forEach((doc) => {
    todos.push({
      id: doc.id,
      ...doc.data(),
    } as Todo);
  });

  return todos;
};

// Get done todos
export const getDoneTodos = async (): Promise<Todo[]> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('done', '==', true)
  );

  const querySnapshot = await getDocs(q);
  const todos: Todo[] = [];

  querySnapshot.forEach((doc) => {
    todos.push({
      id: doc.id,
      ...doc.data(),
    } as Todo);
  });

  return todos;
};

// Get undone todos
export const getUndoneTodos = async (): Promise<Todo[]> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('done', '==', false)
  );

  const querySnapshot = await getDocs(q);
  const todos: Todo[] = [];

  querySnapshot.forEach((doc) => {
    todos.push({
      id: doc.id,
      ...doc.data(),
    } as Todo);
  });

  return todos;
};

// Get overdue todos
export const getOverdueTodos = async (): Promise<Todo[]> => {
  const db = getFirebaseDb();
  const userId = getUserId();
  const now = new Date().toISOString();

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('done', '==', false)
  );

  const querySnapshot = await getDocs(q);
  const todos: Todo[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.dueDate && data.dueDate < now) {
      todos.push({
        id: doc.id,
        ...data,
      } as Todo);
    }
  });

  return todos;
};
