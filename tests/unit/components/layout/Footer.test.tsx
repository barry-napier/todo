import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';

describe('Footer', () => {
  it('should render GitHub repository link', () => {
    render(<Footer />);
    const link = screen.getByText('View on GitHub');
    expect(link).toBeInTheDocument();
  });

  it('should have correct GitHub repository URL', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /view source code on github/i });
    expect(link).toHaveAttribute('href', 'https://github.com/barry-napier/todo');
  });

  it('should open in new tab with security attributes', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /view source code on github/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should have proper accessibility attributes', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /view source code on github/i });
    expect(link).toHaveAttribute('aria-label', 'View source code on GitHub');
  });

  it('should have responsive layout structure', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    const innerDiv = container.querySelector('footer > div');
    
    expect(footer).toHaveClass('w-full', 'border-t');
    expect(innerDiv).toHaveClass('mx-auto', 'flex', 'h-14', 'sm:h-16', 'items-center', 'justify-center');
    expect(innerDiv).toHaveClass('max-w-full', 'sm:max-w-2xl', 'md:max-w-3xl', 'lg:max-w-4xl', 'xl:max-w-5xl');
  });

  it('should have keyboard navigation support', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /view source code on github/i });
    expect(link).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-ring', 'focus:ring-offset-2');
  });

  it('should have hover state styling', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /view source code on github/i });
    expect(link).toHaveClass('hover:text-foreground', 'transition-colors');
  });
});