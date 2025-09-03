import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainLayout } from '@/components/layout/MainLayout';

describe('MainLayout', () => {
  it('should render header and children', () => {
    render(
      <MainLayout>
        <div data-testid="content">Page Content</div>
      </MainLayout>
    );

    expect(screen.getByText('Todo App')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should have min-height screen', () => {
    const { container } = render(<MainLayout>Content</MainLayout>);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('min-h-screen');
  });

  it('should have background class', () => {
    const { container } = render(<MainLayout>Content</MainLayout>);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('bg-background');
  });

  it('should wrap children in main element', () => {
    const { container } = render(<MainLayout>Content</MainLayout>);
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-1');
  });
});
