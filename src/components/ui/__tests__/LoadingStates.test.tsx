import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TodoListSkeleton } from '@/components/todo/TodoListSkeleton';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { useToast } from '@/lib/hooks/useToast';
import { renderHook, act } from '@testing-library/react';

describe('LoadingSpinner', () => {
  it('should show spinner after delay', async () => {
    vi.useFakeTimers();

    render(<LoadingSpinner delay={200} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('should show spinner immediately when delay is 0', () => {
    render(<LoadingSpinner delay={0} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should apply correct size classes', () => {
    render(<LoadingSpinner size="lg" delay={0} />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });
});

describe('TodoListSkeleton', () => {
  it('should render skeleton screen with loading label', () => {
    render(<TodoListSkeleton />);
    expect(screen.getByLabelText('Loading todos')).toBeInTheDocument();
  });

  it('should render multiple skeleton items', () => {
    render(<TodoListSkeleton />);
    const skeletons = screen.getByLabelText('Loading todos').querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe('ProgressIndicator', () => {
  it('should display correct percentage', () => {
    render(<ProgressIndicator current={3} total={10} operation="Processing" />);

    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('should update progress bar width', () => {
    const { rerender } = render(<ProgressIndicator current={0} total={10} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');

    rerender(<ProgressIndicator current={5} total={10} />);
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('should provide screen reader text', () => {
    render(<ProgressIndicator current={7} total={10} operation="Uploading" />);
    expect(screen.getByText('Uploading: 7 of 10 completed')).toHaveClass('sr-only');
  });
});

describe('useToast hook', () => {
  it('should add and remove toasts', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toasts).toHaveLength(0);

    act(() => {
      result.current.showToast('Test message', 'success');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Test message');
    expect(result.current.toasts[0].type).toBe('success');
  });

  it('should auto-dismiss toasts after duration', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message', 'info', 1000);
    });

    expect(result.current.toasts).toHaveLength(1);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.toasts).toHaveLength(0);

    vi.useRealTimers();
  });

  it('should dismiss toast manually', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message', 'error');
    });

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.dismissToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });
});

describe('Optimistic Updates', () => {
  it('should show pending state during optimistic update', async () => {
    const TodoWithOptimistic = () => {
      const [isPending, setIsPending] = React.useState(false);

      const handleClick = async () => {
        setIsPending(true);
        await new Promise((resolve) => setTimeout(resolve, 100));
        setIsPending(false);
      };

      return (
        <div className={isPending ? 'opacity-60' : ''} data-testid="todo-item">
          <button onClick={handleClick}>Update</button>
          {isPending && <span>Updating...</span>}
        </div>
      );
    };

    const user = userEvent.setup();
    render(<TodoWithOptimistic />);

    const item = screen.getByTestId('todo-item');
    expect(item).not.toHaveClass('opacity-60');

    await user.click(screen.getByRole('button'));

    expect(item).toHaveClass('opacity-60');
    expect(screen.getByText('Updating...')).toBeInTheDocument();

    await waitFor(() => {
      expect(item).not.toHaveClass('opacity-60');
    });
  });
});

describe('Reduced Motion Support', () => {
  it('should respect prefers-reduced-motion', () => {
    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia,
      writable: true,
    });

    const { result } = renderHook(() => {
      const [prefersReduced, setPrefersReduced] = React.useState(false);
      React.useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReduced(mq.matches);
      }, []);
      return prefersReduced;
    });

    expect(result.current).toBe(true);
  });
});
