# Story 1.3: Data Persistence Layer

## Status
Draft

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
- [ ] Create Todo TypeScript interfaces (AC: 2)
  - [ ] Define Todo interface with all required fields in `/src/types/todo.ts`
  - [ ] Define TodoCreateInput interface for new todo input
  - [ ] Define TodoUpdateInput interface for updates
  - [ ] Define TodoFilters interface for filtering
  - [ ] Define StorageState interface for localStorage format
- [ ] Implement localStorage service (AC: 1, 3)
  - [ ] Create `/src/lib/storage/localStorage.ts` with LocalStorageService class
  - [ ] Implement save() method with JSON serialization
  - [ ] Implement load() method with JSON deserialization
  - [ ] Implement clear() method for resetting storage
  - [ ] Add version management for future migrations
  - [ ] Handle date conversions (string to Date objects)
- [ ] Create storage service wrapper (AC: 3)
  - [ ] Create `/src/lib/storage/storageService.ts` with TodoService class
  - [ ] Implement createTodo() with UUID generation
  - [ ] Implement getTodos() with optional filtering
  - [ ] Implement updateTodo() with timestamp updates
  - [ ] Implement deleteTodo() for removal
  - [ ] Add input sanitization and validation
- [ ] Implement error handling (AC: 4)
  - [ ] Handle QuotaExceededError for storage limits
  - [ ] Add fallback to in-memory storage if localStorage unavailable
  - [ ] Create user-friendly error messages
  - [ ] Log errors appropriately
- [ ] Create storage types file (AC: 1, 2)
  - [ ] Create `/src/lib/storage/types.ts` exporting all storage-related types
  - [ ] Add validation result interfaces
  - [ ] Add storage error types
- [ ] Create validation utilities (AC: 3)
  - [ ] Create `/src/lib/utils/validation.ts` with todo validation functions
  - [ ] Implement validateTodoInput() with all validation rules
  - [ ] Implement sanitizeTodoText() for input sanitization
- [ ] Add UUID utility (AC: 2)
  - [ ] Install uuid package: `npm install uuid`
  - [ ] Install @types/uuid: `npm install -D @types/uuid`
  - [ ] Create wrapper function for UUID generation
- [ ] Write unit tests (AC: 1, 2, 3, 4)
  - [ ] Test LocalStorageService save/load/clear methods
  - [ ] Test TodoService CRUD operations
  - [ ] Test error handling scenarios
  - [ ] Test validation and sanitization
  - [ ] Test storage quota exceeded handling

## Dev Notes

### Previous Story Insights
Stories 1.1 and 1.2 have set up the Next.js project with TypeScript and integrated shadcn/ui components. The project structure and base configuration are in place.

### Data Models
[Source: architecture/data-models.md]

**Todo Model Structure:**
```typescript
interface Todo {
  id: string;        // UUID format
  text: string;      // Max 500 characters
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