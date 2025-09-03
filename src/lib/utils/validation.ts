import { TodoCreateInput, TodoUpdateInput } from '@/types/todo';
import { ValidationResult } from '@/lib/storage/types';

const MIN_TODO_LENGTH = 1;
const MAX_TODO_LENGTH = 500;

export function validateTodoInput(input: TodoCreateInput | TodoUpdateInput): ValidationResult {
  // Check if text exists (for create, it's required; for update, it's optional)
  if ('text' in input && input.text !== undefined) {
    const text = input.text;

    // Check if text is empty or just whitespace
    if (!text || text.trim().length === 0) {
      return {
        isValid: false,
        error: 'Todo text cannot be empty',
      };
    }

    // Check minimum length
    if (text.trim().length < MIN_TODO_LENGTH) {
      return {
        isValid: false,
        error: `Todo text must be at least ${MIN_TODO_LENGTH} character`,
      };
    }

    // Check maximum length
    if (text.length > MAX_TODO_LENGTH) {
      return {
        isValid: false,
        error: `Todo text cannot exceed ${MAX_TODO_LENGTH} characters`,
      };
    }

    // Check for line breaks
    if (text.includes('\n') || text.includes('\r')) {
      return {
        isValid: false,
        error: 'Todo text cannot contain line breaks',
      };
    }
  } else if ('text' in input && input.text === undefined) {
    // Text is explicitly undefined in update, which is valid
    return { isValid: true };
  } else if (!('text' in input) || input.text === undefined) {
    // Check if this is an update operation (has other fields)
    if ('completed' in input) {
      // It's an update with only completed field
      return { isValid: true };
    }
    // Otherwise it's a create without text, which is invalid
    return {
      isValid: false,
      error: 'Todo text is required',
    };
  }

  return { isValid: true };
}

export function sanitizeTodoText(text: string): string {
  // Trim whitespace
  let sanitized = text.trim();

  // Remove line breaks and replace with spaces
  sanitized = sanitized.replace(/[\r\n]+/g, ' ');

  // Replace multiple spaces with single space
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Remove any control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Ensure it doesn't exceed max length
  if (sanitized.length > MAX_TODO_LENGTH) {
    sanitized = sanitized.substring(0, MAX_TODO_LENGTH);
  }

  return sanitized;
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function validateTodoText(text: string): string | null {
  const validation = validateTodoInput({ text });
  return validation.isValid ? null : validation.error || 'Invalid input';
}

export function validateBatchTodos(todos: TodoCreateInput[]): ValidationResult {
  if (!Array.isArray(todos)) {
    return {
      isValid: false,
      error: 'Input must be an array of todos',
    };
  }

  if (todos.length === 0) {
    return {
      isValid: false,
      error: 'At least one todo is required',
    };
  }

  if (todos.length > 100) {
    return {
      isValid: false,
      error: 'Cannot create more than 100 todos at once',
    };
  }

  for (let i = 0; i < todos.length; i++) {
    const validation = validateTodoInput(todos[i]);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: `Todo at index ${i}: ${validation.error}`,
      };
    }
  }

  return { isValid: true };
}
