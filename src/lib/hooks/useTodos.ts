'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Todo } from '@/types/todo';
import { TodoStorage } from '@/lib/storage';
import { useTodoAnnouncements } from '@/lib/hooks/useAnnouncement';

export function useTodos() {
  const { announceAdd, announceToggle, announceDelete, announceEdit, announceError } =
    useTodoAnnouncements();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load todos from localStorage on mount
  useEffect(() => {
    try {
      const loadedTodos = TodoStorage.getTodos();
      setTodos(loadedTodos);
      setError(null);
    } catch (err) {
      console.error('Failed to load todos:', err);
      setError('Failed to load todos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && todos.length >= 0) {
      const success = TodoStorage.saveTodos(todos);
      if (!success) {
        console.error('Failed to save todos to localStorage');
      }
    }
  }, [todos, isLoading]);

  const addTodo = useCallback(
    (text: string) => {
      const newTodo: Todo = {
        id: uuidv4(),
        text: text.trim(),
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setTodos((prevTodos) => [newTodo, ...prevTodos]);
      announceAdd(text.trim());
    },
    [announceAdd]
  );

  const updateTodo = useCallback(
    (id: string, updates: Partial<Pick<Todo, 'text' | 'completed'>>) => {
      const currentTodo = todos.find((t) => t.id === id);

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                ...updates,
                updatedAt: new Date(),
              }
            : todo
        )
      );

      // Announce the update if text was changed
      if (currentTodo && updates.text && updates.text !== currentTodo.text) {
        announceEdit(currentTodo.text, updates.text);
      }
    },
    [todos, announceEdit]
  );

  const deleteTodo = useCallback(
    (id: string) => {
      const todoToDelete = todos.find((todo) => todo.id === id);

      if (!todoToDelete) {
        console.error('Failed to delete todo:', new Error('Todo not found'));
        setError('Failed to delete todo. Please try again.');
        announceError('Failed to delete todo. Please try again.');
        return;
      }

      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      setError(null);
      announceDelete(todoToDelete.text);
    },
    [todos, announceDelete, announceError]
  );

  const toggleTodo = useCallback(
    (id: string) => {
      const todoToToggle = todos.find((todo) => todo.id === id);

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                completed: !todo.completed,
                updatedAt: new Date(),
              }
            : todo
        )
      );

      if (todoToToggle) {
        announceToggle(todoToToggle.text, !todoToToggle.completed);
      }
    },
    [todos, announceToggle]
  );

  const clearCompleted = useCallback(() => {
    setTodos((prevTodos) => prevTodos.filter((todo) => !todo.completed));
  }, []);

  return {
    todos,
    isLoading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
  };
}
