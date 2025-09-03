import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodos } from '@/lib/hooks/useTodos';
import { TodoStorage } from '@/lib/storage';
import { Todo } from '@/types/todo';

// Mock the TodoStorage module
vi.mock('@/lib/storage', () => ({
  TodoStorage: {
    getTodos: vi.fn(),
    saveTodos: vi.fn(),
  },
}));

describe('useTodos - Delete Functionality', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      text: 'First todo',
      completed: false,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      id: '2',
      text: 'Second todo',
      completed: true,
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
    },
    {
      id: '3',
      text: 'Third todo',
      completed: false,
      createdAt: new Date('2025-01-03'),
      updatedAt: new Date('2025-01-03'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (TodoStorage.getTodos as ReturnType<typeof vi.fn>).mockReturnValue(mockTodos);
    (TodoStorage.saveTodos as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  it('should delete a todo by id', () => {
    const { result } = renderHook(() => useTodos());

    expect(result.current.todos).toHaveLength(3);

    act(() => {
      result.current.deleteTodo('2');
    });

    expect(result.current.todos).toHaveLength(2);
    expect(result.current.todos.find((t) => t.id === '2')).toBeUndefined();
    expect(result.current.todos[0].id).toBe('1');
    expect(result.current.todos[1].id).toBe('3');
  });

  it('should persist deletion to localStorage', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.deleteTodo('1');
    });

    expect(TodoStorage.saveTodos).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: '2' }),
        expect.objectContaining({ id: '3' }),
      ])
    );
    expect(TodoStorage.saveTodos).toHaveBeenCalledWith(
      expect.not.arrayContaining([expect.objectContaining({ id: '1' })])
    );
  });

  it('should handle deleting non-existent todo gracefully', () => {
    const { result } = renderHook(() => useTodos());

    const initialLength = result.current.todos.length;
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      result.current.deleteTodo('non-existent-id');
    });

    // Should log error but not crash
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete todo:', expect.any(Error));
    expect(result.current.error).toBe('Failed to delete todo. Please try again.');
    // Todos should remain unchanged
    expect(result.current.todos).toHaveLength(initialLength);

    consoleErrorSpy.mockRestore();
  });

  it('should delete multiple todos sequentially', () => {
    const { result } = renderHook(() => useTodos());

    expect(result.current.todos).toHaveLength(3);

    act(() => {
      result.current.deleteTodo('1');
    });

    expect(result.current.todos).toHaveLength(2);

    act(() => {
      result.current.deleteTodo('3');
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].id).toBe('2');
  });

  it('should clear error state on successful deletion', () => {
    const { result } = renderHook(() => useTodos());

    // Simulate an error state
    act(() => {
      // This would normally be set by another operation
      result.current.error = 'Some error';
    });

    act(() => {
      result.current.deleteTodo('1');
    });

    expect(result.current.error).toBeNull();
  });

  it('should delete completed todos with clearCompleted', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.clearCompleted();
    });

    // Should only keep non-completed todos
    expect(result.current.todos).toHaveLength(2);
    expect(result.current.todos.every((t) => !t.completed)).toBe(true);
    expect(result.current.todos.find((t) => t.id === '2')).toBeUndefined();
  });

  it('should handle localStorage save failure during delete', () => {
    (TodoStorage.saveTodos as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.deleteTodo('1');
    });

    // Todo should still be deleted from state
    expect(result.current.todos).toHaveLength(2);
    // But error should be logged
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to save todos to localStorage');

    consoleErrorSpy.mockRestore();
  });

  it('should maintain todo order after deletion', () => {
    const { result } = renderHook(() => useTodos());

    const initialOrder = result.current.todos.map((t) => t.id);
    const expectedOrder = initialOrder.filter((id) => id !== '2');

    act(() => {
      result.current.deleteTodo('2');
    });

    const newOrder = result.current.todos.map((t) => t.id);
    expect(newOrder).toEqual(expectedOrder);
  });
});
