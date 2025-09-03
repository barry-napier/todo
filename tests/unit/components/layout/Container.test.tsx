import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from '@/components/layout/Container';

describe('Container', () => {
  it('should render children', () => {
    render(
      <Container>
        <div data-testid="child">Test Content</div>
      </Container>
    );
    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Test Content');
  });

  it('should apply responsive padding', () => {
    const { container } = render(<Container>Content</Container>);
    const div = container.firstChild;
    expect(div).toHaveClass('px-4', 'sm:px-6', 'md:px-8', 'lg:px-8');
  });

  it('should apply responsive vertical spacing', () => {
    const { container } = render(<Container>Content</Container>);
    const div = container.firstChild;
    expect(div).toHaveClass('py-4', 'sm:py-6', 'md:py-8', 'lg:py-10');
  });

  it('should accept custom className', () => {
    const { container } = render(<Container className="custom-class">Content</Container>);
    const div = container.firstChild;
    expect(div).toHaveClass('custom-class');
  });

  it('should have mx-auto and width classes', () => {
    const { container } = render(<Container>Content</Container>);
    const div = container.firstChild;
    expect(div).toHaveClass('mx-auto', 'w-full');
  });
});
