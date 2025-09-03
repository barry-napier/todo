export class StorageError extends Error {
  constructor(
    message: string,
    public readonly recoverable = true
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly retryable = true
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ErrorState {
  type: 'storage' | 'network' | 'validation' | 'unknown';
  message: string;
  recoverable: boolean;
  retryAction?: () => void | Promise<void>;
}

export const ERROR_CODES = {
  VALIDATION_ERROR: 'Input validation failed',
  NOT_FOUND: 'Resource not found',
  QUOTA_EXCEEDED: 'Storage quota exceeded',
  INTERNAL_ERROR: 'Unexpected server error',
  RATE_LIMIT: 'Too many requests',
} as const;

export const ERROR_MESSAGES = {
  storage: {
    title: 'Storage Issue',
    message: "Your browser storage is full. We've cleaned up old completed tasks.",
    action: 'Continue',
  },
  network: {
    title: 'Connection Issue',
    message: "Changes saved locally. We'll sync when you're back online.",
    action: 'Retry Now',
  },
  validation: {
    title: 'Invalid Data',
    message: 'Some data was corrupted and has been reset.',
    action: 'OK',
  },
  unknown: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
    action: 'Retry',
  },
};
