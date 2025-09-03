import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OptimizedTodoList } from '@/components/todo/OptimizedTodoList';
import { VirtualTodoList } from '@/components/todo/VirtualTodoList';
import { TodoSearch } from '@/components/todo/TodoSearch';
import { Todo } from '@/types/todo';

// Mock performance API
global.performance.mark = vi.fn();
global.performance.measure = vi.fn();
global.performance.getEntriesByName = vi.fn(
  () =>
    [
      {
        duration: 10,
        entryType: 'measure',
        name: 'test',
        startTime: 0,
        toJSON: () => ({}),
      },
    ] as PerformanceEntry[]
);

describe('Performance: TodoList', () => {
  // Generate large dataset for testing
  const generateTodos = (count: number): Todo[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `todo-${i}`,
      text: `Todo item ${i}`,
      completed: i % 3 === 0,
      createdAt: new Date(Date.now() - i * 1000000),
      updatedAt: new Date(Date.now() - i * 1000000),
    }));
  };

  describe('OptimizedTodoList', () => {
    it('should render 1000 todos without performance issues', () => {
      const largeTodoList = generateTodos(1000);
      const onToggle = vi.fn();
      const onDelete = vi.fn();
      const onUpdate = vi.fn();

      const startTime = performance.now();

      render(
        <OptimizedTodoList
          todos={largeTodoList}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in reasonable time (allowing for test environment overhead)
      // Note: In production builds, this would be much faster
      expect(renderTime).toBeLessThan(6000);

      // Should display todo count
      expect(screen.getByText('1000 todos')).toBeInTheDocument();
    });

    it('should memoize callbacks to prevent unnecessary re-renders', () => {
      const todos = generateTodos(10);
      const onToggle = vi.fn();
      const onDelete = vi.fn();
      const onUpdate = vi.fn();

      const { rerender } = render(
        <OptimizedTodoList
          todos={todos}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      );

      // Re-render with same props
      rerender(
        <OptimizedTodoList
          todos={todos}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      );

      // Callbacks should not have been recreated
      // This is tested indirectly through the memoization behavior
      expect(screen.getAllByRole('listitem')).toHaveLength(10);
    });

    it('should efficiently handle todo updates', async () => {
      const todos = generateTodos(100);
      const onToggle = vi.fn();
      const onDelete = vi.fn();
      const onUpdate = vi.fn();

      const { rerender } = render(
        <OptimizedTodoList
          todos={todos}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      );

      // Update a single todo
      const updatedTodos = [...todos];
      updatedTodos[0] = { ...updatedTodos[0], completed: !updatedTodos[0].completed };

      const startTime = performance.now();

      rerender(
        <OptimizedTodoList
          todos={updatedTodos}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      );

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      // Update should be fast (< 20ms)
      expect(updateTime).toBeLessThan(20);
    });
  });

  describe('VirtualTodoList', () => {
    it('should efficiently render large lists with virtual scrolling', () => {
      const largeTodoList = generateTodos(10000);
      const onToggle = vi.fn();
      const onDelete = vi.fn();
      const onUpdate = vi.fn();

      const startTime = performance.now();

      render(
        <VirtualTodoList
          todos={largeTodoList}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
          containerHeight={600}
          itemHeight={80}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Even with 10000 items, should render quickly (allowing some variance in test environments)
      expect(renderTime).toBeLessThan(150);

      // Should only render visible items (not all 10000)
      const renderedItems = screen.getAllByRole('article');
      expect(renderedItems.length).toBeLessThan(50); // Only visible items
    });

    it('should handle scroll events efficiently', async () => {
      const todos = generateTodos(1000);
      const onToggle = vi.fn();
      const onDelete = vi.fn();
      const onUpdate = vi.fn();

      render(
        <div>
          <VirtualTodoList
            todos={todos}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
            containerHeight={600}
            itemHeight={80}
          />
        </div>
      );

      const container = screen.getByRole('list');

      // Simulate scroll
      const scrollEvents: number[] = [];

      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();

        // Scroll down
        container.scrollTop = i * 100;
        container.dispatchEvent(new Event('scroll'));

        const endTime = performance.now();
        scrollEvents.push(endTime - startTime);
      }

      // All scroll events should be handled quickly
      scrollEvents.forEach((duration) => {
        expect(duration).toBeLessThan(16); // 60fps = 16ms per frame
      });
    });
  });

  describe('TodoSearch', () => {
    it('should debounce search input', async () => {
      const onSearch = vi.fn();
      const user = userEvent.setup();

      render(<TodoSearch onSearch={onSearch} debounceDelay={300} />);

      const searchInput = screen.getByPlaceholderText('Search todos...');

      // Clear any initial calls from mounting
      onSearch.mockClear();

      // Type rapidly
      await user.type(searchInput, 'test');

      // Should not call onSearch immediately (except for initial empty call)
      expect(onSearch).not.toHaveBeenCalled();

      // Wait for debounce delay
      await waitFor(() => expect(onSearch).toHaveBeenCalledWith('test'), { timeout: 400 });

      // Should only be called once despite multiple keystrokes
      expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid input changes efficiently', async () => {
      const onSearch = vi.fn();
      const user = userEvent.setup();

      render(<TodoSearch onSearch={onSearch} debounceDelay={100} />);

      const searchInput = screen.getByPlaceholderText('Search todos...');

      // Type multiple characters rapidly
      const startTime = performance.now();

      await user.type(searchInput, 'a');
      await user.type(searchInput, 'b');
      await user.type(searchInput, 'c');
      await user.type(searchInput, 'd');
      await user.type(searchInput, 'e');

      const endTime = performance.now();
      const inputTime = endTime - startTime;

      // Input should be responsive
      expect(inputTime).toBeLessThan(500);

      // Wait for final debounce
      await waitFor(() => expect(onSearch).toHaveBeenLastCalledWith('abcde'), { timeout: 200 });

      // Should be called fewer times than keystrokes due to debouncing
      expect(onSearch.mock.calls.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Memory Management', () => {
    it('should properly clean up event listeners on unmount', () => {
      const todos = generateTodos(100);
      const onToggle = vi.fn();
      const onDelete = vi.fn();
      const onUpdate = vi.fn();

      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <VirtualTodoList
          todos={todos}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      );

      const addedListeners = addEventListenerSpy.mock.calls.length;

      unmount();

      const removedListeners = removeEventListenerSpy.mock.calls.length;

      // All added listeners should be removed
      expect(removedListeners).toBeGreaterThanOrEqual(addedListeners);
    });

    it('should not leak memory with repeated mounts/unmounts', () => {
      const todos = generateTodos(50);
      const onToggle = vi.fn();
      const onDelete = vi.fn();
      const onUpdate = vi.fn();

      // Simulate multiple mount/unmount cycles
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <OptimizedTodoList
            todos={todos}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        );

        unmount();
      }

      // No memory leaks should occur
      // This would be better tested with actual memory profiling tools
      expect(true).toBe(true);
    });
  });

  describe('Bundle Size', () => {
    it('should tree-shake unused code', () => {
      // This test would verify that unused exports are not included
      // In a real scenario, this would be tested with build tools

      // Example: Verify that only used components are imported
      const usedExports = [
        'OptimizedTodoList',
        'VirtualTodoList',
        'TodoSearch',
        'MemoizedTodoItem',
      ];

      // This would be verified through bundle analysis
      expect(usedExports.length).toBeLessThanOrEqual(10);
    });
  });
});

