import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Loading from '@/app/loading';

describe('Loading State', () => {
  it('should render skeleton elements', () => {
    const { container } = render(<Loading />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render header skeleton', () => {
    const { container } = render(<Loading />);
    const headerSection = container.querySelector('.flex.items-center.justify-between');
    expect(headerSection).toBeInTheDocument();

    const headerSkeletons = headerSection?.querySelectorAll('[class*="animate-pulse"]');
    expect(headerSkeletons?.length).toBe(2);
  });

  it('should render 5 todo item skeletons', () => {
    const { container } = render(<Loading />);
    const todoItems = container.querySelectorAll('.flex.items-center.space-x-3.rounded-lg.border');
    expect(todoItems).toHaveLength(5);
  });

  it('should have proper spacing between skeletons', () => {
    const { container } = render(<Loading />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('space-y-6');

    const listWrapper = container.querySelector('.space-y-3');
    expect(listWrapper).toBeInTheDocument();
  });

  it('should render checkbox, text and action skeletons for each item', () => {
    const { container } = render(<Loading />);
    const firstItem = container.querySelector('.flex.items-center.space-x-3.rounded-lg.border');
    const itemSkeletons = firstItem?.querySelectorAll('[class*="animate-pulse"]');

    expect(itemSkeletons?.length).toBe(3);
  });
});
