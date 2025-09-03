# Data Models

## Core Models

### Todo Model

**Purpose:** Core entity representing individual todo items with completion tracking and metadata

**Key Attributes:**

- id: string (UUID) - Unique identifier for persistence and React keys
- text: string - The todo content, max 500 characters
- completed: boolean - Completion status for UI state and filtering
- createdAt: Date - Creation timestamp for sorting and analytics
- updatedAt: Date - Last modification timestamp for sync conflict resolution

#### TypeScript Interfaces

```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TodoCreateInput {
  text: string;
}

interface TodoUpdateInput {
  text?: string;
  completed?: boolean;
}

interface TodoFilters {
  status?: 'all' | 'active' | 'completed';
  searchTerm?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'text';
  sortOrder?: 'asc' | 'desc';
}
```

#### Storage Format

```json
{
  "todos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "Complete project documentation",
      "completed": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "version": "1.0.0",
  "lastSync": "2024-01-15T10:30:00.000Z"
}
```

### Application State Model

```typescript
interface AppState {
  todos: Todo[];
  filters: TodoFilters;
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
}

interface StorageState {
  todos: Todo[];
  version: string;
  lastSync: Date;
}
```

## Data Validation

### Input Validation Rules

```typescript
const TodoValidation = {
  text: {
    required: true,
    minLength: 1,
    maxLength: 500,
    pattern: /^[^\n\r]*$/, // No line breaks
    transform: (value: string) => value.trim(),
  },
  id: {
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  },
};

function validateTodoInput(input: TodoCreateInput): ValidationResult {
  const errors: string[] = [];

  if (!input.text || input.text.trim().length === 0) {
    errors.push('Todo text is required');
  }

  if (input.text && input.text.length > 500) {
    errors.push('Todo text must be less than 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

### Sanitization

```typescript
function sanitizeTodoText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[<>]/g, '') // Remove potential HTML
    .slice(0, 500); // Enforce max length
}
```

## Data Operations

### CRUD Operations

```typescript
class TodoService {
  // Create
  async createTodo(input: TodoCreateInput): Promise<Todo> {
    const todo: Todo = {
      id: generateUUID(),
      text: sanitizeTodoText(input.text),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.storage.add(todo);
  }

  // Read
  async getTodos(filters?: TodoFilters): Promise<Todo[]> {
    let todos = await this.storage.getAll();

    if (filters?.status) {
      todos = this.filterByStatus(todos, filters.status);
    }

    if (filters?.searchTerm) {
      todos = this.searchTodos(todos, filters.searchTerm);
    }

    return this.sortTodos(todos, filters?.sortBy, filters?.sortOrder);
  }

  // Update
  async updateTodo(id: string, input: TodoUpdateInput): Promise<Todo> {
    const todo = await this.storage.get(id);

    const updated: Todo = {
      ...todo,
      ...input,
      text: input.text ? sanitizeTodoText(input.text) : todo.text,
      updatedAt: new Date(),
    };

    return this.storage.update(id, updated);
  }

  // Delete
  async deleteTodo(id: string): Promise<void> {
    return this.storage.delete(id);
  }
}
```

### Data Transformation

```typescript
// Transform for API response
function toApiResponse(todo: Todo): ApiTodoResponse {
  return {
    id: todo.id,
    text: todo.text,
    completed: todo.completed,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}

// Transform from storage
function fromStorage(data: string): Todo[] {
  try {
    const parsed = JSON.parse(data);
    return parsed.todos.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }));
  } catch (error) {
    console.error('Failed to parse storage data:', error);
    return [];
  }
}
```

## Data Persistence

### localStorage Strategy

```typescript
class LocalStorageService {
  private readonly STORAGE_KEY = 'todos';
  private readonly STORAGE_VERSION = '1.0.0';

  save(todos: Todo[]): void {
    const data: StorageState = {
      todos,
      version: this.STORAGE_VERSION,
      lastSync: new Date(),
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded();
      }
      throw error;
    }
  }

  load(): Todo[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);

    // Handle version migration
    if (parsed.version !== this.STORAGE_VERSION) {
      return this.migrate(parsed);
    }

    return parsed.todos;
  }

  private migrate(data: any): Todo[] {
    // Migration logic for future schema changes
    console.log('Migrating data from version', data.version);
    return data.todos || [];
  }
}
```

### Backup Strategy

```typescript
class BackupService {
  async backup(todos: Todo[]): Promise<void> {
    const response = await fetch('/api/todos/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todos }),
    });

    if (!response.ok) {
      throw new Error('Backup failed');
    }
  }

  async restore(): Promise<Todo[]> {
    const response = await fetch('/api/todos/backup');

    if (!response.ok) {
      throw new Error('Restore failed');
    }

    const data = await response.json();
    return data.todos;
  }
}
```

## Data Constraints

### Business Rules

- Todo text cannot be empty
- Todo text maximum 500 characters
- Completed todos remain in the list
- Todos are sorted by creation date (newest first) by default
- Duplicate todo text is allowed
- Todo IDs must be unique

### Storage Limits

- localStorage: ~5-10MB depending on browser
- Maximum todos: ~10,000 items (estimated)
- Automatic cleanup of todos older than 1 year (future feature)

### Performance Considerations

- Batch operations when possible
- Debounce search operations
- Virtualize list for > 100 items
- Cache filtered results
- Use indexes for large datasets (future)

## Data Migration

### Schema Versioning

```typescript
const SCHEMA_VERSIONS = {
  '1.0.0': {
    fields: ['id', 'text', 'completed', 'createdAt', 'updatedAt'],
  },
  // Future versions
  '1.1.0': {
    fields: ['id', 'text', 'completed', 'createdAt', 'updatedAt', 'tags'],
    migrate: (data: any) => ({
      ...data,
      tags: [],
    }),
  },
};
```

### Migration Strategy

1. Check stored version on load
2. Apply migrations sequentially if needed
3. Update version after successful migration
4. Backup original data before migration
5. Provide rollback mechanism
