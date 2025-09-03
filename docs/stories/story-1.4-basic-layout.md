# Story 1.4: Basic Layout & Shell

## Status

Draft

## Story

**As a** user,
**I want** a clean, responsive application layout,
**so that** I can use the app on any device

## Acceptance Criteria

1. Responsive header with app title
2. Main content area for todo list
3. Mobile-first responsive design
4. Loading and error boundaries implemented

## Tasks / Subtasks

- [ ] Create layout components (AC: 1, 2)
  - [ ] Create `/src/components/layout/Header.tsx` with app title
  - [ ] Create `/src/components/layout/Container.tsx` for content wrapper
  - [ ] Create `/src/components/layout/MainLayout.tsx` combining header and content
- [ ] Update root layout (AC: 1, 2, 3)
  - [ ] Update `/src/app/layout.tsx` to use MainLayout component
  - [ ] Add responsive meta viewport tag
  - [ ] Configure global CSS with Tailwind utilities
- [ ] Implement responsive design (AC: 3)
  - [ ] Add mobile-first breakpoints in components
  - [ ] Test layout on various screen sizes
  - [ ] Ensure touch-friendly tap targets (min 44x44px)
- [ ] Create error boundary (AC: 4)
  - [ ] Create `/src/app/error.tsx` for error handling
  - [ ] Add user-friendly error message component
  - [ ] Include error recovery action (reload button)
- [ ] Create loading state (AC: 4)
  - [ ] Create `/src/app/loading.tsx` for loading states
  - [ ] Use Skeleton component from shadcn/ui
  - [ ] Ensure smooth loading transitions
- [ ] Write unit tests (AC: 1, 2, 3, 4)
  - [ ] Test Header component renders correctly
  - [ ] Test Container responsive behavior
  - [ ] Test error boundary catches errors
  - [ ] Test loading state displays

## Dev Notes

### Previous Story Insights

Stories 1.1-1.3 have established the project foundation with Next.js, shadcn/ui components, and the data persistence layer. The basic project structure is in place.

### Component Structure

[Source: architecture/source-tree.md]

Create these layout components:

- `/src/components/layout/Header.tsx` - Application header
- `/src/components/layout/Container.tsx` - Content wrapper
- `/src/components/layout/MainLayout.tsx` - Combined layout

### Layout Implementation

[Source: architecture/coding-standards.md]

**Header Component Example:**

```typescript
export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold">Todo App</h1>
      </div>
    </header>
  );
}
```

### Error Boundary

[Source: architecture/coding-standards.md]

Next.js App Router uses `error.tsx` for error boundaries. Implement with:

- User-friendly error message
- Error logging to console
- Recovery action (reload button)

### Responsive Design Requirements

- Mobile breakpoint: 640px (sm)
- Tablet breakpoint: 768px (md)
- Desktop breakpoint: 1024px (lg)
- Use Tailwind's responsive prefixes

### Loading States

Use shadcn/ui Skeleton component (already installed in Story 1.2):

```typescript
import { Skeleton } from '@/components/ui/skeleton';
```

### Technical Constraints

[Source: architecture/tech-stack.md]

- Use Tailwind CSS 4 for styling
- Follow mobile-first responsive approach
- Ensure WCAG AA accessibility compliance

### Testing

[Source: architecture/coding-standards.md]

**Testing Requirements:**

- Test files in `/tests/unit/components/layout/`
- Use Vitest and Testing Library
- Test responsive behavior with different viewport sizes
- Verify error boundary functionality

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
