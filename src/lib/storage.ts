import { Todo, StorageState } from '@/types/todo';

const STORAGE_KEY = 'todo-app-data';
const STORAGE_VERSION = '1.0.0';

export class TodoStorage {
  static getTodos(): Todo[] {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const state: StorageState = JSON.parse(data);
      return state.todos.map((todo) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load todos from localStorage:', error);
      return [];
    }
  }

  static saveTodos(todos: Todo[]): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const state: StorageState = {
        todos,
        version: STORAGE_VERSION,
        lastSync: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error('Failed to save todos to localStorage:', error);
      return false;
    }
  }

  static clearTodos(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear todos from localStorage:', error);
      return false;
    }
  }
}
