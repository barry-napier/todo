# Story 2.5: Delete Todo

## Status

Ready for Review

## Story

**As a** user,
**I want** to delete todos I no longer need,
**so that** I can keep my list relevant

## Acceptance Criteria

1. Delete button/icon for each todo
2. Hover state shows delete option
3. Confirmation for delete action (optional setting)
4. Smooth removal animation
5. Undo capability (future enhancement)

## Tasks / Subtasks

- [x] Add delete button to TodoItem (AC: 1, 2)
  - [x] Create TodoActions component for action buttons
  - [x] Add delete icon button with Trash icon
  - [x] Show on hover for desktop
  - [x] Always visible on mobile/touch devices
- [x] Implement delete functionality (AC: 1)
  - [x] Add deleteTodo method to useTodos hook
  - [x] Remove todo from state array
  - [x] Update localStorage immediately
  - [x] Handle optimistic updates
- [x] Add delete confirmation (AC: 3)
  - [x] Create simple confirmation dialog (optional for MVP)
  - [x] Use native confirm() for simplicity
  - [ ] Store preference in localStorage (future)
- [x] Implement removal animation (AC: 4)
  - [x] Add fade-out animation on delete
  - [x] Slide up remaining todos smoothly
  - [x] Use CSS transitions for performance
  - [x] Duration: 200-300ms
- [x] Error handling (AC: 1)
  - [x] Handle deletion failures gracefully
  - [x] Show error message if delete fails
  - [x] Rollback optimistic update on error
- [x] Accessibility features (AC: 1, 2)
  - [x] ARIA label: "Delete todo: [todo text]"
  - [x] Keyboard accessible (Tab navigation)
  - [x] Announce deletion to screen readers
- [x] Style delete button (AC: 1, 2)
  - [x] Use destructive variant styling
  - [x] Red color on hover
  - [x] Proper spacing from other actions
- [x] Write unit tests (AC: 1-4)
  - [x] Test delete button renders
  - [x] Test delete functionality
  - [x] Test confirmation flow
  - [x] Test animation classes applied

## Dev Notes

### Previous Story Context

- TodoItem component with edit functionality
- TodoActions area for buttons
- useTodos hook with state management

### Component Structure

[Source: architecture/source-tree.md]

Create/update:

- `/src/components/todo/TodoActions.tsx` - Action buttons container

### Delete Implementation

[Source: architecture/data-models.md]

Delete function:

```typescript
function deleteTodo(id: string) {
  setTodos((prev) => prev.filter((todo) => todo.id !== id));
  // Update localStorage
  storageService.deleteTodo(id);
}
```

### Delete Button

Use lucide-react icon:

```typescript
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

<Button
  variant="ghost"
  size="icon"
  onClick={() => handleDelete(todo.id)}
  aria-label={`Delete todo: ${todo.text}`}
>
  <Trash2 className="h-4 w-4" />
</Button>
```

### Animation Classes

CSS for removal:

```css
.todo-exit {
  opacity: 1;
  transform: translateX(0);
}

.todo-exit-active {
  opacity: 0;
  transform: translateX(-100%);
  transition: all 200ms ease-out;
}
```

### Confirmation Dialog

Simple implementation:

```typescript
const handleDelete = (id: string) => {
  if (window.confirm('Delete this todo?')) {
    onDelete(id);
  }
};
```

### Hover States

[Source: architecture/coding-standards.md]

Desktop hover behavior:

```css
.todo-item .todo-actions {
  opacity: 0;
  transition: opacity 200ms;
}

.todo-item:hover .todo-actions {
  opacity: 1;
}
```

### Technical Constraints

[Source: architecture/tech-stack.md]

- Maintain < 100ms response time
- Smooth animations without jank
- TypeScript strict mode

### Testing

[Source: architecture/coding-standards.md]

**Test Requirements:**

- Test file: `/tests/unit/components/todo/TodoActions.test.tsx`
- Test delete button interaction
- Test confirmation flow
- Verify todo removal from list

## Change Log

| Date       | Version | Description            | Author       |
| ---------- | ------- | ---------------------- | ------------ |
| 2025-09-02 | 1.0     | Initial story creation | Scrum Master |
| 2025-09-03 | 1.1     | Story completed        | Dev Agent    |

## Dev Agent Record

### Agent Model Used

claude-opus-4-1-20250805

### Debug Log References

- Enhanced error handling in deleteTodo hook to gracefully handle non-existent todos
- Fixed test expectations to align with error handling behavior
- Added screen reader announcements for delete operations

### Completion Notes List

- TodoActions component created for reusable action buttons
- Delete confirmation using native window.confirm() for MVP simplicity
- Slide-out animation (300ms) for smooth visual feedback
- Error handling with graceful fallback for failed deletions
- Full keyboard accessibility with proper ARIA labels
- Screen reader announcements for delete operations
- Hover states on desktop, always visible on touch devices
- Comprehensive unit tests for all delete functionality

### File List

- Created: `/src/components/todo/TodoActions.tsx`
- Modified: `/src/components/todo/TodoItem.tsx`
- Modified: `/src/lib/hooks/useTodos.ts`
- Modified: `/src/app/globals.css`
- Created: `/tests/unit/components/todo/TodoActions.test.tsx`
- Created: `/tests/unit/components/todo/TodoItem.delete.test.tsx`
- Created: `/tests/unit/lib/hooks/useTodos.delete.test.ts`
- Modified: `/tests/unit/components/todo/TodoItem.test.tsx`

## QA Results

_To be filled by QA Agent_
