import { Store } from 'tinybase';
import {
	useAddRowCallback,
	useDelRowCallback,
	useRow,
	useSetCellCallback,
	useSortedRowIds,
	useTable,
} from 'tinybase/ui-react';
import { useStore } from 'tinybase/ui-react';
import { randomUUID } from 'expo-crypto';
import { getCurrentTimestamp } from '@/utils/dateUtils';
import { Note } from './models';

// Schema constants
export const NOTES_TABLE = 'notes';
export const ID_CELL = 'id';
export const TITLE_CELL = 'title';
export const CONTENT_CELL = 'content';
export const TAGS_CELL = 'tags';
export const CREATED_AT_CELL = 'createdAt';
export const UPDATED_AT_CELL = 'updatedAt';

// Schema definition
export const notesTableSchema = {
	[ID_CELL]: { type: 'string' as const },
	[TITLE_CELL]: { type: 'string' as const },
	[CONTENT_CELL]: { type: 'string' as const },
	[TAGS_CELL]: { type: 'string' as const, default: '[]' }, // Stored as JSON string
	[CREATED_AT_CELL]: { type: 'string' as const, default: '' },
	[UPDATED_AT_CELL]: { type: 'string' as const, default: '' },
};

// Initialize or access the notes table
export const setupNotesTable = (store: Store): void => {
	if (!store.hasTable(NOTES_TABLE)) {
		store.setTable(NOTES_TABLE, {});
	}
};

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

// Direct store manipulation functions
export const addNote = (
	store: Store,
	noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
): string => {
	const id = randomUUID();
	const now = getCurrentTimestamp();

	store.setRow(NOTES_TABLE, id, {
		id,
		title: noteData.title || '',
		content: noteData.content || '',
		tags: stringifyTags(noteData.tags || []),
		createdAt: now,
		updatedAt: now,
	});

	return id;
};

export const updateNote = (
	store: Store,
	id: string,
	updates: Partial<Omit<Note, 'id' | 'createdAt'>>
): void => {
	const stringId = String(id);
	
	if (!store.hasRow(NOTES_TABLE, stringId)) {
		console.error('Cannot find note with ID:', stringId);
		return;
	}
	
	const note = store.getRow(NOTES_TABLE, stringId);
	if (note) {
		const now = getCurrentTimestamp();
		const updateData: any = {
			...updates,
			updatedAt: now,
		};
		
		// Handle tags conversion
		if (updates.tags !== undefined) {
			updateData.tags = stringifyTags(updates.tags);
		}
		
		store.setPartialRow(NOTES_TABLE, stringId, updateData);
	}
};

export const deleteNote = (store: Store, id: string): void => {
	store.delRow(NOTES_TABLE, id);
};

// React hooks for components
export const useNote = (id: string): Note | null => {
	const row = useRow(NOTES_TABLE, String(id));
	
	if (!row || typeof row !== 'object') return null;
	
	return {
		id: row.id as string || id,
		title: row.title as string || '',
		content: row.content as string || '',
		tags: parseTags(row.tags as string | string[]),
		createdAt: row.createdAt as string || '',
		updatedAt: row.updatedAt as string || '',
	};
};

export const useAddNote = () => {
	return useAddRowCallback(
		NOTES_TABLE,
		(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
			const id = randomUUID();
			const now = getCurrentTimestamp();

			return {
				id,
				title: noteData.title || '',
				content: noteData.content || '',
				tags: stringifyTags(noteData.tags || []),
				createdAt: now,
				updatedAt: now,
			};
		}
	);
};

export const useUpdateNoteCallback = (id: string) => {
	return useSetCellCallback(NOTES_TABLE, id, UPDATED_AT_CELL, () =>
		getCurrentTimestamp()
	);
};

export const useDeleteNote = (id: string) => {
	return useDelRowCallback(NOTES_TABLE, id);
};

export const useSortedNotes = () => {
	// Sort by updatedAt descending (most recently updated first)
	return useSortedRowIds(NOTES_TABLE, UPDATED_AT_CELL, true);
};

export const useAllNotes = (): Note[] => {
	const table = useTable(NOTES_TABLE);
	
	if (!table) return [];
	
	return Object.entries(table).map(([id, row]: [string, any]) => ({
		id: row.id || id,
		title: row.title || '',
		content: row.content || '',
		tags: parseTags(row.tags || '[]'),
		createdAt: row.createdAt || '',
		updatedAt: row.updatedAt || '',
	}));
};

// Filter functions
export const getNotesByTag = (
	store: Store,
	tag: string
): Record<string, Note> => {
	const notes = store.getTable(NOTES_TABLE);
	if (!notes) return {};

	return Object.entries(notes).reduce((filtered, [id, note]: [string, any]) => {
		const tags = parseTags(note.tags || '[]');
		if (tags.includes(tag)) {
			filtered[id] = {
				id: note.id || id,
				title: note.title || '',
				content: note.content || '',
				tags: parseTags(note.tags || '[]'),
				createdAt: note.createdAt || '',
				updatedAt: note.updatedAt || '',
			};
		}
		return filtered;
	}, {} as Record<string, Note>);
};

export const getNoteById = (store: Store, id: string): Note | null => {
	if (!store) return null;

	const note = store.getRow(NOTES_TABLE, id);
	if (!note) return null;

	return {
		id: note.id as string || id,
		title: note.title as string || '',
		content: note.content as string || '',
		tags: parseTags(note.tags as string | string[]),
		createdAt: note.createdAt as string || '',
		updatedAt: note.updatedAt as string || '',
	};
};

// Re-export useStore
export { useStore } from 'tinybase/ui-react';

