'use client';

import React, { useMemo, useCallback, useEffect } from 'react';
import { Todo } from '@/types/todo';
import { MemoizedTodoItem } from './MemoizedTodoItem';
import { CheckCircle } from 'lucide-react';
import { useKeyboardNavigation } from '@/lib/hooks/useKeyboardNavigation';
import { useTodoAnnouncements } from '@/lib/hooks/useAnnouncement';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'text' | 'completed'>>) => void;
}

export function OptimizedTodoList({ todos, onToggle, onDelete, onUpdate }: TodoListProps) {
  const { announceCount } = useTodoAnnouncements();

  // Sort todos by createdAt (newest first) - memoized
  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [todos]);

  // Calculate todo counts - memoized
  const stats = useMemo(() => {
    const totalCount = todos.length;
    const completedTodos = todos.filter((t) => t.completed);
    const completedCount = completedTodos.length;
    const activeCount = totalCount - completedCount;

    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      activeCount,
      completedCount,
      completionRate,
    };
  }, [todos]);

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

  // Keyboard navigation handlers - memoized
  const handleEnterKey = useCallback(
    (index: number) => {
      const todo = sortedTodos[index];
      if (todo) {
        const todoElement = document.querySelector(`[data-todo-id="${todo.id}"]`) as HTMLElement;
        const editButton = todoElement?.querySelector('[aria-label^="Edit"]') as HTMLButtonElement;
        editButton?.click();
      }
    },
    [sortedTodos]
  );

  const handleSpaceKey = useCallback(
    (index: number) => {
      const todo = sortedTodos[index];
      if (todo) {
        handleToggle(todo.id);
      }
    },
    [sortedTodos, handleToggle]
  );

  const handleDeleteKey = useCallback(
    (index: number) => {
      const todo = sortedTodos[index];
      if (todo) {
        handleDelete(todo.id);
      }
    },
    [sortedTodos, handleDelete]
  );

  const { containerRef } = useKeyboardNavigation({
    itemCount: sortedTodos.length,
    onEnter: handleEnterKey,
    onSpace: handleSpaceKey,
    onDelete: handleDeleteKey,
  });

  // Announce count changes
  useEffect(() => {
    if (stats.totalCount > 0) {
      announceCount(stats.totalCount, stats.activeCount, stats.completedCount);
    }
  }, [stats.totalCount, stats.activeCount, stats.completedCount, announceCount]);

  if (todos.length === 0) {
    return <EmptyState />;
  }

  return (
    <section aria-label="Todo list">
      <TodoStats stats={stats} />
      <KeyboardInstructions />

      <div
        ref={containerRef}
        className="space-y-2 sm:space-y-3"
        role="list"
        aria-label="Todo items"
      >
        {sortedTodos.map((todo, index) => (
          <div
            key={todo.id}
            className="todo-item-wrapper animate-fade-in"
            style={{
              animationDelay: `${Math.min(index * 50, 500)}ms`,
              animationFillMode: 'both',
            }}
            role="listitem"
            data-todo-id={todo.id}
            aria-setsize={sortedTodos.length}
            aria-posinset={index + 1}
          >
            <MemoizedTodoItem
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              tabIndex={index === 0 ? 0 : -1}
              index={index}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// Memoized Empty State Component
const EmptyState = React.memo(() => (
  <div className="text-center py-12 sm:py-16 px-4 sm:px-6" role="status">
    <CheckCircle
      className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30 mx-auto mb-3 sm:mb-4"
      aria-hidden="true"
    />
    <h2 className="text-base sm:text-lg font-semibold text-muted-foreground mb-2">No todos yet!</h2>
    <p className="text-sm text-muted-foreground/80">Add your first task above to get started</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

// Memoized Todo Stats Component
interface TodoStatsProps {
  stats: {
    totalCount: number;
    activeCount: number;
    completedCount: number;
    completionRate: number;
  };
}

const TodoStats = React.memo<TodoStatsProps>(({ stats }) => (
  <div
    className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 py-3 text-xs sm:text-sm text-muted-foreground border-b gap-1 sm:gap-0"
    aria-label={`${stats.totalCount} ${stats.totalCount === 1 ? 'todo' : 'todos'}, ${stats.activeCount} active, ${stats.completedCount} completed`}
  >
    <span className="font-medium">
      {stats.totalCount} {stats.totalCount === 1 ? 'todo' : 'todos'}
    </span>
    <div className="flex gap-3 sm:gap-4" role="status">
      <span>{stats.activeCount} active</span>
      <span>{stats.completedCount} completed</span>
      {stats.completionRate > 0 && (
        <span className="hidden sm:inline">({stats.completionRate}% done)</span>
      )}
    </div>
  </div>
));

TodoStats.displayName = 'TodoStats';

// Memoized Keyboard Instructions Component
const KeyboardInstructions = React.memo(() => (
  <div className="sr-only" role="region" aria-label="Keyboard navigation instructions">
    <p>Use arrow keys to navigate between todos</p>
    <p>Press Space to toggle completion</p>
    <p>Press Enter to edit</p>
    <p>Press Shift+Delete to delete</p>
  </div>
));

KeyboardInstructions.displayName = 'KeyboardInstructions';
