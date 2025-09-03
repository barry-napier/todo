# Coding Standards

## TypeScript Guidelines

### Type Safety

```typescript
// ALWAYS use explicit types for function parameters and returns
function addTodo(text: string): Todo {
  // implementation
}

// NEVER use 'any' type
// ❌ Bad
function processTodo(data: any) {}

// ✅ Good
function processTodo(data: Todo) {}
```

### Interface Conventions

```typescript
// Use interfaces for objects
interface TodoProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

// Use type for unions and primitives
type TodoStatus = 'pending' | 'completed' | 'archived';
type TodoId = string;
```

### Null Safety

```typescript
// Use optional chaining and nullish coalescing
const todoText = todo?.text ?? 'No description';

// Explicit null checks
if (todo !== null && todo !== undefined) {
  // process todo
}
```

## React Component Standards

### Component Structure

```typescript
// 1. Imports
import React, { useState, useCallback } from 'react';
import { Todo } from '@/types/todo';

// 2. Types/Interfaces
interface TodoItemProps {
  todo: Todo;
  onUpdate: (todo: Todo) => void;
}

// 3. Component
export function TodoItem({ todo, onUpdate }: TodoItemProps) {
  // 4. State
  const [isEditing, setIsEditing] = useState(false);

  // 5. Callbacks/Handlers
  const handleToggle = useCallback(() => {
    onUpdate({ ...todo, completed: !todo.completed });
  }, [todo, onUpdate]);

  // 6. Effects
  // useEffect hooks here

  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Naming Conventions

- Components: PascalCase (`TodoItem`, `AddTodoForm`)
- Hooks: camelCase with 'use' prefix (`useTodos`, `useLocalStorage`)
- Event handlers: 'handle' prefix (`handleSubmit`, `handleDelete`)
- Boolean props: 'is/has' prefix (`isCompleted`, `hasError`)

### Props Conventions

```typescript
// Destructure props in function signature
function TodoItem({ todo, onToggle }: TodoItemProps) {}

// Use explicit children type when needed
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}
```

## File Organization

### Directory Structure

```
src/
  app/                 # Next.js app router pages
    layout.tsx
    page.tsx
  components/          # React components
    todo/             # Feature-specific components
      TodoItem.tsx
      TodoList.tsx
    ui/               # shadcn/ui components
      button.tsx
      input.tsx
  lib/                # Utilities and services
    storage/          # Data persistence
      localStorage.ts
    utils/            # Helper functions
      cn.ts
  types/              # TypeScript types
    todo.ts
  styles/             # Global styles
    globals.css
```

### File Naming

- Components: PascalCase.tsx (`TodoItem.tsx`)
- Utilities: camelCase.ts (`localStorage.ts`)
- Types: camelCase.ts (`todo.ts`)
- Tests: component.test.tsx (`TodoItem.test.tsx`)

## State Management

### Local State

```typescript
// Use useState for component-specific state
const [todos, setTodos] = useState<Todo[]>([]);

// Use useReducer for complex state logic
const [state, dispatch] = useReducer(todoReducer, initialState);
```

### State Updates

```typescript
// Always create new objects/arrays
// ❌ Bad - mutating state
todos.push(newTodo);
setTodos(todos);

// ✅ Good - immutable update
setTodos([...todos, newTodo]);

// For objects
setTodo({ ...todo, completed: true });
```

## Error Handling

### Try-Catch Patterns

```typescript
async function saveTodos(todos: Todo[]): Promise<void> {
  try {
    await localStorage.setItem('todos', JSON.stringify(todos));
  } catch (error) {
    console.error('Failed to save todos:', error);
    // Show user-friendly error
    throw new Error('Unable to save your changes. Please try again.');
  }
}
```

### Error Boundaries

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Performance Guidelines

### Memoization

```typescript
// Memoize expensive computations
const completedCount = useMemo(() => todos.filter((t) => t.completed).length, [todos]);

// Memoize callbacks passed to children
const handleToggle = useCallback((id: string) => {
  // toggle logic
}, []);

// Memoize components when needed
const TodoItem = React.memo(({ todo }: Props) => {
  // component
});
```

### Lazy Loading

```typescript
// Lazy load heavy components
const Analytics = lazy(() => import('./Analytics'));

// Code splitting for routes
const Settings = lazy(() => import('./routes/Settings'));
```

## Testing Standards

### Test Structure

```typescript
describe('TodoItem', () => {
  it('should render todo text', () => {
    const todo = { id: '1', text: 'Test todo', completed: false };
    render(<TodoItem todo={todo} />);
    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  it('should call onToggle when checkbox clicked', () => {
    const onToggle = vi.fn();
    // test implementation
  });
});
```

### Test Naming

- Describe what is being tested
- Use 'should' for expected behavior
- Be specific about conditions

## Accessibility Standards

### ARIA Attributes

```typescript
<button
  aria-label="Delete todo"
  aria-describedby="delete-help"
  onClick={handleDelete}
>
  <TrashIcon aria-hidden="true" />
</button>
```

### Semantic HTML

```typescript
// Use semantic elements
<main>
  <header>
    <h1>Todo List</h1>
  </header>
  <section aria-label="Todo items">
    <ul role="list">
      {/* todos */}
    </ul>
  </section>
</main>
```

### Keyboard Navigation

```typescript
// Ensure all interactive elements are keyboard accessible
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction();
    }
  }}
>
```

## Git Conventions

### Commit Messages

```
feat: add todo completion animation
fix: resolve localStorage quota error
refactor: extract todo service logic
docs: update API documentation
test: add TodoList component tests
style: format code with prettier
chore: update dependencies
```

### Branch Naming

```
feature/add-todo-filters
bugfix/fix-delete-animation
refactor/optimize-state-management
hotfix/critical-storage-bug
```

## Code Review Checklist

- [ ] TypeScript types are explicit and accurate
- [ ] No 'any' types used
- [ ] Components follow naming conventions
- [ ] Error handling is implemented
- [ ] Tests are included for new features
- [ ] Accessibility requirements met
- [ ] Performance optimizations considered
- [ ] Code is properly formatted
- [ ] Comments explain complex logic
- [ ] No console.log statements in production code
