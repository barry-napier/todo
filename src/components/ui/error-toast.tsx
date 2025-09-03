'use client';

import { useEffect, useState } from 'react';
import { type ErrorState, ERROR_MESSAGES } from '@/lib/errors';
import { Button } from '@/components/ui/button';

interface ErrorToastProps {
  error: ErrorState;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function ErrorToast({ error, onDismiss, onRetry }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const messages = ERROR_MESSAGES[error.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!error.recoverable) {
        setIsVisible(false);
        onDismiss();
      }
    }, 10000); // Auto-dismiss after 10 seconds for non-recoverable errors

    return () => clearTimeout(timer);
  }, [error.recoverable, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
      <div className="bg-background border rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {error.type === 'storage' && (
              <svg
                className="h-5 w-5 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
            {error.type === 'network' && (
              <svg
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                />
              </svg>
            )}
            {error.type === 'validation' && (
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {error.type === 'unknown' && (
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold">{messages.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>

            <div className="mt-3 flex gap-2">
              {error.recoverable && error.retryAction && (
                <Button
                  size="sm"
                  onClick={() => {
                    error.retryAction?.();
                    onRetry?.();
                  }}
                >
                  {messages.action}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsVisible(false);
                  onDismiss();
                }}
              >
                Dismiss
              </Button>
            </div>
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
