# Story 2.4: Edit Todo Text

## Status

✅ Complete

## Story

**As a** user,
**I want** to edit existing todo text,
**so that** I can correct mistakes or add details

## Acceptance Criteria

1. Click/tap on todo text to enter edit mode
2. Edit icon button as alternative trigger
3. Inline editing with same-size input field
4. Enter saves, Escape cancels
5. Click outside saves changes
6. Validation prevents empty todos

## Tasks / Subtasks

- [x] Add edit mode to TodoItem (AC: 1, 3)
  - [x] Add isEditing state to TodoItem component
  - [x] Toggle edit mode on text click
  - [x] Replace text with Input component when editing
  - [x] Match input size to text display
- [x] Create edit trigger button (AC: 2)
  - [x] Add edit icon button to TodoItem
  - [x] Show on hover or always on mobile
  - [x] Use Pencil icon from lucide-react
  - [x] Proper ARIA label for accessibility
- [x] Implement edit handlers (AC: 4, 5)
  - [x] Handle Enter key to save
  - [x] Handle Escape key to cancel
  - [x] Save on blur (click outside)
  - [x] Restore original text on cancel
- [x] Add validation (AC: 6)
  - [x] Prevent saving empty text
  - [x] Trim whitespace before validation
  - [x] Show error state if invalid
  - [x] Max length check (500 chars)
- [x] Update todo service (AC: 4, 5)
  - [x] Add editTodo method to useTodos hook
  - [x] Update text and updatedAt fields
  - [x] Save to localStorage
  - [x] Handle optimistic updates
- [x] Focus management (AC: 1, 3)
  - [x] Auto-focus input when entering edit mode
  - [x] Select all text on focus
  - [x] Return focus after save/cancel
- [x] Style edit mode (AC: 3)
  - [x] Seamless transition to input
  - [x] Highlight editing todo
  - [x] Consistent padding and font size
- [x] Write unit tests (AC: 1-6)
  - [x] Test entering/exiting edit mode
  - [x] Test save and cancel operations
  - [x] Test validation logic
  - [x] Test keyboard interactions

## Dev Notes

### Previous Story Context

- TodoItem component from Story 2.2
- TodoCheckbox from Story 2.3
- useTodos hook with CRUD operations

### Edit Mode Implementation

[Source: architecture/coding-standards.md]

TodoItem state management:

```typescript
const [isEditing, setIsEditing] = useState(false);
const [editText, setEditText] = useState(todo.text);

const handleSave = () => {
  if (editText.trim()) {
    onEdit(todo.id, editText.trim());
    setIsEditing(false);
  }
};

const handleCancel = () => {
  setEditText(todo.text);
  setIsEditing(false);
};
```

### Input Component Usage

[Source: architecture/source-tree.md]

Use shadcn/ui Input:

```typescript
import { Input } from "@/components/ui/input"

{isEditing ? (
  <Input
    value={editText}
    onChange={(e) => setEditText(e.target.value)}
    onKeyDown={handleKeyDown}
    onBlur={handleSave}
    autoFocus
  />
) : (
  <span onClick={() => setIsEditing(true)}>
    {todo.text}
  </span>
)}
```

### Keyboard Handling

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSave();
  } else if (e.key === 'Escape') {
    handleCancel();
  }
};
```

### Validation Rules

[Source: architecture/data-models.md]

- Min length: 1 character (after trim)
- Max length: 500 characters
- No empty todos allowed

### Edit Icon Button

Use lucide-react icons:

```typescript
import { Pencil } from 'lucide-react';
```

### Technical Constraints

[Source: architecture/tech-stack.md]

- Response time < 100ms
- Optimistic UI updates
- TypeScript strict mode

### Testing

[Source: architecture/coding-standards.md]

**Test Requirements:**

- Test file: `/tests/unit/components/todo/TodoItem.test.tsx`
- Test edit mode transitions
- Test validation scenarios
- Mock edit callbacks

## Change Log

| Date       | Version | Description            | Author       |
| ---------- | ------- | ---------------------- | ------------ |
| 2025-09-02 | 1.0     | Initial story creation | Scrum Master |

## Dev Agent Record

### Agent Model Used

claude-opus-4-1-20250805

### Debug Log References

- TodoItem component already had edit functionality implemented
- Added click-to-edit feature on todo text (AC 1)
- Enhanced validation for empty text and max length
- Added comprehensive unit tests for all edit features

### Completion Notes List

- Edit functionality was already implemented in TodoItem component
- Enhanced with click-to-edit on todo text
- Added robust validation for empty and max-length scenarios
- All acceptance criteria met and tested
- 27 tests passing for TodoItem component

### File List

- Modified: `/src/components/todo/TodoItem.tsx`
- Modified: `/tests/unit/components/todo/TodoItem.test.tsx`
- Verified: `/src/lib/hooks/useTodos.ts` (updateTodo method already present)
- Verified: `/src/components/todo/TodoList.tsx` (onUpdate prop already wired)
- Verified: `/src/app/page.tsx` (updateTodo already connected)

## QA Results

_To be filled by QA Agent_
