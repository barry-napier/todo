import { describe, it, expect } from 'vitest';
import {
  validateTodoInput,
  sanitizeTodoText,
  isValidUUID,
  validateTodoText,
  validateBatchTodos,
} from '@/lib/utils/validation';
import { TodoCreateInput } from '@/types/todo';

describe('Validation Utilities', () => {
  describe('validateTodoInput', () => {
    it('should accept valid todo text', () => {
      const result = validateTodoInput({ text: 'Valid todo text' });
      expect(result.isValid).toBe(true);
    });

    it('should reject empty text', () => {
      const result = validateTodoInput({ text: '' });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should reject whitespace-only text', () => {
      const result = validateTodoInput({ text: '   ' });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should reject text exceeding max length', () => {
      const result = validateTodoInput({ text: 'a'.repeat(501) });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot exceed 500 characters');
    });

    it('should reject text with line breaks', () => {
      const result = validateTodoInput({ text: 'Line 1\nLine 2' });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot contain line breaks');
    });

    it('should accept optional text in update input', () => {
      const result = validateTodoInput({ completed: true });
      expect(result.isValid).toBe(true);
    });
  });

  describe('sanitizeTodoText', () => {
    it('should trim whitespace', () => {
      const result = sanitizeTodoText('  text  ');
      expect(result).toBe('text');
    });

    it('should replace line breaks with spaces', () => {
      const result = sanitizeTodoText('Line 1\nLine 2\rLine 3');
      expect(result).toBe('Line 1 Line 2 Line 3');
    });

    it('should replace multiple spaces with single space', () => {
      const result = sanitizeTodoText('Text   with    spaces');
      expect(result).toBe('Text with spaces');
    });

    it('should remove control characters', () => {
      const result = sanitizeTodoText('Text\x00with\x1Fcontrol\x7Fchars');
      expect(result).toBe('Textwithcontrolchars');
    });

    it('should truncate text exceeding max length', () => {
      const longText = 'a'.repeat(600);
      const result = sanitizeTodoText(longText);
      expect(result.length).toBe(500);
    });
  });

  describe('isValidUUID', () => {
    it('should accept valid UUID v4', () => {
      const uuid = '123e4567-e89b-42d3-a456-426614174000';
      expect(isValidUUID(uuid)).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(false); // Wrong version
      expect(isValidUUID('123e4567e89b42d3a456426614174000')).toBe(false); // No hyphens
    });

    it('should handle uppercase UUIDs', () => {
      const uuid = '123E4567-E89B-42D3-A456-426614174000';
      expect(isValidUUID(uuid)).toBe(true);
    });
  });

  describe('validateTodoText', () => {
    it('should return null for valid text', () => {
      expect(validateTodoText('Valid text')).toBeNull();
    });

    it('should return error message for invalid text', () => {
      const error = validateTodoText('');
      expect(error).toContain('cannot be empty');
    });
  });

  describe('validateBatchTodos', () => {
    it('should accept valid batch of todos', () => {
      const todos = [{ text: 'Todo 1' }, { text: 'Todo 2' }, { text: 'Todo 3' }];
      const result = validateBatchTodos(todos);
      expect(result.isValid).toBe(true);
    });

    it('should reject non-array input', () => {
      const result = validateBatchTodos({} as unknown as TodoCreateInput[]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be an array');
    });

    it('should reject empty array', () => {
      const result = validateBatchTodos([]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('At least one todo is required');
    });

    it('should reject more than 100 todos', () => {
      const todos = Array(101).fill({ text: 'Todo' });
      const result = validateBatchTodos(todos);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Cannot create more than 100 todos');
    });

    it('should identify invalid todo in batch', () => {
      const todos = [
        { text: 'Valid todo' },
        { text: '' }, // Invalid
        { text: 'Another valid' },
      ];
      const result = validateBatchTodos(todos);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Todo at index 1');
    });
  });
});
