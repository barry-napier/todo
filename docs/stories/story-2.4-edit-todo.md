# Story 2.4: Edit Todo Text

## Status

Draft

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

- [ ] Add edit mode to TodoItem (AC: 1, 3)
  - [ ] Add isEditing state to TodoItem component
  - [ ] Toggle edit mode on text click
  - [ ] Replace text with Input component when editing
  - [ ] Match input size to text display
- [ ] Create edit trigger button (AC: 2)
  - [ ] Add edit icon button to TodoItem
  - [ ] Show on hover or always on mobile
  - [ ] Use Pencil icon from lucide-react
  - [ ] Proper ARIA label for accessibility
- [ ] Implement edit handlers (AC: 4, 5)
  - [ ] Handle Enter key to save
  - [ ] Handle Escape key to cancel
  - [ ] Save on blur (click outside)
  - [ ] Restore original text on cancel
- [ ] Add validation (AC: 6)
  - [ ] Prevent saving empty text
  - [ ] Trim whitespace before validation
  - [ ] Show error state if invalid
  - [ ] Max length check (500 chars)
- [ ] Update todo service (AC: 4, 5)
  - [ ] Add editTodo method to useTodos hook
  - [ ] Update text and updatedAt fields
  - [ ] Save to localStorage
  - [ ] Handle optimistic updates
- [ ] Focus management (AC: 1, 3)
  - [ ] Auto-focus input when entering edit mode
  - [ ] Select all text on focus
  - [ ] Return focus after save/cancel
- [ ] Style edit mode (AC: 3)
  - [ ] Seamless transition to input
  - [ ] Highlight editing todo
  - [ ] Consistent padding and font size
- [ ] Write unit tests (AC: 1-6)
  - [ ] Test entering/exiting edit mode
  - [ ] Test save and cancel operations
  - [ ] Test validation logic
  - [ ] Test keyboard interactions

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

_To be filled by Dev Agent_

### Debug Log References

_To be filled by Dev Agent_

### Completion Notes List

_To be filled by Dev Agent_

### File List

_To be filled by Dev Agent_

## QA Results

_To be filled by QA Agent_
