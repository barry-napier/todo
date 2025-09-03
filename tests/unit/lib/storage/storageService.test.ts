import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoService } from '@/lib/storage/storageService';
import { TodoCreateInput, StorageState } from '@/types/todo';
import { localStorageService } from '@/lib/storage/localStorage';

// Mock uuid with incrementing counter
let uuidCounter = 0;
vi.mock('uuid', () => ({
  v4: vi.fn(() => {
    uuidCounter++;
    return `test-uuid-${uuidCounter}`;
  }),
}));

// Mock the localStorage service
vi.mock('@/lib/storage/localStorage', () => {
  let mockStorage: StorageState | null = null;

  return {
    localStorageService: {
      isAvailable: vi.fn(() => true),
      load: vi.fn(() => mockStorage),
      save: vi.fn((state: StorageState) => {
        mockStorage = state;
      }),
      clear: vi.fn(() => {
        mockStorage = null;
      }),
      getUsage: vi.fn(() => Promise.resolve({ used: 1000, quota: 5000000 })),
    },
  };
});

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock storage
    localStorageService.clear();
    // Reset UUID counter
    uuidCounter = 0;
    service = new TodoService();
  });

  describe('createTodo', () => {
    it('should create a new todo', async () => {
      const input: TodoCreateInput = { text: 'Test todo' };
      const result = await service.createTodo(input);

      expect(result).toMatchObject({
        id: 'test-uuid-1',
        text: 'Test todo',
        completed: false,
      });
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should validate and reject empty text', async () => {
      const input: TodoCreateInput = { text: '' };

      await expect(service.createTodo(input)).rejects.toThrow('Todo text cannot be empty');
    });

    it('should sanitize todo text', async () => {
      const input: TodoCreateInput = { text: '  Test    todo  ' };
      const result = await service.createTodo(input);

      expect(result.text).toBe('Test todo');
    });

    it('should reject text exceeding max length', async () => {
      const input: TodoCreateInput = { text: 'a'.repeat(501) };

      await expect(service.createTodo(input)).rejects.toThrow('cannot exceed 500 characters');
    });
  });

  describe('getTodos', () => {
    it('should return all todos', async () => {
      // Create fresh service to ensure clean state
      localStorageService.clear();
      uuidCounter = 0;
      const freshService = new TodoService();

      // Create todos with time difference
      await freshService.createTodo({ text: 'Todo 1' });

      // Mock Date for second todo to ensure it's newer
      const laterTime = new Date(Date.now() + 1000);
      vi.spyOn(global, 'Date').mockImplementation(() => laterTime as unknown as Date);

      await freshService.createTodo({ text: 'Todo 2' });

      vi.restoreAllMocks();

      const todos = await freshService.getTodos();

      expect(todos).toHaveLength(2);
      expect(todos[0].text).toBe('Todo 2'); // Newest first
      expect(todos[1].text).toBe('Todo 1');
    });

    it('should filter by status', async () => {
      // Create fresh service to ensure clean state
      localStorageService.clear();
      const freshService = new TodoService();

      await freshService.createTodo({ text: 'Todo 1' });
      const todo2 = await freshService.createTodo({ text: 'Todo 2' });

      // Mark one as completed
      await freshService.updateTodo(todo2.id, { completed: true });

      const completedTodos = await freshService.getTodos({ status: 'completed' });
      const pendingTodos = await freshService.getTodos({ status: 'pending' });

      expect(completedTodos).toHaveLength(1);
      expect(completedTodos[0].text).toBe('Todo 2');
      expect(pendingTodos).toHaveLength(1);
      expect(pendingTodos[0].text).toBe('Todo 1');
    });

    it('should filter by search text', async () => {
      await service.createTodo({ text: 'Buy groceries' });
      await service.createTodo({ text: 'Walk the dog' });
      await service.createTodo({ text: 'Buy flowers' });

      const results = await service.getTodos({ searchText: 'buy' });

      expect(results).toHaveLength(2);
      expect(results.every((t) => t.text.toLowerCase().includes('buy'))).toBe(true);
    });
  });

  describe('updateTodo', () => {
    it('should update todo text', async () => {
      const todo = await service.createTodo({ text: 'Original text' });

      // Just verify that the text was updated and updatedAt is set
      const updated = await service.updateTodo(todo.id, { text: 'Updated text' });

      expect(updated.text).toBe('Updated text');
      expect(updated.updatedAt).toBeInstanceOf(Date);
      // The timestamp should be at least equal or greater
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(todo.updatedAt.getTime());
    });

    it('should update todo completion status', async () => {
      const todo = await service.createTodo({ text: 'Test todo' });
      const updated = await service.updateTodo(todo.id, { completed: true });

      expect(updated.completed).toBe(true);
    });

    it('should validate updated text', async () => {
      const todo = await service.createTodo({ text: 'Test todo' });

      await expect(service.updateTodo(todo.id, { text: '' })).rejects.toThrow(
        'Todo text cannot be empty'
      );
    });

    it('should throw error for non-existent todo', async () => {
      await expect(service.updateTodo('non-existent', { text: 'Updated' })).rejects.toThrow(
        'Todo with id non-existent not found'
      );
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo', async () => {
      const todo = await service.createTodo({ text: 'To be deleted' });

      await service.deleteTodo(todo.id);
      const todos = await service.getTodos();

      expect(todos).toHaveLength(0);
    });

    it('should throw error for non-existent todo', async () => {
      await expect(service.deleteTodo('non-existent')).rejects.toThrow(
        'Todo with id non-existent not found'
      );
    });
  });

  describe('clearAll', () => {
    it('should clear all todos', async () => {
      await service.createTodo({ text: 'Todo 1' });
      await service.createTodo({ text: 'Todo 2' });

      await service.clearAll();
      const todos = await service.getTodos();

      expect(todos).toHaveLength(0);
    });
  });

  describe('getStorageInfo', () => {
    it('should return storage information', async () => {
      await service.createTodo({ text: 'Test todo' });

      const info = await service.getStorageInfo();

      expect(info).toMatchObject({
        isUsingLocalStorage: true,
        todoCount: 1,
        storageUsage: {
          used: 1000,
          quota: 5000000,
        },
      });
    });
  });
});
