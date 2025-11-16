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
import { Note } from '@/store/models';

const COLLECTION_NAME = 'notes';

// Helper to get user ID
const getUserId = (): string => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated');
  }
  return user.uid;
};

// Add a new note
export const addNote = async (
  noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const db = getFirebaseDb();
  const userId = getUserId();
  const now = new Date().toISOString();

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    userId,
    title: noteData.title || '',
    content: noteData.content || '',
    tags: noteData.tags || [],
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
};

// Update a note
export const updateNote = async (
  id: string,
  updates: Partial<Omit<Note, 'id' | 'createdAt'>>
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

// Delete a note
export const deleteNote = async (id: string): Promise<void> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

// Get a single note by ID
export const getNoteById = async (id: string): Promise<Note | null> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
    } as Note;
  }

  return null;
};

// Get all notes for the current user
export const getAllNotes = async (): Promise<Note[]> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const notes: Note[] = [];

  querySnapshot.forEach((doc) => {
    notes.push({
      id: doc.id,
      ...doc.data(),
    } as Note);
  });

  return notes;
};

// Get notes by tag
export const getNotesByTag = async (tag: string): Promise<Note[]> => {
  const db = getFirebaseDb();
  const userId = getUserId();

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('tags', 'array-contains', tag)
  );

  const querySnapshot = await getDocs(q);
  const notes: Note[] = [];

  querySnapshot.forEach((doc) => {
    notes.push({
      id: doc.id,
      ...doc.data(),
    } as Note);
  });

  return notes;
};
