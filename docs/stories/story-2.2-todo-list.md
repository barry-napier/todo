# Story 2.2: Todo List Display

## Status

Ready for Review

## Story

**As a** user,
**I want** to see all my todos in a clear list,
**so that** I can understand my tasks at a glance

## Acceptance Criteria

1. Todos displayed in chronological order (newest first)
2. Clear visual distinction between todo text and actions
3. Completed todos show strikethrough styling
4. Smooth animations for add/remove operations
5. Empty state message when no todos exist
6. Todo count indicator

## Tasks / Subtasks

- [x] Create TodoList component (AC: 1, 2, 5)
  - [x] Create `/src/components/todo/TodoList.tsx`
  - [x] Implement todo mapping logic
  - [x] Sort todos by createdAt (newest first)
  - [x] Add empty state component
- [x] Create TodoItem component (AC: 2, 3)
  - [x] Create `/src/components/todo/TodoItem.tsx`
  - [x] Display todo text with proper styling
  - [x] Apply strikethrough for completed todos
  - [x] Add hover states for interactive elements
- [x] Implement todo count indicator (AC: 6)
  - [x] Show total todo count
  - [x] Show completed vs active count
  - [x] Position above or below list
- [x] Add animations (AC: 4)
  - [x] Implement fade-in for new todos
  - [x] Add slide-out for deleted todos
  - [x] Use CSS transitions for smooth effects
  - [x] Consider framer-motion if needed
- [x] Create empty state (AC: 5)
  - [x] Design friendly empty message
  - [x] Add illustration or icon
  - [x] Include call-to-action to add first todo
- [x] Connect to todo state (AC: 1)
  - [x] Use useTodos hook from Story 2.1
  - [x] Load todos from localStorage on mount
  - [x] Handle loading and error states
- [x] Style components (AC: 2, 3)
  - [x] Use Card component from shadcn/ui
  - [x] Apply consistent spacing
  - [x] Ensure responsive layout
- [x] Write unit tests (AC: 1-6)
  - [x] Test TodoList renders todos correctly
  - [x] Test sorting by date
  - [x] Test empty state display
  - [x] Test completed todo styling
  - [x] Test todo count accuracy

## Dev Notes

### Previous Story Context

- Story 2.1 created AddTodo component and useTodos hook
- localStorage service available from Story 1.3
- Layout components from Story 1.4

### Component Structure

[Source: architecture/source-tree.md]

Create components:

- `/src/components/todo/TodoList.tsx` - List container
- `/src/components/todo/TodoItem.tsx` - Individual todo

### TodoItem Component

[Source: architecture/coding-standards.md]

```typescript
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}
```

### Styling Guidelines

[Source: architecture/coding-standards.md]

Use Tailwind classes:

- Completed: `line-through opacity-60`
- Hover: `hover:bg-gray-50`
- Card spacing: `p-4 space-y-2`

### Empty State

Display when `todos.length === 0`:

- Friendly message: "No todos yet!"
- Subtext: "Add your first task above"
- Optional icon/illustration

### Todo Sorting

[Source: architecture/data-models.md]

Sort by createdAt descending:

```typescript
todos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
```

### Animation Approach

Use CSS transitions for performance:

```css
.todo-item {
  transition: all 0.2s ease;
}
```

### Technical Constraints

[Source: architecture/tech-stack.md]

- React 18.3.1 features available
- Use React.memo for performance
- TypeScript strict mode

### Testing

[Source: architecture/coding-standards.md]

**Test Requirements:**

- Test files: `/tests/unit/components/todo/TodoList.test.tsx`
- Mock todo data for testing
- Test component integration
- Verify accessibility

## Change Log

| Date       | Version | Description            | Author       |
| ---------- | ------- | ---------------------- | ------------ |
| 2025-09-02 | 1.0     | Initial story creation | Scrum Master |
| 2025-09-03 | 1.1     | Story completed        | Dev Agent    |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.1 (claude-opus-4-1-20250805)

### Debug Log References

- Enhanced TodoList component with sorting by createdAt (newest first)
- Added improved empty state with CheckCircle icon from lucide-react
- Implemented todo count indicator with active/completed counts
- Added CSS animations (fade-in, slide-out) for smooth transitions
- Fixed test failure with cancel button preventing onBlur save

### Completion Notes List

1. Successfully implemented chronological sorting (newest first) using useMemo for performance
2. Enhanced empty state with icon and friendly messaging
3. Added comprehensive todo count indicator showing total, active, and completed counts
4. Implemented smooth animations using CSS keyframes and transitions
5. Fixed edit mode cancel button to properly prevent onBlur save event
6. All unit tests passing (104 tests total, 12 test files)

### File List

**Modified Files:**

- `/src/components/todo/TodoList.tsx` - Enhanced with sorting, counts, and better empty state
- `/src/components/todo/TodoItem.tsx` - Added slide-out animation for deletion
- `/src/app/page.tsx` - Removed duplicate todo count (now in TodoList)
- `/src/app/globals.css` - Added CSS animations (fade-in, slide-out)
- `/tests/unit/components/todo/TodoList.test.tsx` - Updated comprehensive tests

**Created Files:**

- `/tests/unit/components/todo/TodoItem.test.tsx` - Complete test coverage for TodoItem

## QA Results

_To be filled by QA Agent_
