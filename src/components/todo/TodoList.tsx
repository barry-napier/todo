'use client';

import { useMemo } from 'react';
import { Todo } from '@/types/todo';
import { TodoItem } from './TodoItem';
import { CheckCircle } from 'lucide-react';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'text' | 'completed'>>) => void;
}

export function TodoList({ todos, onToggle, onDelete, onUpdate }: TodoListProps) {
  // Sort todos by createdAt (newest first)
  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [todos]);

  // Calculate todo counts
  const { totalCount, activeCount, completedCount } = useMemo(() => {
    return {
      totalCount: todos.length,
      activeCount: todos.filter((t) => !t.completed).length,
      completedCount: todos.filter((t) => t.completed).length,
    };
  }, [todos]);

  if (todos.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 px-4 sm:px-6">
        <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-muted-foreground mb-2">
          No todos yet!
        </h3>
        <p className="text-sm text-muted-foreground/80">Add your first task above to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Todo count indicator above the list */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 py-3 text-xs sm:text-sm text-muted-foreground border-b gap-1 sm:gap-0">
        <span className="font-medium">
          {totalCount} {totalCount === 1 ? 'todo' : 'todos'}
        </span>
        <div className="flex gap-3 sm:gap-4">
          <span>{activeCount} active</span>
          <span>{completedCount} completed</span>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {sortedTodos.map((todo, index) => (
          <div
            key={todo.id}
            className="todo-item-wrapper animate-fade-in"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'both',
            }}
          >
            <TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} />
          </div>
        ))}
      </div>
    </>
  );
}
