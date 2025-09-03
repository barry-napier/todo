'use client';

import React from 'react';
import { TodoItem } from './TodoItem';

// This component uses React.memo with TodoItem directly
// No separate interface needed as it reuses TodoItem's props

export const MemoizedTodoItem = React.memo(TodoItem, (prevProps, nextProps) => {
  return (
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.text === nextProps.todo.text &&
    prevProps.todo.completed === nextProps.todo.completed &&
    prevProps.todo.updatedAt === nextProps.todo.updatedAt &&
    prevProps.tabIndex === nextProps.tabIndex &&
    prevProps.index === nextProps.index
  );
});

MemoizedTodoItem.displayName = 'MemoizedTodoItem';
