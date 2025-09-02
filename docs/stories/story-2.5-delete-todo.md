# Story 2.5: Delete Todo

## Status
Draft

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
- [ ] Add delete button to TodoItem (AC: 1, 2)
  - [ ] Create TodoActions component for action buttons
  - [ ] Add delete icon button with Trash icon
  - [ ] Show on hover for desktop
  - [ ] Always visible on mobile/touch devices
- [ ] Implement delete functionality (AC: 1)
  - [ ] Add deleteTodo method to useTodos hook
  - [ ] Remove todo from state array
  - [ ] Update localStorage immediately
  - [ ] Handle optimistic updates
- [ ] Add delete confirmation (AC: 3)
  - [ ] Create simple confirmation dialog (optional for MVP)
  - [ ] Use native confirm() for simplicity
  - [ ] Store preference in localStorage (future)
- [ ] Implement removal animation (AC: 4)
  - [ ] Add fade-out animation on delete
  - [ ] Slide up remaining todos smoothly
  - [ ] Use CSS transitions for performance
  - [ ] Duration: 200-300ms
- [ ] Error handling (AC: 1)
  - [ ] Handle deletion failures gracefully
  - [ ] Show error message if delete fails
  - [ ] Rollback optimistic update on error
- [ ] Accessibility features (AC: 1, 2)
  - [ ] ARIA label: "Delete todo: [todo text]"
  - [ ] Keyboard accessible (Tab navigation)
  - [ ] Announce deletion to screen readers
- [ ] Style delete button (AC: 1, 2)
  - [ ] Use destructive variant styling
  - [ ] Red color on hover
  - [ ] Proper spacing from other actions
- [ ] Write unit tests (AC: 1-4)
  - [ ] Test delete button renders
  - [ ] Test delete functionality
  - [ ] Test confirmation flow
  - [ ] Test animation classes applied

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
  setTodos(prev => prev.filter(todo => todo.id !== id));
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
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-09-02 | 1.0 | Initial story creation | Scrum Master |

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