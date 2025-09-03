'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Todo } from '@/types/todo';
import { MemoizedTodoItem } from './MemoizedTodoItem';

interface VirtualTodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'text' | 'completed'>>) => void;
  itemHeight?: number;
  containerHeight?: number;
  bufferSize?: number;
  threshold?: number;
}

export function VirtualTodoList({
  todos,
  onToggle,
  onDelete,
  onUpdate,
  itemHeight = 80,
  containerHeight = 600,
  bufferSize = 5,
  // threshold = 100 - removed unused parameter
}: VirtualTodoListProps) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Sort todos by createdAt (newest first)
  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [todos]);

  // Calculate visible items based on scroll position
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    // Debounce scroll handling for better performance
    if (scrollTimeout.current) {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      const scrollTop = containerRef.current?.scrollTop || 0;
      const containerHeightActual = containerRef.current?.clientHeight || containerHeight;

      // Calculate which items should be visible
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
      const endIndex = Math.min(
        sortedTodos.length,
        Math.ceil((scrollTop + containerHeightActual) / itemHeight) + bufferSize
      );

      setVisibleRange((prev) => {
        // Only update if the range has changed significantly
        if (Math.abs(prev.start - startIndex) > 2 || Math.abs(prev.end - endIndex) > 2) {
          return { start: startIndex, end: endIndex };
        }
        return prev;
      });
    }, 10);
  }, [sortedTodos.length, itemHeight, bufferSize, containerHeight]);

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });

    // Initial calculation
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      }
    };
  }, [handleScroll]);

  // Reset visible range when todos change significantly
  useEffect(() => {
    setVisibleRange({ start: 0, end: Math.min(20, sortedTodos.length) });
  }, [sortedTodos.length]);

  const visibleTodos = sortedTodos.slice(visibleRange.start, visibleRange.end);
  const totalHeight = sortedTodos.length * itemHeight;
  const offsetTop = visibleRange.start * itemHeight;
  const offsetBottom = (sortedTodos.length - visibleRange.end) * itemHeight;

  // Memoized callbacks
  const handleToggle = useCallback(
    (id: string) => {
      onToggle(id);
    },
    [onToggle]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDelete(id);
    },
    [onDelete]
  );

  const handleUpdate = useCallback(
    (id: string, updates: Partial<Pick<Todo, 'text' | 'completed'>>) => {
      onUpdate(id, updates);
    },
    [onUpdate]
  );

  // Don't use virtual scrolling for small lists
  if (sortedTodos.length <= 20) {
    return (
      <div className="space-y-2 sm:space-y-3">
        {sortedTodos.map((todo, index) => (
          <MemoizedTodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            tabIndex={index === 0 ? 0 : -1}
            index={index}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{
        height: `${Math.min(containerHeight, totalHeight)}px`,
        position: 'relative',
      }}
      role="list"
      aria-label={`Todo list with ${sortedTodos.length} items`}
    >
      {/* Top spacer */}
      {offsetTop > 0 && <div style={{ height: `${offsetTop}px` }} aria-hidden="true" />}

      {/* Visible items */}
      <div className="space-y-2 sm:space-y-3">
        {visibleTodos.map((todo, index) => {
          const actualIndex = visibleRange.start + index;
          return (
            <div key={todo.id} style={{ minHeight: `${itemHeight}px` }} data-todo-id={todo.id}>
              <MemoizedTodoItem
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                tabIndex={actualIndex === 0 ? 0 : -1}
                index={actualIndex}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom spacer */}
      {offsetBottom > 0 && <div style={{ height: `${offsetBottom}px` }} aria-hidden="true" />}

      {/* Loading indicator for large lists */}
      {sortedTodos.length > 100 && (
        <div className="sr-only" role="status" aria-live="polite">
          Showing items {visibleRange.start + 1} to {Math.min(visibleRange.end, sortedTodos.length)}{' '}
          of {sortedTodos.length} total
        </div>
      )}
    </div>
  );
}
