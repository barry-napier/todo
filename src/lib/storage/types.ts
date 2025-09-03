export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface StorageError extends Error {
  code: StorageErrorCode;
  originalError?: unknown;
}

export enum StorageErrorCode {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  PARSE_ERROR = 'PARSE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

export interface StorageMetrics {
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
  oldestTodo?: Date;
  newestTodo?: Date;
  averageTextLength: number;
}

export interface MigrationResult {
  success: boolean;
  fromVersion: string;
  toVersion: string;
  migratedCount: number;
  errors?: string[];
}

export interface StorageCapabilities {
  hasLocalStorage: boolean;
  hasIndexedDB: boolean;
  estimatedQuota?: number;
  estimatedUsage?: number;
}

// Re-export types from todo.ts for convenience
export type {
  Todo,
  TodoCreateInput,
  TodoUpdateInput,
  TodoFilters,
  TodoStatus,
  TodoId,
  StorageState,
} from '@/types/todo';
