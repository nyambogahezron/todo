import { useState, useEffect, useCallback } from 'react';
import * as todoService from '@/services/todoService';
import { Todo } from './models';

// Re-export all service functions
export const addTodo = todoService.addTodo;
export const updateTodo = todoService.updateTodo;
export const deleteTodo = todoService.deleteTodo;
export const getTodoById = todoService.getTodoById;
export const getAllTodos = todoService.getAllTodos;
export const getTodosByPriority = todoService.getTodosByPriority;
export const getDoneTodos = todoService.getDoneTodos;
export const getUndoneTodos = todoService.getUndoneTodos;
export const getOverdueTodos = todoService.getOverdueTodos;

// React hooks for components
export const useTodo = (id: string): Todo | null => {
  const [todo, setTodo] = useState<Todo | null>(null);

  useEffect(() => {
    const loadTodo = async () => {
      try {
        const result = await getTodoById(id);
        setTodo(result);
      } catch (error) {
        console.error('Error loading todo:', error);
      }
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
  return useCallback(
    async (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
      await updateTodo(id, updates);
    },
    []
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

export const useSortedTodos = (): {
  todos: Todo[];
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  return useTodos(); // Already sorted by done status
};
