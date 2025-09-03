'use client';

import { useState, useMemo, useCallback } from 'react';
import { Todo } from '@/types/todo';
import { OptimizedTodoList } from './OptimizedTodoList';
import { TodoSearch } from './TodoSearch';

interface FilteredTodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'text' | 'completed'>>) => void;
}

export function FilteredTodoList({ todos, onToggle, onDelete, onUpdate }: FilteredTodoListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Memoized search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  // Memoized filter handler
  const handleFilterChange = useCallback((newFilter: 'all' | 'active' | 'completed') => {
    setFilter(newFilter);
  }, []);

  // Memoized filtered todos
  const filteredTodos = useMemo(() => {
    let result = todos;

    // Apply search filter
    if (searchQuery) {
      result = result.filter((todo) => todo.text.toLowerCase().includes(searchQuery));
    }

    // Apply status filter
    switch (filter) {
      case 'active':
        result = result.filter((todo) => !todo.completed);
        break;
      case 'completed':
        result = result.filter((todo) => todo.completed);
        break;
      // 'all' returns everything
    }

    return result;
  }, [todos, searchQuery, filter]);

  // Show search and filters only when there are todos
  const showControls = todos.length > 0;

  return (
    <div className="space-y-4">
      {showControls && (
        <div className="space-y-3">
          <TodoSearch onSearch={handleSearch} />
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
            >
              All ({todos.length})
            </button>
            <button
              onClick={() => handleFilterChange('active')}
              className={`px-3 py-1 rounded text-sm ${filter === 'active' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
            >
              Active ({todos.filter((t) => !t.completed).length})
            </button>
            <button
              onClick={() => handleFilterChange('completed')}
              className={`px-3 py-1 rounded text-sm ${filter === 'completed' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
            >
              Completed ({todos.filter((t) => t.completed).length})
            </button>
          </div>
        </div>
      )}

      <OptimizedTodoList
        todos={filteredTodos}
        onToggle={onToggle}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />

      {showControls && searchQuery && filteredTodos.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No todos found matching &ldquo;{searchQuery}&rdquo;</p>
          <button
            onClick={() => handleSearch('')}
            className="text-sm text-primary hover:underline mt-2"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
