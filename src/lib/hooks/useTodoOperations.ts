import { useState, useCallback } from 'react';
import { Todo, StorageState } from '@/types/todo';
import { localStorageService } from '@/lib/storage/localStorage';

export function useTodoOperations() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());

  const addTodoOptimistically = useCallback(
    async (text: string, onError?: (error: Error) => void) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticTodo: Todo = {
        id: tempId,
        text,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPending: true,
      };

      setTodos((prev) => [...prev, optimisticTodo]);
      setPendingOperations((prev) => new Set([...prev, tempId]));

      try {
        const newTodo: Todo = {
          id: crypto.randomUUID(),
          text,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const state: StorageState = {
          todos: [...todos.filter((t) => !t.isPending), newTodo],
          version: '1.0.0',
        };
        localStorageService.save(state);

        setTodos((prev) =>
          prev.map((todo) => (todo.id === tempId ? { ...newTodo, isPending: false } : todo))
        );
      } catch (error) {
        setTodos((prev) => prev.filter((todo) => todo.id !== tempId));
        if (onError) {
          onError(error as Error);
        }
      } finally {
        setPendingOperations((prev) => {
          const next = new Set(prev);
          next.delete(tempId);
          return next;
        });
      }
    },
    [todos]
  );

  const updateTodoOptimistically = useCallback(
    async (id: string, updates: Partial<Todo>, onError?: (error: Error) => void) => {
      const originalTodos = todos;

      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, ...updates, updatedAt: new Date(), isPending: true } : todo
        )
      );
      setPendingOperations((prev) => new Set([...prev, id]));

      try {
        const updatedTodos = todos.map((todo) =>
          todo.id === id ? { ...todo, ...updates, updatedAt: new Date(), isPending: false } : todo
        );

        const state: StorageState = {
          todos: updatedTodos.filter((t) => !t.isPending),
          version: '1.0.0',
        };
        localStorageService.save(state);

        setTodos(updatedTodos);
      } catch (error) {
        setTodos(originalTodos);
        if (onError) {
          onError(error as Error);
        }
      } finally {
        setPendingOperations((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [todos]
  );

  const deleteTodoOptimistically = useCallback(
    async (id: string, onError?: (error: Error) => void) => {
      const originalTodos = todos;

      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      setPendingOperations((prev) => new Set([...prev, id]));

      try {
        const state: StorageState = {
          todos: todos.filter((todo) => todo.id !== id && !todo.isPending),
          version: '1.0.0',
        };
        localStorageService.save(state);
      } catch (error) {
        setTodos(originalTodos);
        if (onError) {
          onError(error as Error);
        }
      } finally {
        setPendingOperations((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [todos]
  );

  return {
    todos,
    setTodos,
    pendingOperations,
    addTodoOptimistically,
    updateTodoOptimistically,
    deleteTodoOptimistically,
  };
}
