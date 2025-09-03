'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface TodoSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceDelay?: number;
}

export function TodoSearch({
  onSearch,
  placeholder = 'Search todos...',
  debounceDelay = 300,
}: TodoSearchProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceDelay);

  // Call onSearch when debounced value changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search
          className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-10 pr-10"
          type="search"
          aria-label="Search todos"
          aria-describedby="search-instructions"
        />
        {query && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 h-8 w-8"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <span id="search-instructions" className="sr-only">
        Type to search through your todos. Results update automatically after a short delay.
      </span>
    </div>
  );
}

// Memoized version for performance
export const MemoizedTodoSearch = React.memo(TodoSearch);
