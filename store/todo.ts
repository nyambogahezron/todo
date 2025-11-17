import { Store } from 'tinybase';
import {
	useAddRowCallback,
	useDelRowCallback,
	useDelTableCallback,
	useHasTable,
	useRow,
	useSetCellCallback,
	useSortedRowIds,
} from 'tinybase/ui-react';
import { useStore } from 'tinybase/ui-react';
import React from 'react';
// Schema constants
export const TODO_TABLE = 'todo';
export const ID_CELL = 'id';
export const TEXT_CELL = 'text';
export const DONE_CELL = 'done';
export const PRIORITY_CELL = 'priority';
export const DUE_DATE_CELL = 'dueDate';
export const CREATED_AT_CELL = 'createdAt';
export const UPDATED_AT_CELL = 'updatedAt';

// Todo type definition to be used across the app
export type Todo = {
	id: string;
	text: string;
	done: boolean;
	priority: 'low' | 'medium' | 'high';
	dueDate: string;
	createdAt: string;
	updatedAt: string;
};

// Schema definition
export const todoTableSchema = {
	[ID_CELL]: { type: 'string' as const },
	[TEXT_CELL]: { type: 'string' as const },
	[DONE_CELL]: { type: 'boolean' as const, default: false },
	[PRIORITY_CELL]: { type: 'string' as const, default: 'medium' },
	[DUE_DATE_CELL]: { type: 'string' as const, default: '' },
	[CREATED_AT_CELL]: { type: 'string' as const, default: '' },
	[UPDATED_AT_CELL]: { type: 'string' as const, default: '' },
};

// Initialize or access the todos table
export const setupTodoTable = (store: Store): void => {
	if (!store.hasTable(TODO_TABLE)) {
		store.setTable(TODO_TABLE, {});
	}
};

// Direct store manipulation functions
export const addTodo = (
	store: Store,
	todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>
): string => {
	const id = Date.now().toString(); // Ensure ID is a string
	const now = new Date().toISOString();

	// Log the todo being added
	console.log('Adding todo with ID:', id, todoData);

	store.setRow(TODO_TABLE, id, {
		id,
		...todoData,
		createdAt: now,
		updatedAt: now,
	});

	return id;
};

export const updateTodo = (
	store: Store,
	id: string,
	updates: Partial<Omit<Todo, 'id' | 'createdAt'>>
): void => {
	// Convert id to string to ensure consistent format
	const stringId = String(id);
	
	console.log('Updating todo with ID:', stringId, updates);
	
	// Check if the store has this row
	if (!store.hasRow(TODO_TABLE, stringId)) {
		console.error('Cannot find todo with ID:', stringId);
		console.log('Available IDs:', Object.keys(store.getTable(TODO_TABLE) || {}));
		return;
	}
	
	const todo = store.getRow(TODO_TABLE, stringId);
	if (todo) {
		const now = new Date().toISOString();
		store.setPartialRow(TODO_TABLE, stringId, {
			...updates,
			updatedAt: now,
		});
	}
};

export const deleteTodo = (store: Store, id: string): void => {
	store.delRow(TODO_TABLE, id);
};

// React hooks for components
export const useTodo = (id: string): Todo => {
	// Use the built-in useRow hook which already handles subscriptions correctly
	const row = useRow(TODO_TABLE, String(id));
	
	// Convert any non-object response to an empty object
	return (row && typeof row === 'object') ? row as Todo : {} as Todo;
};

export const useAddTodo = () => {
  return useCallback(
    async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await addTodo(todoData);
    },
    []
  );
};

export const useUpdateTodoCallback = (id: string) => {
	return useSetCellCallback(TODO_TABLE, id, UPDATED_AT_CELL, () =>
		new Date().toISOString()
	);
};

export const useToggleTodoDone = (id: string) => {
  return useCallback(async () => {
    const todo = await getTodoById(id);
    if (todo) {
      await updateTodo(id, { done: !todo.done });
    }
  }, [id]);
};

export const useDeleteTodo = () => {
  return useCallback(async (id: string) => {
    await deleteTodo(id);
  }, []);
};

export const getOverdueTodos = (store: Store): Record<string, Todo> => {
	const todos = store.getTable(TODO_TABLE);
	if (!todos) return {};

	const now = new Date().toISOString();
	return Object.entries(todos).reduce((filtered, [id, todo]) => {
		if (!todo[DONE_CELL] && todo[DUE_DATE_CELL] && todo[DUE_DATE_CELL] < now) {
			filtered[id] = todo as Todo;
		}
		return filtered;
	}, {} as Record<string, Todo>);
};

export const getTodoById = (id: string): Todo | null => {
	const store = useStore();
	if (!store) return null;

	const todo = store.getRow(TODO_TABLE, id);
	console.log('Todo from store:', todo);

	return todo as Todo;
};

export const ClearTodos = () => {
	if (!useHasTable(TODO_TABLE)) return null;

	return useDelTableCallback(TODO_TABLE);
};

// Re-export useStore
export { useStore } from 'tinybase/ui-react';
