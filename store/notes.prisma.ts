import { getDb } from '@/lib/db';
import { Note } from '@prisma/client';
import { useState, useEffect, useCallback } from 'react';
import { randomUUID } from 'expo-crypto';
import { getCurrentTimestamp } from '@/utils/dateUtils';

// Re-export Note type for compatibility
export type { Note };

// Helper to parse tags from string
const parseTags = (tags: string | string[]): string[] => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try {
      return JSON.parse(tags);
    } catch {
      return tags ? [tags] : [];
    }
  }
  return [];
};

// Helper to stringify tags
const stringifyTags = (tags: string[]): string => {
  return JSON.stringify(tags);
};

// Direct database manipulation functions
export const addNote = async (
  noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const db = getDb();
  const id = randomUUID();
  const now = getCurrentTimestamp();

  await db.note.create({
    data: {
      id,
      title: noteData.title || '',
      content: noteData.content || '',
      tags: stringifyTags(noteData.tags || []),
      createdAt: now,
      updatedAt: now,
    },
  });

  return id;
};

export const updateNote = async (
  id: string,
  updates: Partial<Omit<Note, 'id' | 'createdAt'>>
): Promise<void> => {
  const db = getDb();
  const now = getCurrentTimestamp();

  const updateData: any = {
    ...updates,
    updatedAt: now,
  };

  // Handle tags conversion
  if (updates.tags !== undefined) {
    updateData.tags = stringifyTags(updates.tags);
  }

  await db.note.update({
    where: { id },
    data: updateData,
  });
};

export const deleteNote = async (id: string): Promise<void> => {
  const db = getDb();
  await db.note.delete({
    where: { id },
  });
};

export const getNoteById = async (id: string): Promise<Note | null> => {
  const db = getDb();
  return await db.note.findUnique({
    where: { id },
  });
};

export const getAllNotes = async (): Promise<Note[]> => {
  const db = getDb();
  return await db.note.findMany({
    orderBy: { updatedAt: 'desc' },
  });
};

export const getNotesByTag = async (tag: string): Promise<Note[]> => {
  const db = getDb();
  const allNotes = await db.note.findMany();
  return allNotes.filter((note) => {
    const tags = parseTags(note.tags);
    return tags.includes(tag);
  });
};

// React hooks for components
export const useNote = (id: string): Note | null => {
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    const loadNote = async () => {
      const result = await getNoteById(id);
      setNote(result);
    };
    loadNote();
  }, [id]);

  return note;
};

export const useNotes = (): {
  notes: Note[];
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const allNotes = await getAllNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { notes, loading, refresh };
};

export const useAddNote = () => {
  return useCallback(
    async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await addNote(noteData);
    },
    []
  );
};

export const useUpdateNote = () => {
  return useCallback(
    async (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
      await updateNote(id, updates);
    },
    []
  );
};

export const useDeleteNote = () => {
  return useCallback(async (id: string) => {
    await deleteNote(id);
  }, []);
};

export const useSortedNotes = (): {
  notes: Note[];
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  return useNotes(); // Already sorted by updatedAt
};

export const useAllNotes = (): {
  notes: Note[];
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  return useNotes();
};

