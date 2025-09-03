'use client';

import { useState, useRef, useEffect } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { Todo } from '@/types/todo';
import { TodoCheckbox } from '@/components/todo/TodoCheckbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'text' | 'completed'>>) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedText = editText.trim();
    if (trimmedText && trimmedText !== todo.text) {
      onUpdate(todo.id, { text: trimmedText });
    } else {
      setEditText(todo.text);
    }
    setIsEditing(false);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(todo.id);
    }, 300); // Match animation duration
  };

  return (
    <Card
      className={cn(
        'p-3 transition-all duration-300 hover:shadow-md',
        isDeleting && 'animate-slide-out',
        todo.completed && 'opacity-60'
      )}
    >
      <div className="flex items-center gap-3">
        <TodoCheckbox
          todoId={todo.id}
          todoText={todo.text}
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          className="min-w-[20px] min-h-[20px]"
        />

        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              ref={inputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="flex-1"
              maxLength={500}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              aria-label="Save changes"
              className="min-w-[32px] min-h-[32px]"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCancel}
              aria-label="Cancel editing"
              className="min-w-[32px] min-h-[32px]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <label
              htmlFor={`todo-${todo.id}`}
              className={cn(
                'flex-1 cursor-pointer transition-all duration-200',
                todo.completed && 'line-through text-muted-foreground decoration-2'
              )}
            >
              {todo.text}
            </label>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                aria-label={`Edit "${todo.text}"`}
                className="min-w-[32px] min-h-[32px]"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDelete}
                aria-label={`Delete "${todo.text}"`}
                className="min-w-[32px] min-h-[32px] text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
