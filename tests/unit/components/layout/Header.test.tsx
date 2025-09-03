import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/layout/Header';

describe('Header', () => {
  it('should render app title', () => {
    render(<Header />);
    const title = screen.getByText('Todo App');
    expect(title).toBeInTheDocument();
  });

  it('should have sticky positioning', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('sticky', 'top-0');
  });

  it('should be responsive with different text sizes', () => {
    const { container } = render(<Header />);
    const title = container.querySelector('h1');
    expect(title).toHaveClass('text-xl', 'sm:text-2xl');
  });

  it('should have proper z-index for layering', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('z-50');
  });
});
