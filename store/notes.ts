import { useState, useEffect, useCallback } from 'react';
import * as noteService from '@/services/noteService';
import { Note } from './models';

// Re-export all service functions
export const addNote = noteService.addNote;
export const updateNote = noteService.updateNote;
export const deleteNote = noteService.deleteNote;
export const getNoteById = noteService.getNoteById;
export const getAllNotes = noteService.getAllNotes;
export const getNotesByTag = noteService.getNotesByTag;

// React hooks for components
export const useNote = (id: string): Note | null => {
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    const loadNote = async () => {
      try {
        const result = await getNoteById(id);
        setNote(result);
      } catch (error) {
        console.error('Error loading note:', error);
      }
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
