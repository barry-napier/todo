# Story 3.3: Error Handling & Recovery

**Epic:** Epic 3 - User Experience Polish  
**Status:** 📝 Draft  
**Estimate:** 1.5 hours  
**Assignee:** Developer  

## Story
**As a** user  
**I want** the app to handle errors gracefully  
**So that** I don't lose data or get stuck

## Acceptance Criteria
- [ ] localStorage quota exceeded handling
- [ ] Network error recovery for future sync
- [ ] Invalid data format migration
- [ ] Graceful degradation if JS disabled
- [ ] Error boundary with recovery UI
- [ ] User-friendly error messages

## Technical Implementation

### Error State Management
```typescript
// Based on Epic 3 technical notes
interface ErrorState {
  type: 'storage' | 'network' | 'validation' | 'unknown';
  message: string;
  recoverable: boolean;
  retryAction?: () => void;
}

function useErrorHandling() {
  const [error, setError] = useState<ErrorState | null>(null);
  
  const handleError = useCallback((error: Error, context: string) => {
    console.error(`Error in ${context}:`, error);
    
    if (error.name === 'QuotaExceededError') {
      setError({
        type: 'storage',
        message: 'Storage is full. Please delete some items.',
        recoverable: true,
        retryAction: () => clearOldData()
      });
    }
  }, []);
  
  return { error, handleError, clearError: () => setError(null) };
}
```

### localStorage Quota Handling
```typescript
function saveToStorage(key: string, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      resolve();
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // Attempt cleanup and retry
        cleanupOldData();
        try {
          localStorage.setItem(key, JSON.stringify(data));
          resolve();
        } catch (retryError) {
          reject(new StorageError('Storage quota exceeded. Please free up space.'));
        }
      } else {
        reject(error);
      }
    }
  });
}

function cleanupOldData() {
  // Remove completed todos older than 30 days
  const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const todos = getTodos();
  const filtered = todos.filter(todo => 
    !todo.completed || new Date(todo.createdAt).getTime() > cutoff
  );
  localStorage.setItem('todos', JSON.stringify(filtered));
}
```

### Error Boundary Component
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class TodoErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Todo app error boundary caught an error:', error, errorInfo);
    
    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      reportError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          resetError={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}
```

### Network Error Recovery
```typescript
// Following API design from /workspaces/todo/docs/architecture/api-design.md
async function syncWithServer(todos: Todo[]): Promise<void> {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const response = await fetch('/api/todos/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todos })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return; // Success
    } catch (error) {
      retryCount++;
      
      if (retryCount >= maxRetries) {
        // Store for later sync
        localStorage.setItem('pendingSync', JSON.stringify(todos));
        throw new NetworkError('Unable to sync. Changes saved locally.');
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
      );
    }
  }
}
```

## Implementation Checklist

### Storage Error Handling
- [ ] Implement QuotaExceededError detection
- [ ] Create data cleanup strategies
- [ ] Implement graceful storage fallbacks
- [ ] Add storage usage monitoring
- [ ] Create data export functionality

### Network Error Recovery
- [ ] Implement retry logic with exponential backoff
- [ ] Store failed requests for later retry
- [ ] Show offline/online status
- [ ] Queue operations when offline
- [ ] Detect network connectivity changes

### Data Validation & Migration
- [ ] Validate localStorage data on load
- [ ] Handle corrupted data gracefully
- [ ] Implement data schema versioning
- [ ] Create migration utilities
- [ ] Provide data recovery options

### Error UI Components
- [ ] Error boundary with user-friendly messages
- [ ] Retry buttons for recoverable errors
- [ ] Error toast notifications
- [ ] Offline mode indicators
- [ ] Data export/import tools

## Dev Notes

### Error Types from Architecture
Based on API design documentation at `/workspaces/todo/docs/architecture/api-design.md`:

```typescript
// Error codes from API documentation
const ERROR_CODES = {
  VALIDATION_ERROR: 'Input validation failed',
  NOT_FOUND: 'Resource not found', 
  QUOTA_EXCEEDED: 'Storage quota exceeded',
  INTERNAL_ERROR: 'Unexpected server error',
  RATE_LIMIT: 'Too many requests'
} as const;
```

### Error Handler Following Coding Standards
From `/workspaces/todo/docs/architecture/coding-standards.md`:

```typescript
// Proper error handling pattern
async function saveTodos(todos: Todo[]): Promise<void> {
  try {
    await saveToStorage('todos', todos);
  } catch (error) {
    console.error('Failed to save todos:', error);
    // Show user-friendly error
    throw new Error('Unable to save your changes. Please try again.');
  }
}
```

### Progressive Enhancement
```typescript
// Graceful degradation for no-JS scenarios
function NoScriptFallback() {
  return (
    <noscript>
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <p className="font-medium">JavaScript Required</p>
        <p>This todo app requires JavaScript to function properly.</p>
        <p>Please enable JavaScript in your browser settings.</p>
      </div>
    </noscript>
  );
}
```

## Testing Requirements

### Error Scenario Testing
```typescript
describe('Error Handling', () => {
  it('should handle storage quota exceeded', async () => {
    // Mock localStorage to throw QuotaExceededError
    const mockSetItem = vi.spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });
    
    const result = await saveTodos([mockTodo]);
    
    expect(mockSetItem).toHaveBeenCalled();
    expect(screen.getByText(/storage is full/i)).toBeInTheDocument();
  });
  
  it('should recover from network errors', async () => {
    // Mock fetch to fail initially then succeed
    global.fetch = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    
    await syncWithServer([mockTodo]);
    
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
```

### Manual Error Testing
- [ ] Fill localStorage to quota and test behavior
- [ ] Test with corrupted localStorage data
- [ ] Simulate network failures during sync
- [ ] Test with JavaScript disabled
- [ ] Force component errors to test error boundary

## Error Recovery Strategies

### Data Recovery Options
1. **Local Backup**: Export todos as JSON file
2. **Browser Storage**: Check for data in different origins
3. **Server Sync**: Restore from last successful backup
4. **Manual Import**: Allow users to import previously exported data

### User Communication
```typescript
const ERROR_MESSAGES = {
  storage: {
    title: 'Storage Issue',
    message: 'Your browser storage is full. We\'ve cleaned up old completed tasks.',
    action: 'Continue'
  },
  network: {
    title: 'Connection Issue', 
    message: 'Changes saved locally. We\'ll sync when you\'re back online.',
    action: 'Retry Now'
  },
  validation: {
    title: 'Invalid Data',
    message: 'Some data was corrupted and has been reset.',
    action: 'OK'
  }
};
```

## Dependencies
- Custom error classes (StorageError, NetworkError, ValidationError)
- React Error Boundary implementation
- Browser storage event listeners
- Network connectivity detection APIs

## Success Criteria
- [ ] App never crashes due to unhandled errors
- [ ] Users receive clear, actionable error messages
- [ ] Data loss is prevented in all error scenarios
- [ ] App recovers automatically when possible
- [ ] Error states are accessible and well-designed

## Technical Debt & Future Enhancements
- Implement error reporting/monitoring service
- Add more sophisticated data cleanup strategies
- Create automated error recovery scenarios
- Implement offline queue with smart sync

## Change Log
| Date | Change | Author |
|------|--------|--------|
| TBD | Initial story creation | Developer |

## Related Stories
- Story 3.5: Performance Optimizations
- Story 3.6: Progressive Web App Features
- Story 2.2: Data Persistence & Storage

## References
- [Error Handling Best Practices](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Network Error Recovery Patterns](https://web.dev/reliable/)