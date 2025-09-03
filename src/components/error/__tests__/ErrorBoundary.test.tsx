import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should catch and display error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should reset error state on retry', () => {
    let shouldThrow = true;
    
    const TestComponent = () => {
      return <ThrowError shouldThrow={shouldThrow} />;
    };
    
    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // Remove unused variable warning by commenting out
    // const rerender was available if needed

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Change the flag to not throw
    shouldThrow = false;
    
    // Reset the error
    fireEvent.click(screen.getByText('Try Again'));

    // The component should now render without error
    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should use custom fallback when provided', () => {
    const customFallback = (error: Error, reset: () => void) => (
      <div>
        <h1>Custom Error</h1>
        <p>{error.message}</p>
        <button onClick={reset}>Custom Reset</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Custom Reset')).toBeInTheDocument();
  });

  it('should show error details in development mode', () => {
    // const originalEnv = process.env.NODE_ENV; // Not used in this test
    // Mock NODE_ENV using vi
    vi.stubEnv('NODE_ENV', 'development');

    const errorWithStack = new Error('Test error with stack');
    errorWithStack.stack = 'Error: Test error with stack\n  at TestComponent';

    function ThrowWithStack(): never {
      throw errorWithStack;
    }

    render(
      <ErrorBoundary>
        <ThrowWithStack />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error details (development only)')).toBeInTheDocument();

    // Open details
    fireEvent.click(screen.getByText('Error details (development only)'));

    expect(screen.getAllByText(/Test error with stack/)[0]).toBeInTheDocument();

    // Restore original env
    vi.unstubAllEnvs();
  });

  it('should not show error details in production mode', () => {
    // const originalEnv = process.env.NODE_ENV; // Not used in this test
    // Mock NODE_ENV using vi
    vi.stubEnv('NODE_ENV', 'production');

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error details (development only)')).not.toBeInTheDocument();

    // Restore original env
    vi.unstubAllEnvs();
  });

  it('should navigate to home on Go Home button click', () => {
    const originalLocation = window.location;
    delete (window as { location?: Location }).location;
    window.location = { ...originalLocation, href: '' } as Location & string;

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Go Home'));

    expect(window.location.href).toBe('/');

    window.location = originalLocation as Location & string;
  });
});
