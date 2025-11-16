import { getDb } from '@/lib/db';
import { Todo } from '@prisma/client';
import { useState, useEffect, useCallback } from 'react';
import { randomUUID } from 'expo-crypto';

// Re-export Todo type for compatibility
export type { Todo };

// Direct database manipulation functions
export const addTodo = async (
  todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  await db.todo.create({
    data: {
      id,
      text: todoData.text || '',
      done: todoData.done ?? false,
      priority: todoData.priority || 'medium',
      dueDate: todoData.dueDate || '',
      createdAt: now,
      updatedAt: now,
    },
  });

  return id;
};

export const updateTodo = async (
  id: string,
  updates: Partial<Omit<Todo, 'id' | 'createdAt'>>
): Promise<void> => {
  const db = getDb();
  const now = new Date().toISOString();

  await db.todo.update({
    where: { id },
    data: {
      ...updates,
      updatedAt: now,
    },
  });
};

export const deleteTodo = async (id: string): Promise<void> => {
  const db = getDb();
  await db.todo.delete({
    where: { id },
  });
};

export const getTodoById = async (id: string): Promise<Todo | null> => {
  const db = getDb();
  return await db.todo.findUnique({
    where: { id },
  });
};

export const getAllTodos = async (): Promise<Todo[]> => {
  const db = getDb();
  return await db.todo.findMany({
    orderBy: { done: 'asc' },
  });
};

export const getTodosByPriority = async (
  priority: 'low' | 'medium' | 'high'
): Promise<Todo[]> => {
  const db = getDb();
  return await db.todo.findMany({
    where: { priority },
    orderBy: { done: 'asc' },
  });
};

export const getDoneTodos = async (): Promise<Todo[]> => {
  const db = getDb();
  return await db.todo.findMany({
    where: { done: true },
  });
};

export const getUndoneTodos = async (): Promise<Todo[]> => {
  const db = getDb();
  return await db.todo.findMany({
    where: { done: false },
  });
};

export const getOverdueTodos = async (): Promise<Todo[]> => {
  const db = getDb();
  const now = new Date().toISOString();
  return await db.todo.findMany({
    where: {
      done: false,
      dueDate: {
        not: null,
        lt: now,
      },
    },
  });
};

// React hooks for components
export const useTodo = (id: string): Todo | null => {
  const [todo, setTodo] = useState<Todo | null>(null);

  useEffect(() => {
    const loadTodo = async () => {
      const result = await getTodoById(id);
      setTodo(result);
    };
    loadTodo();
  }, [id]);

  return todo;
};

export const useTodos = (): {
  todos: Todo[];
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const allTodos = await getAllTodos();
      setTodos(allTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { todos, loading, refresh };
};

export const useAddTodo = () => {
  return useCallback(
    async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await addTodo(todoData);
    },
    []
  );
};

export const useUpdateTodo = () => {
  return useCallback(async (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
    await updateTodo(id, updates);
  }, []);
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

export const useSortedTodos = (): {
  todos: Todo[];
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  return useTodos(); // Already sorted by done status
};

