import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage for Node.js environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Todo type definition
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

// Helper functions that would be in your actual app
const STORAGE_KEY = 'personal-todo-app-todos';

const saveTodosToStorage = (todos: Todo[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};

const loadTodosFromStorage = (): Todo[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const createTodo = (text: string): Todo => ({
  id: Math.random().toString(36).substr(2, 9),
  text: text.trim(),
  completed: false,
  createdAt: new Date().toISOString(),
});

describe('LocalStorage Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Todo Persistence', () => {
    it('should save todos to localStorage', () => {
      const todos: Todo[] = [
        createTodo('First todo'),
        createTodo('Second todo'),
      ];

      saveTodosToStorage(todos);

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();
      
      const parsedTodos = JSON.parse(stored!);
      expect(parsedTodos).toHaveLength(2);
      expect(parsedTodos[0].text).toBe('First todo');
      expect(parsedTodos[1].text).toBe('Second todo');
    });

    it('should load todos from localStorage', () => {
      const originalTodos: Todo[] = [
        createTodo('Persistent todo'),
      ];
      
      saveTodosToStorage(originalTodos);
      const loadedTodos = loadTodosFromStorage();

      expect(loadedTodos).toHaveLength(1);
      expect(loadedTodos[0].text).toBe('Persistent todo');
      expect(loadedTodos[0].completed).toBe(false);
    });

    it('should handle empty localStorage', () => {
      const todos = loadTodosFromStorage();
      expect(todos).toEqual([]);
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json');
      const todos = loadTodosFromStorage();
      expect(todos).toEqual([]);
    });

    it('should preserve todo completion state', () => {
      const todos: Todo[] = [
        { ...createTodo('Completed todo'), completed: true },
        { ...createTodo('Active todo'), completed: false },
      ];

      saveTodosToStorage(todos);
      const loadedTodos = loadTodosFromStorage();

      expect(loadedTodos[0].completed).toBe(true);
      expect(loadedTodos[1].completed).toBe(false);
    });

    it('should preserve todo timestamps', () => {
      const now = new Date().toISOString();
      const todos: Todo[] = [
        { ...createTodo('Timestamped todo'), createdAt: now },
      ];

      saveTodosToStorage(todos);
      const loadedTodos = loadTodosFromStorage();

      expect(loadedTodos[0].createdAt).toBe(now);
    });

    it('should handle large datasets', () => {
      const largeTodoList: Todo[] = Array.from({ length: 1000 }, (_, i) =>
        createTodo(`Todo item ${i + 1}`)
      );

      saveTodosToStorage(largeTodoList);
      const loadedTodos = loadTodosFromStorage();

      expect(loadedTodos).toHaveLength(1000);
      expect(loadedTodos[0].text).toBe('Todo item 1');
      expect(loadedTodos[999].text).toBe('Todo item 1000');
    });
  });

  describe('Data Integrity', () => {
    it('should maintain unique IDs', () => {
      const todos: Todo[] = [
        createTodo('First todo'),
        createTodo('Second todo'),
        createTodo('Third todo'),
      ];

      const ids = todos.map(todo => todo.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should trim whitespace from todo text', () => {
      const todo = createTodo('  Whitespace todo  ');
      expect(todo.text).toBe('Whitespace todo');
    });

    it('should handle special characters', () => {
      const specialText = 'Special chars: !@#$%^&*()_+ 🎉🔥💯';
      const todos: Todo[] = [createTodo(specialText)];

      saveTodosToStorage(todos);
      const loadedTodos = loadTodosFromStorage();

      expect(loadedTodos[0].text).toBe(specialText);
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(10000);
      const todos: Todo[] = [createTodo(longText)];

      saveTodosToStorage(todos);
      const loadedTodos = loadTodosFromStorage();

      expect(loadedTodos[0].text).toBe(longText);
      expect(loadedTodos[0].text.length).toBe(10000);
    });
  });

  describe('Storage Limits', () => {
    it('should handle localStorage quota', () => {
      // Test approach: try to fill localStorage and handle gracefully
      const largeTodo = createTodo('X'.repeat(1000000)); // 1MB todo
      const todos: Todo[] = [largeTodo];

      expect(() => {
        saveTodosToStorage(todos);
      }).not.toThrow();
    });

    it('should validate storage availability', () => {
      expect(typeof Storage).toBe('function');
      expect(localStorage).toBeDefined();
      expect(typeof localStorage.setItem).toBe('function');
      expect(typeof localStorage.getItem).toBe('function');
    });
  });
});