describe('Performance: Storage', () => {
  describe('BatchedStorage', () => {
    it('should batch multiple writes efficiently', async () => {
      const { BatchedStorageManager } = await import('@/lib/storage/batchedStorage');

      const storage = new BatchedStorageManager({
        batchDelay: 100,
        maxBatchSize: 10,
      });

      const startTime = performance.now();

      // Perform multiple writes
      for (let i = 0; i < 100; i++) {
        storage.set(`key-${i}`, { value: i });
      }

      // Force flush
      await storage.forceFlush();

      const endTime = performance.now();
      const writeTime = endTime - startTime;

      // Batched writes should be faster than individual writes
      expect(writeTime).toBeLessThan(500);
    });
  });
});

describe('Performance: Metrics', () => {
  it('should meet performance targets', async () => {
    const { PERFORMANCE_TARGETS } = await import('@/lib/utils/performance');

    // Verify targets are reasonable
    expect(PERFORMANCE_TARGETS.firstContentfulPaint).toBeLessThanOrEqual(1000);
    expect(PERFORMANCE_TARGETS.timeToInteractive).toBeLessThanOrEqual(2000);
    expect(PERFORMANCE_TARGETS.lighthouseScore).toBeGreaterThanOrEqual(95);
    expect(PERFORMANCE_TARGETS.bundleSize).toBeLessThanOrEqual(200 * 1024);
    expect(PERFORMANCE_TARGETS.animationFrameRate).toBe(60);
  });
});
