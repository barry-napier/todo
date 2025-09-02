# Story 2.1: Add Todo Functionality

## Status
Draft

## Story
**As a** user,
**I want** to quickly add new todo items,
**so that** I can capture tasks as I think of them

## Acceptance Criteria
1. Text input field at top of todo list
2. Enter key submits new todo
3. Add button for mouse/touch users
4. Input clears after successful add
5. Empty input validation
6. New todos appear immediately at top of list
7. Automatic focus return to input after add

## Tasks / Subtasks
- [ ] Create AddTodo component (AC: 1, 2, 3)
  - [ ] Create `/src/components/todo/AddTodo.tsx` with form structure
  - [ ] Add Input component from shadcn/ui
  - [ ] Add Button component with plus icon
  - [ ] Implement form submission handler
- [ ] Implement todo creation logic (AC: 2, 4, 6)
  - [ ] Create custom hook `/src/lib/hooks/useTodos.ts`
  - [ ] Implement addTodo function with UUID generation
  - [ ] Connect to localStorage service from Story 1.3
  - [ ] Handle optimistic UI updates
- [ ] Add input validation (AC: 5)
  - [ ] Prevent empty todo submission
  - [ ] Trim whitespace from input
  - [ ] Show validation error message
  - [ ] Max length validation (500 chars)
- [ ] Implement keyboard handling (AC: 2, 7)
  - [ ] Handle Enter key for submission
  - [ ] Auto-focus input after successful add
  - [ ] Clear input field after submission
  - [ ] Handle Escape key to clear input
- [ ] Update main page (AC: 1, 6)
  - [ ] Import AddTodo component in `/src/app/page.tsx`
  - [ ] Position at top of todo list area
  - [ ] Connect to todo state management
- [ ] Add animations (AC: 6)
  - [ ] Smooth appearance animation for new todos
  - [ ] Use CSS transitions for fade-in effect
- [ ] Write unit tests (AC: 1-7)
  - [ ] Test AddTodo component rendering
  - [ ] Test form submission with valid input
  - [ ] Test validation for empty input
  - [ ] Test keyboard interactions
  - [ ] Test focus management

## Dev Notes

### Previous Story Context
Stories 1.1-1.4 have established:
- Project setup with Next.js and TypeScript
- shadcn/ui components available (Input, Button)
- localStorage service in `/src/lib/storage/`
- Basic layout structure in place

### Component Implementation
[Source: architecture/source-tree.md]

Create component at:
- `/src/components/todo/AddTodo.tsx`

Use shadcn/ui components:
```typescript
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
```

### State Management
[Source: architecture/data-models.md]

Create custom hook using localStorage service:
```typescript
// /src/lib/hooks/useTodos.ts
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  // Load from localStorage on mount
  // Return CRUD operations
}
```

### Todo Creation
[Source: architecture/data-models.md]

New todo structure:
```typescript
{
  id: generateUUID(),
  text: sanitizeTodoText(input),
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

### Validation Rules
[Source: architecture/data-models.md]
- Text required (min 1 char after trim)
- Max 500 characters
- No line breaks allowed
- Sanitize input before saving

### Technical Constraints
[Source: architecture/tech-stack.md]
- Use React built-in state (no external state libraries)
- UUID from uuid package (already installed)
- TypeScript strict mode compliance

### Testing
[Source: architecture/coding-standards.md]

**Test Requirements:**
- Test file: `/tests/unit/components/todo/AddTodo.test.tsx`
- Use Vitest and Testing Library
- Test user interactions and edge cases
- Mock useTodos hook for isolation

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