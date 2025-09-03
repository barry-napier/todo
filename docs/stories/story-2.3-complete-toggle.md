# Story 2.3: Complete/Uncomplete Toggle

## Status

Draft

## Story

**As a** user,
**I want** to mark todos as complete or incomplete,
**so that** I can track my progress

## Acceptance Criteria

1. Checkbox or toggle button for each todo
2. Visual feedback on hover/focus
3. Immediate visual update (strikethrough, opacity)
4. Completed todos remain in list but visually distinct
5. Bulk complete/uncomplete actions (future enhancement)

## Tasks / Subtasks

- [ ] Create TodoCheckbox component (AC: 1, 2)
  - [ ] Create `/src/components/todo/TodoCheckbox.tsx`
  - [ ] Use Checkbox component from shadcn/ui
  - [ ] Add custom styling for checked state
  - [ ] Implement hover and focus states
- [ ] Add toggle functionality (AC: 1, 3)
  - [ ] Add toggleTodo method to useTodos hook
  - [ ] Update todo completed status
  - [ ] Update updatedAt timestamp
  - [ ] Save to localStorage immediately
- [ ] Update TodoItem component (AC: 3, 4)
  - [ ] Integrate TodoCheckbox component
  - [ ] Apply conditional styling for completed todos
  - [ ] Add strikethrough text decoration
  - [ ] Reduce opacity to 60% for completed
- [ ] Implement keyboard accessibility (AC: 2)
  - [ ] Support Space key to toggle
  - [ ] Proper focus indicators
  - [ ] ARIA attributes for screen readers
- [ ] Add transition animations (AC: 3)
  - [ ] Smooth transition for strikethrough
  - [ ] Opacity fade animation
  - [ ] Checkbox animation on toggle
- [ ] Update todo service (AC: 1, 3)
  - [ ] Modify updateTodo in storageService
  - [ ] Ensure optimistic updates
  - [ ] Handle errors gracefully
- [ ] Write unit tests (AC: 1-4)
  - [ ] Test checkbox toggle functionality
  - [ ] Test visual state changes
  - [ ] Test keyboard interactions
  - [ ] Test data persistence

## Dev Notes

### Previous Story Context

- TodoItem component created in Story 2.2
- useTodos hook established in Story 2.1
- localStorage service from Story 1.3

### Component Implementation

[Source: architecture/source-tree.md]

Create component:

- `/src/components/todo/TodoCheckbox.tsx`

### Checkbox Component

[Source: architecture/coding-standards.md]

Use shadcn/ui Checkbox:

```typescript
import { Checkbox } from '@/components/ui/checkbox';

interface TodoCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  todoId: string;
}
```

### Toggle Implementation

[Source: architecture/data-models.md]

Update todo:

```typescript
function toggleTodo(id: string) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    updateTodo(id, {
      completed: !todo.completed,
      updatedAt: new Date(),
    });
  }
}
```

### Visual States

[Source: Epic 2 specifications]

Completed todo styling:

- Text: `line-through`
- Opacity: `opacity-60`
- Transition: `transition-all duration-200`

### Accessibility Requirements

[Source: architecture/coding-standards.md]

- ARIA label: "Mark as complete/incomplete"
- Role: checkbox
- Keyboard navigable
- Focus visible indicator

### Technical Constraints

[Source: architecture/tech-stack.md]

- Use React.useCallback for handlers
- Maintain < 100ms response time
- TypeScript strict mode

### Testing

[Source: architecture/coding-standards.md]

**Test Requirements:**

- Test file: `/tests/unit/components/todo/TodoCheckbox.test.tsx`
- Test toggle state changes
- Test accessibility features
- Verify localStorage updates

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
