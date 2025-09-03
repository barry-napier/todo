import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodos } from '@/lib/hooks/useTodos';
import { v4 as uuidv4 } from 'uuid';

// Mock the storage module
vi.mock('@/lib/storage', () => ({
  TodoStorage: {
    getTodos: vi.fn(() => []),
    saveTodos: vi.fn(() => true),
    clearTodos: vi.fn(() => true),
  },
}));

// Mock uuid
vi.mock('uuid');

describe('useTodos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default mock for uuid
    (vi.mocked(uuidv4) as ReturnType<typeof vi.fn>).mockReturnValue('test-uuid');
  });

  it('should initialize with empty todos', () => {
    const { result } = renderHook(() => useTodos());

    expect(result.current.todos).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should add a new todo', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Test todo');
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0]).toMatchObject({
      id: 'test-uuid',
      text: 'Test todo',
      completed: false,
    });
  });

  it('should add todo at the beginning of the list', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('First todo');
      result.current.addTodo('Second todo');
    });

    expect(result.current.todos[0].text).toBe('Second todo');
    expect(result.current.todos[1].text).toBe('First todo');
  });

  it('should toggle todo completion', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Test todo');
    });

    expect(result.current.todos[0].completed).toBe(false);

    act(() => {
      result.current.toggleTodo('test-uuid');
    });

    expect(result.current.todos[0].completed).toBe(true);
  });

  it('should update todo text', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Original text');
    });

    act(() => {
      result.current.updateTodo('test-uuid', { text: 'Updated text' });
    });

    expect(result.current.todos[0].text).toBe('Updated text');
  });

  it('should delete a todo', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Test todo');
    });

    expect(result.current.todos).toHaveLength(1);

    act(() => {
      result.current.deleteTodo('test-uuid');
    });

    expect(result.current.todos).toHaveLength(0);
  });

  it('should clear completed todos', () => {
    // Mock uuid to return different values for each todo
    (vi.mocked(uuidv4) as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce('test-uuid-1')
      .mockReturnValueOnce('test-uuid-2')
      .mockReturnValueOnce('test-uuid-3');

    const { result } = renderHook(() => useTodos());

    // Add multiple todos
    act(() => {
      result.current.addTodo('Todo 1');
      result.current.addTodo('Todo 2');
      result.current.addTodo('Todo 3');
    });

    expect(result.current.todos).toHaveLength(3);

    // Complete some todos (newest todos are at beginning of array)
    act(() => {
      result.current.toggleTodo('test-uuid-3'); // Todo 1
      result.current.toggleTodo('test-uuid-1'); // Todo 3
    });

    // Clear completed
    act(() => {
      result.current.clearCompleted();
    });

    // Only uncompleted todo should remain
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('Todo 2');
  });

  it('should trim todo text when adding', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('  Trimmed todo  ');
    });

    expect(result.current.todos[0].text).toBe('Trimmed todo');
  });
});
