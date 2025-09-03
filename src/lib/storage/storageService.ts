import { v4 as uuidv4 } from 'uuid';
import {
  type Todo,
  type TodoCreateInput,
  type TodoUpdateInput,
  type TodoFilters,
  type StorageState,
} from '@/types/todo';
import { localStorageService } from './localStorage';
import { validateTodoInput, sanitizeTodoText } from '@/lib/utils/validation';

export class TodoService {
  private inMemoryFallback: Todo[] = [];
  private useInMemory = false;

  constructor() {
    // Check if localStorage is available
    if (!localStorageService.isAvailable()) {
      console.warn('localStorage is not available. Using in-memory storage.');
      this.useInMemory = true;
    }
  }

  async createTodo(input: TodoCreateInput): Promise<Todo> {
    // Validate and sanitize input
    const validation = validateTodoInput(input);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid todo input');
    }

    const sanitizedText = sanitizeTodoText(input.text);

    const newTodo: Todo = {
      id: uuidv4(),
      text: sanitizedText,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const todos = await this.getTodos();
    todos.push(newTodo);
    await this.saveTodos(todos);

    return newTodo;
  }

  async getTodos(filters?: TodoFilters): Promise<Todo[]> {
    let todos: Todo[];

    if (this.useInMemory) {
      todos = [...this.inMemoryFallback];
    } else {
      const state = localStorageService.load();
      todos = state?.todos || [];
    }

    // Apply filters if provided
    if (filters) {
      if (filters.status !== undefined) {
        todos = todos.filter((todo) => {
          switch (filters.status) {
            case 'completed':
              return todo.completed;
            case 'pending':
              return !todo.completed;
            default:
              return true;
          }
        });
      }

      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        todos = todos.filter((todo) => todo.text.toLowerCase().includes(searchLower));
      }
    }

    // Sort by creation date (newest first)
    return todos.sort((a, b) => {
      const aTime =
        a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const bTime =
        b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  }

  async updateTodo(id: string, input: TodoUpdateInput): Promise<Todo> {
    const todos = await this.getTodos();
    const todoIndex = todos.findIndex((t) => t.id === id);

    if (todoIndex === -1) {
      throw new Error(`Todo with id ${id} not found`);
    }

    const todo = todos[todoIndex];

    // Validate and sanitize text if provided
    if (input.text !== undefined) {
      const validation = validateTodoInput({ text: input.text });
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid todo input');
      }
      todo.text = sanitizeTodoText(input.text);
    }

    if (input.completed !== undefined) {
      todo.completed = input.completed;
    }

    todo.updatedAt = new Date();

    await this.saveTodos(todos);
    return todo;
  }

  async deleteTodo(id: string): Promise<void> {
    const todos = await this.getTodos();
    const filteredTodos = todos.filter((t) => t.id !== id);

    if (todos.length === filteredTodos.length) {
      throw new Error(`Todo with id ${id} not found`);
    }

    await this.saveTodos(filteredTodos);
  }

  async clearAll(): Promise<void> {
    if (this.useInMemory) {
      this.inMemoryFallback = [];
    } else {
      localStorageService.clear();
    }
  }

  private async saveTodos(todos: Todo[]): Promise<void> {
    if (this.useInMemory) {
      this.inMemoryFallback = todos;
    } else {
      try {
        const state: StorageState = {
          todos,
          version: '1.0.0',
          lastSync: new Date().toISOString(),
        };
        localStorageService.save(state);
      } catch (error) {
        // Fallback to in-memory if save fails
        console.error('Failed to save to localStorage, using in-memory fallback:', error);
        this.useInMemory = true;
        this.inMemoryFallback = todos;

        // Re-throw with user-friendly message
        if (error instanceof Error && error.message.includes('quota')) {
          throw new Error('Storage quota exceeded. Your todos are temporarily saved in memory.');
        }
        throw error;
      }
    }
  }

  async getStorageInfo(): Promise<{
    isUsingLocalStorage: boolean;
    todoCount: number;
    storageUsage?: { used: number; quota: number };
  }> {
    const todos = await this.getTodos();
    const usage = !this.useInMemory ? await localStorageService.getUsage() : null;

    return {
      isUsingLocalStorage: !this.useInMemory,
      todoCount: todos.length,
      storageUsage: usage || undefined,
    };
  }
}

export const todoService = new TodoService();
