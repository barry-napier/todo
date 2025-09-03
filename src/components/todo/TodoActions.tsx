'use client';

import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TodoActionsProps {
  todoText: string;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export function TodoActions({ todoText, onEdit, onDelete, className }: TodoActionsProps) {
  return (
    <div
      className={cn(
        'flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        className
      )}
    >
      <Button
        size="icon"
        variant="ghost"
        onClick={onEdit}
        aria-label={`Edit "${todoText}"`}
        className="min-w-[32px] min-h-[32px] hover:bg-accent"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={onDelete}
        aria-label={`Delete "${todoText}"`}
        className="min-w-[32px] min-h-[32px] text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
