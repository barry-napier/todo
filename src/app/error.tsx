'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StorageError, NetworkError, ValidationError } from '@/lib/errors';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error boundary caught:', error);

    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error reporting service
      console.log('Error report:', {
        message: error.message,
        digest: error.digest,
        timestamp: new Date().toISOString(),
      });
    }
  }, [error]);

  const getErrorMessage = () => {
    if (error instanceof StorageError) {
      return {
        title: 'Storage Issue',
        message: error.message,
        showRetry: error.recoverable,
      };
    }

    if (error instanceof NetworkError) {
      return {
        title: 'Connection Problem',
        message: error.message,
        showRetry: error.retryable,
      };
    }

    if (error instanceof ValidationError) {
      return {
        title: 'Invalid Input',
        message: error.message,
        showRetry: true,
      };
    }

    return {
      title: 'Something went wrong!',
      message: 'We encountered an unexpected error. Please try again.',
      showRetry: true,
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
      <Card className="mx-auto max-w-md p-6 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-destructive"
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
        </div>

        <h2 className="mb-4 text-2xl font-bold">{errorInfo.title}</h2>
        <p className="mb-6 text-muted-foreground">{errorInfo.message}</p>

        {process.env.NODE_ENV === 'development' && error.stack && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
              Error details (development only)
            </summary>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">{error.stack}</pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          {errorInfo.showRetry && (
            <Button onClick={reset} size="lg">
              Try again
            </Button>
          )}
          <Button onClick={() => (window.location.href = '/')} variant="outline" size="lg">
            Go home
          </Button>
        </div>
      </Card>
    </div>
  );
}
