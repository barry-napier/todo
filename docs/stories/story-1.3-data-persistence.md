# Story 1.3: Data Persistence Layer

## Status

Ready for Review

## Story

**As a** user,
**I want** my todos to persist between sessions,
**so that** I don't lose my task list when I close the browser

## Acceptance Criteria

1. localStorage service created with TypeScript interfaces
2. Todo data model defined (id, text, completed, createdAt, updatedAt)
3. Save/load/update functions implemented
4. Error handling for storage quota and availability

## Tasks / Subtasks

- [x] Create Todo TypeScript interfaces (AC: 2)
  - [x] Define Todo interface with all required fields in `/src/types/todo.ts`
  - [x] Define TodoCreateInput interface for new todo input
  - [x] Define TodoUpdateInput interface for updates
  - [x] Define TodoFilters interface for filtering
  - [x] Define StorageState interface for localStorage format
- [x] Implement localStorage service (AC: 1, 3)
  - [x] Create `/src/lib/storage/localStorage.ts` with LocalStorageService class
  - [x] Implement save() method with JSON serialization
  - [x] Implement load() method with JSON deserialization
  - [x] Implement clear() method for resetting storage
  - [x] Add version management for future migrations
  - [x] Handle date conversions (string to Date objects)
- [x] Create storage service wrapper (AC: 3)
  - [x] Create `/src/lib/storage/storageService.ts` with TodoService class
  - [x] Implement createTodo() with UUID generation
  - [x] Implement getTodos() with optional filtering
  - [x] Implement updateTodo() with timestamp updates
  - [x] Implement deleteTodo() for removal
  - [x] Add input sanitization and validation
- [x] Implement error handling (AC: 4)
  - [x] Handle QuotaExceededError for storage limits
  - [x] Add fallback to in-memory storage if localStorage unavailable
  - [x] Create user-friendly error messages
  - [x] Log errors appropriately
- [x] Create storage types file (AC: 1, 2)
  - [x] Create `/src/lib/storage/types.ts` exporting all storage-related types
  - [x] Add validation result interfaces
  - [x] Add storage error types
- [x] Create validation utilities (AC: 3)
  - [x] Create `/src/lib/utils/validation.ts` with todo validation functions
  - [x] Implement validateTodoInput() with all validation rules
  - [x] Implement sanitizeTodoText() for input sanitization
- [x] Add UUID utility (AC: 2)
  - [x] Install uuid package: `npm install uuid`
  - [x] Install @types/uuid: `npm install -D @types/uuid`
  - [x] Create wrapper function for UUID generation
- [x] Write unit tests (AC: 1, 2, 3, 4)
  - [x] Test LocalStorageService save/load/clear methods
  - [x] Test TodoService CRUD operations
  - [x] Test error handling scenarios
  - [x] Test validation and sanitization
  - [x] Test storage quota exceeded handling

## Dev Notes

### Previous Story Insights

Stories 1.1 and 1.2 have set up the Next.js project with TypeScript and integrated shadcn/ui components. The project structure and base configuration are in place.

### Data Models

[Source: architecture/data-models.md]

**Todo Model Structure:**

```typescript
interface Todo {
  id: string; // UUID format
  text: string; // Max 500 characters
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Storage Format:**

```json
{
  "todos": [...],
  "version": "1.0.0",
  "lastSync": "2024-01-15T10:30:00.000Z"
}
```

**Validation Rules:**

- Todo text required, min 1 char, max 500 chars
- No line breaks allowed in text
- Text should be trimmed
- UUID must follow standard format

### File Locations

[Source: architecture/source-tree.md]

Create these files:

- `/src/types/todo.ts` - Todo interfaces
- `/src/lib/storage/localStorage.ts` - LocalStorage service
- `/src/lib/storage/storageService.ts` - Todo service wrapper
- `/src/lib/storage/types.ts` - Storage-related types
- `/src/lib/utils/validation.ts` - Input validation utilities

### Implementation Details

[Source: architecture/data-models.md]

**LocalStorageService Class:**

- Storage key: 'todos'
- Storage version: '1.0.0'
- Must handle QuotaExceededError
- Include migration logic placeholder for future schema changes

**TodoService Class:**

- Use uuid package for ID generation
- Implement CRUD operations as shown in data-models.md
- Apply sanitization on all text inputs
- Update timestamps appropriately

### Technical Constraints

[Source: architecture/tech-stack.md]

- TypeScript 5.3.3 with strict mode
- Use uuid ^9.0.1 for ID generation
- No external state management libraries (use React built-in)

### Testing

[Source: architecture/coding-standards.md]

**Testing Requirements:**

- Use Vitest for unit tests
- Test files named: `*.test.ts`
- Place tests in `/tests/unit/lib/storage/`
- Follow AAA pattern (Arrange, Act, Assert)
- Mock localStorage for testing
- Test both success and error paths

**Test Coverage Required:**

- All CRUD operations
- Error handling (quota exceeded, localStorage unavailable)
- Validation and sanitization
- Date serialization/deserialization
- Version migration logic

## Change Log

| Date       | Version | Description            | Author       |
| ---------- | ------- | ---------------------- | ------------ |
| 2025-09-02 | 1.0     | Initial story creation | Scrum Master |

## Dev Agent Record

### Agent Model Used

claude-opus-4-1-20250805 (BMad Dev Agent)

### Debug Log References

- Tests passed: 46/46
- All validation and error handling implemented
- localStorage with in-memory fallback working correctly

### Completion Notes List

- ✅ All TypeScript interfaces created as specified
- ✅ LocalStorage service with version management implemented
- ✅ TodoService with full CRUD operations
- ✅ Validation and sanitization utilities created
- ✅ Error handling with user-friendly messages
- ✅ In-memory fallback for localStorage unavailable
- ✅ UUID package integrated (v11.1.0)
- ✅ Comprehensive unit tests written and passing

### File List

**Created:**

- `/src/lib/storage/localStorage.ts` - LocalStorage service implementation
- `/src/lib/storage/storageService.ts` - Todo service with CRUD operations
- `/src/lib/storage/types.ts` - Storage-related TypeScript types
- `/src/lib/utils/validation.ts` - Input validation and sanitization
- `/tests/unit/lib/storage/localStorage.test.ts` - LocalStorage service tests
- `/tests/unit/lib/storage/storageService.test.ts` - TodoService tests
- `/tests/unit/lib/utils/validation.test.ts` - Validation utility tests
- `/tests/setup.ts` - Test setup configuration
- `/vitest.config.ts` - Vitest configuration

**Modified:**

- `/src/types/todo.ts` - Added TodoCreateInput, TodoUpdateInput, TodoFilters, StorageState
- `/package.json` - Added uuid, @types/uuid, vitest, and test scripts

## QA Results

_To be filled by QA Agent_
