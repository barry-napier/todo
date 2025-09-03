# Story 3.1: Responsive Design Implementation

## Status

Draft

## Story

**As a** user,
**I want** the app to work perfectly on any device,
**so that** I can manage todos anywhere

## Acceptance Criteria

1. Mobile layout (< 768px): Single column, large touch targets
2. Tablet layout (768-1024px): Optimized spacing
3. Desktop layout (> 1024px): Centered content, max-width container
4. Touch gestures on mobile (swipe to delete/complete)
5. Viewport meta tag properly configured
6. No horizontal scrolling at any breakpoint

## Tasks / Subtasks

- [ ] Configure responsive breakpoints (AC: 1, 2, 3)
  - [ ] Update Tailwind config with custom breakpoints
  - [ ] Add container max-width constraints
  - [ ] Configure viewport meta tag in layout
- [ ] Update layout components (AC: 1, 2, 3, 6)
  - [ ] Make Header responsive with mobile menu
  - [ ] Adjust Container padding per breakpoint
  - [ ] Ensure MainLayout adapts to screen size
- [ ] Optimize TodoItem for mobile (AC: 1, 4)
  - [ ] Increase touch target size to 44x44px minimum
  - [ ] Add swipe gesture support (optional for MVP)
  - [ ] Stack actions vertically on small screens
  - [ ] Larger fonts and spacing on mobile
- [ ] Optimize TodoList layout (AC: 1, 2, 3)
  - [ ] Single column on mobile
  - [ ] Optimal spacing on tablet
  - [ ] Centered with max-width on desktop
- [ ] Optimize AddTodo input (AC: 1)
  - [ ] Full width on mobile
  - [ ] Larger input field height (48px min)
  - [ ] Bigger submit button on touch devices
- [ ] Test responsive behavior (AC: 6)
  - [ ] Test on real devices if available
  - [ ] Use browser DevTools device emulation
  - [ ] Verify no horizontal scroll at any size
  - [ ] Test touch interactions on mobile
- [ ] Write responsive tests (AC: 1-6)
  - [ ] Test layout at different breakpoints
  - [ ] Test touch target sizes
  - [ ] Verify responsive utilities work

## Dev Notes

### Previous Story Context

All core functionality from Epic 1 and 2 is complete. This story focuses on making the existing UI responsive.

### Breakpoint Configuration

[Source: architecture/tech-stack.md]

Tailwind CSS 4 breakpoints:

```javascript
// tailwind.config.ts
theme: {
  screens: {
    'sm': '640px',   // Small devices
    'md': '768px',   // Tablets
    'lg': '1024px',  // Desktop
    'xl': '1280px',  // Large desktop
  }
}
```

### Mobile-First Approach

[Source: architecture/coding-standards.md]

Base styles for mobile, enhance for larger:

```css
/* Base (mobile) */
.container {
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}
```

### Touch Targets

[Source: WCAG Guidelines]

Minimum touch target size: 44x44px

```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

### Container Constraints

```typescript
// Container component
<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
  {children}
</div>
```

### Viewport Meta Tag

[Source: Next.js App Router]

In app/layout.tsx:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
```

### Testing Breakpoints

Test at these viewport widths:

- 375px (iPhone SE)
- 768px (iPad)
- 1024px (Desktop)
- 1440px (Large desktop)

### Technical Constraints

[Source: architecture/tech-stack.md]

- Use Tailwind CSS 4 responsive utilities
- Maintain performance on low-end devices
- Support touch and mouse interactions

### Testing

[Source: architecture/coding-standards.md]

**Test Requirements:**

- Test file: `/tests/unit/responsive.test.tsx`
- Use window.matchMedia for breakpoint tests
- Test touch event handling
- Verify layout changes

## Change Log

| Date       | Version | Description            | Author       |
| ---------- | ------- | ---------------------- | ------------ |
| 2025-09-02 | 1.0     | Initial story creation | Scrum Master |

## Dev Agent Record

### Agent Model Used

_To be filled by Dev Agent_

### Debug Log References

_To be filled by Dev Agent_

### Completion Notes List

_To be filled by Dev Agent_

### File List

_To be filled by Dev Agent_

## QA Results

_To be filled by QA Agent_
