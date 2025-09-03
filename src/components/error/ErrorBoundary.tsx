'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);

    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error reporting service
      this.reportError(error, errorInfo);
    }

    this.setState({ errorInfo });
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // Placeholder for error reporting
    // In production, this would send to a service like Sentry
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log('Error report:', errorReport);
  }

  private resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.resetError);
      }

      return <ErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
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

        <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">
          {error?.message || 'An unexpected error occurred while rendering this page.'}
        </p>

        {process.env.NODE_ENV === 'development' && error?.stack && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 mb-2">
              Error details (development only)
            </summary>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={resetError} variant="default">
            Try Again
          </Button>
          <Button onClick={() => (window.location.href = '/')} variant="outline">
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
