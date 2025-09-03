'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AddTodoProps {
  onAdd: (text: string) => void;
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) {
      setError('Please enter a todo item');
      return;
    }

    if (trimmedText.length > 500) {
      setError('Todo must be 500 characters or less');
      return;
    }

    onAdd(trimmedText);
    setText('');
    setError('');

    // Auto-focus input after successful add
    const input = document.querySelector<HTMLInputElement>('#add-todo-input');
    if (input) {
      input.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setText('');
      setError('');
    }
  };

  const handleInputChange = (value: string) => {
    setText(value);
    if (error) {
      setError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          id="add-todo-input"
          type="text"
          placeholder="What needs to be done?"
          value={text}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={error ? 'border-red-500' : ''}
          maxLength={500}
          autoFocus
          aria-label="New todo input"
          aria-invalid={!!error}
          aria-describedby={error ? 'todo-error' : undefined}
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Add todo"
          className="min-w-[44px] min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {error && (
        <p id="todo-error" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </form>
  );
}
