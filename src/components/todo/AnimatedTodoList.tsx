'use client';

import { useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Todo } from '@/types/todo';
import { TodoItem } from './TodoItem';
import { CheckCircle } from 'lucide-react';
import { useKeyboardNavigation } from '@/lib/hooks/useKeyboardNavigation';
import { useTodoAnnouncements } from '@/lib/hooks/useAnnouncement';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { todoItemVariants } from '@/lib/constants/animations';
import { TodoListSkeleton } from './TodoListSkeleton';

interface AnimatedTodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'text' | 'completed'>>) => void;
  isLoading?: boolean;
}

export function AnimatedTodoList({
  todos,
  onToggle,
  onDelete,
  onUpdate,
  isLoading = false,
}: AnimatedTodoListProps) {
  const { announceCount } = useTodoAnnouncements();
  const prefersReducedMotion = useReducedMotion();

  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [todos]);

  const { totalCount, activeCount, completedCount } = useMemo(() => {
    return {
      totalCount: todos.length,
      activeCount: todos.filter((t) => !t.completed).length,
      completedCount: todos.filter((t) => t.completed).length,
    };
  }, [todos]);

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
        onToggle(todo.id);
      }
    },
    [sortedTodos, onToggle]
  );

  const handleDeleteKey = useCallback(
    (index: number) => {
      const todo = sortedTodos[index];
      if (todo) {
        onDelete(todo.id);
      }
    },
    [sortedTodos, onDelete]
  );

  const { containerRef } = useKeyboardNavigation({
    itemCount: sortedTodos.length,
    onEnter: handleEnterKey,
    onSpace: handleSpaceKey,
    onDelete: handleDeleteKey,
  });

  useEffect(() => {
    if (totalCount > 0) {
      announceCount(totalCount, activeCount, completedCount);
    }
  }, [totalCount, activeCount, completedCount, announceCount]);

  if (isLoading) {
    return <TodoListSkeleton />;
  }

  if (todos.length === 0) {
    return (
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center py-12 sm:py-16 px-4 sm:px-6"
        role="status"
      >
        <CheckCircle
          className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30 mx-auto mb-3 sm:mb-4"
          aria-hidden="true"
        />
        <h2 className="text-base sm:text-lg font-semibold text-muted-foreground mb-2">
          No todos yet!
        </h2>
        <p className="text-sm text-muted-foreground/80">Add your first task above to get started</p>
      </motion.div>
    );
  }

  return (
    <section aria-label="Todo list">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={prefersReducedMotion ? false : { opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 py-3 text-xs sm:text-sm text-muted-foreground border-b gap-1 sm:gap-0"
        aria-label={`${totalCount} ${totalCount === 1 ? 'todo' : 'todos'}, ${activeCount} active, ${completedCount} completed`}
      >
        <span className="font-medium">
          {totalCount} {totalCount === 1 ? 'todo' : 'todos'}
        </span>
        <div className="flex gap-3 sm:gap-4" role="status">
          <span>{activeCount} active</span>
          <span>{completedCount} completed</span>
        </div>
      </motion.div>

      <div className="sr-only" role="region" aria-label="Keyboard navigation instructions">
        <p>Use arrow keys to navigate between todos</p>
        <p>Press Space to toggle completion</p>
        <p>Press Enter to edit</p>
        <p>Press Shift+Delete to delete</p>
      </div>

      <div
        ref={containerRef}
        className="space-y-2 sm:space-y-3"
        role="list"
        aria-label="Todo items"
      >
        <AnimatePresence mode="popLayout">
          {sortedTodos.map((todo, index) => (
            <motion.div
              key={todo.id}
              variants={prefersReducedMotion ? undefined : todoItemVariants}
              initial={prefersReducedMotion ? undefined : 'initial'}
              animate={prefersReducedMotion ? undefined : 'animate'}
              exit={prefersReducedMotion ? undefined : 'exit'}
              layout={!prefersReducedMotion}
              className={`todo-item-wrapper ${todo.isPending ? 'opacity-60' : ''}`}
              role="listitem"
              data-todo-id={todo.id}
              aria-setsize={sortedTodos.length}
              aria-posinset={index + 1}
            >
              <TodoItem
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
                tabIndex={index === 0 ? 0 : -1}
                index={index}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
