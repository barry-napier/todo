# Story 2.2: Todo List Display

## Status
Draft

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
- [ ] Create TodoList component (AC: 1, 2, 5)
  - [ ] Create `/src/components/todo/TodoList.tsx`
  - [ ] Implement todo mapping logic
  - [ ] Sort todos by createdAt (newest first)
  - [ ] Add empty state component
- [ ] Create TodoItem component (AC: 2, 3)
  - [ ] Create `/src/components/todo/TodoItem.tsx`
  - [ ] Display todo text with proper styling
  - [ ] Apply strikethrough for completed todos
  - [ ] Add hover states for interactive elements
- [ ] Implement todo count indicator (AC: 6)
  - [ ] Show total todo count
  - [ ] Show completed vs active count
  - [ ] Position above or below list
- [ ] Add animations (AC: 4)
  - [ ] Implement fade-in for new todos
  - [ ] Add slide-out for deleted todos
  - [ ] Use CSS transitions for smooth effects
  - [ ] Consider framer-motion if needed
- [ ] Create empty state (AC: 5)
  - [ ] Design friendly empty message
  - [ ] Add illustration or icon
  - [ ] Include call-to-action to add first todo
- [ ] Connect to todo state (AC: 1)
  - [ ] Use useTodos hook from Story 2.1
  - [ ] Load todos from localStorage on mount
  - [ ] Handle loading and error states
- [ ] Style components (AC: 2, 3)
  - [ ] Use Card component from shadcn/ui
  - [ ] Apply consistent spacing
  - [ ] Ensure responsive layout
- [ ] Write unit tests (AC: 1-6)
  - [ ] Test TodoList renders todos correctly
  - [ ] Test sorting by date
  - [ ] Test empty state display
  - [ ] Test completed todo styling
  - [ ] Test todo count accuracy

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
todos.sort((a, b) => 
  new Date(b.createdAt).getTime() - 
  new Date(a.createdAt).getTime()
)
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