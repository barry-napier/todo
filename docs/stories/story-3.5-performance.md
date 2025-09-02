# Story 3.5: Performance Optimizations

**Epic:** Epic 3 - User Experience Polish  
**Status:** 📝 Draft  
**Estimate:** 2 hours  
**Assignee:** Developer  

## Story
**As a** user  
**I want** instant response to all actions  
**So that** the app feels native and fast

## Acceptance Criteria
- [ ] Code splitting for optimal bundle size
- [ ] Image optimization (if any icons/images)
- [ ] Service worker for offline support
- [ ] Lazy loading for future features
- [ ] Debounced search/filter operations
- [ ] Memoized expensive computations

## Technical Implementation

### Performance Targets (from Epic 3)
```typescript
const PERFORMANCE_TARGETS = {
  firstContentfulPaint: 1000,    // < 1s
  timeToInteractive: 2000,       // < 2s
  lighthouseScore: 95,           // > 95
  bundleSize: 200 * 1024,        // < 200KB gzipped
  animationFrameRate: 60         // 60fps
} as const;
```

### Code Splitting with Next.js
```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react';
import { TodoListSkeleton } from '@/components/ui/skeletons';

// Split analytics and settings into separate bundles
const Analytics = lazy(() => import('@/components/Analytics'));
const SettingsModal = lazy(() => import('@/components/SettingsModal'));

function App() {
  return (
    <main>
      <TodoList />
      
      {/* Lazy load non-critical features */}
      <Suspense fallback={<div>Loading analytics...</div>}>
        <Analytics />
      </Suspense>
      
      <Suspense fallback={null}>
        <SettingsModal />
      </Suspense>
    </main>
  );
}
```

### React Performance Optimizations
```typescript
// Memoize expensive computations
function TodoStats({ todos }: { todos: Todo[] }) {
  const stats = useMemo(() => ({
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    completionRate: todos.length > 0 ? 
      Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0
  }), [todos]);
  
  return <StatsDisplay stats={stats} />;
}

// Memoize callbacks to prevent unnecessary re-renders
function TodoList({ todos }: { todos: Todo[] }) {
  const handleToggle = useCallback((id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);
  
  const handleDelete = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);
  
  return (
    <ul>
      {todos.map(todo => (
        <MemoizedTodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}

// Memoize components to prevent unnecessary re-renders
const MemoizedTodoItem = React.memo(TodoItem, (prevProps, nextProps) => {
  return (
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.completed === nextProps.todo.completed &&
    prevProps.todo.text === nextProps.todo.text
  );
});
```

### Debounced Search Implementation
```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function TodoSearch({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search todos..."
      className="w-full px-3 py-2 border rounded-md"
    />
  );
}
```

### Virtual Scrolling for Large Lists
```typescript
// Using react-intersection-observer from Epic 3 dependencies
import { useInView } from 'react-intersection-observer';

function VirtualTodoList({ todos }: { todos: Todo[] }) {
  const ITEM_HEIGHT = 60;
  const BUFFER_SIZE = 5;
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  
  const { ref: topSentinel } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && visibleRange.start > 0) {
        setVisibleRange(prev => ({
          start: Math.max(0, prev.start - BUFFER_SIZE),
          end: prev.end
        }));
      }
    }
  });
  
  const { ref: bottomSentinel } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && visibleRange.end < todos.length) {
        setVisibleRange(prev => ({
          start: prev.start,
          end: Math.min(todos.length, prev.end + BUFFER_SIZE)
        }));
      }
    }
  });
  
  const visibleTodos = todos.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div className="h-96 overflow-auto">
      {visibleRange.start > 0 && (
        <div 
          ref={topSentinel}
          style={{ height: visibleRange.start * ITEM_HEIGHT }}
        />
      )}
      
      {visibleTodos.map((todo, index) => (
        <TodoItem 
          key={todo.id}
          todo={todo}
          style={{ height: ITEM_HEIGHT }}
        />
      ))}
      
      {visibleRange.end < todos.length && (
        <div 
          ref={bottomSentinel}
          style={{ height: (todos.length - visibleRange.end) * ITEM_HEIGHT }}
        />
      )}
    </div>
  );
}
```

### Bundle Size Optimization
```typescript
// Use dynamic imports for code splitting
const importAnalytics = () => import('@/lib/analytics');
const importExport = () => import('@/lib/export');

// Tree-shake unused utilities
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Create optimized utility function
export const cn = (...classes: (string | undefined)[]) => {
  return twMerge(clsx(...classes));
};

// Bundle analyzer configuration in next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
```

## Implementation Checklist

### Code Splitting & Bundle Optimization
- [ ] Implement route-based code splitting
- [ ] Split vendor libraries into separate chunks
- [ ] Lazy load non-critical components
- [ ] Tree-shake unused dependencies
- [ ] Analyze bundle size with webpack-bundle-analyzer

### React Performance
- [ ] Memoize expensive computations with useMemo
- [ ] Memoize callbacks with useCallback
- [ ] Implement React.memo for pure components
- [ ] Use proper dependency arrays in useEffect
- [ ] Avoid creating objects/functions in render

### Data Operations
- [ ] Debounce search/filter inputs (300ms)
- [ ] Implement virtual scrolling for large lists
- [ ] Batch localStorage operations
- [ ] Use pagination for large datasets
- [ ] Cache computed values

### Asset Optimization
- [ ] Optimize images with next/image
- [ ] Use SVG icons instead of icon fonts
- [ ] Implement critical CSS inlining
- [ ] Configure proper caching headers
- [ ] Compress static assets

## Dev Notes

### Next.js Performance Features
Based on `/workspaces/todo/docs/architecture/tech-stack.md`, Next.js 15.0.0 provides:

- Turbopack for faster bundling
- Automatic code splitting
- Server Components for reduced client bundle
- Built-in image optimization
- Automatic font optimization

### Performance Monitoring
```typescript
// Using web-vitals from Epic 3 dependencies
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    // Report to analytics service
    analytics.track('Web Vital', {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      url: window.location.pathname
    });
  }
}

// Measure all Core Web Vitals
getCLS(reportWebVitals);
getFID(reportWebVitals);
getFCP(reportWebVitals);
getLCP(reportWebVitals);
getTTFB(reportWebVitals);
```

### localStorage Performance
```typescript
// Batch localStorage operations
class StorageManager {
  private pendingWrites = new Map<string, any>();
  private writeTimer: NodeJS.Timeout | null = null;
  
  set(key: string, value: any) {
    this.pendingWrites.set(key, value);
    
    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
    }
    
    this.writeTimer = setTimeout(() => {
      this.flush();
    }, 100); // Batch writes every 100ms
  }
  
  private flush() {
    for (const [key, value] of this.pendingWrites) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to write ${key} to localStorage:`, error);
      }
    }
    
    this.pendingWrites.clear();
    this.writeTimer = null;
  }
}
```

### Memory Management
```typescript
// Proper cleanup in useEffect
function TodoList() {
  useEffect(() => {
    const controller = new AbortController();
    
    // Use AbortController for fetch requests
    fetch('/api/todos', { 
      signal: controller.signal 
    }).then(/* handle response */);
    
    return () => {
      controller.abort(); // Cancel pending requests
    };
  }, []);
  
  // Cleanup intervals and timeouts
  useEffect(() => {
    const interval = setInterval(syncTodos, 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
}
```

## Testing Requirements

### Performance Testing
```typescript
describe('Performance', () => {
  it('should render 1000 todos without performance issues', () => {
    const largeTodoList = Array.from({ length: 1000 }, (_, i) => ({
      id: `todo-${i}`,
      text: `Todo item ${i}`,
      completed: i % 3 === 0
    }));
    
    const startTime = performance.now();
    render(<TodoList todos={largeTodoList} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // < 100ms render time
  });
  
  it('should debounce search input', async () => {
    const onSearch = vi.fn();
    const { user } = setup(<TodoSearch onSearch={onSearch} />);
    
    // Type rapidly
    await user.type(screen.getByPlaceholderText('Search todos...'), 'test');
    
    // Should not call onSearch immediately
    expect(onSearch).not.toHaveBeenCalled();
    
    // Should call after debounce delay
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith('test'), {
      timeout: 400
    });
  });
});
```

### Bundle Size Testing
```bash
# Add to package.json scripts
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build",
    "size-check": "size-limit"
  }
}

# size-limit configuration
{
  "size-limit": [
    {
      "path": ".next/static/chunks/pages/*.js",
      "limit": "200 KB"
    }
  ]
}
```

### Lighthouse Performance Testing
- [ ] Automated Lighthouse CI checks
- [ ] Performance budget enforcement
- [ ] Core Web Vitals monitoring
- [ ] Mobile performance testing

## Performance Optimization Strategies

### Critical Rendering Path
1. **Above-the-fold content**: Prioritize todo list rendering
2. **Resource hints**: Preload critical assets
3. **Critical CSS**: Inline critical styles
4. **Font loading**: Optimize font loading strategy

### JavaScript Optimization
1. **Code splitting**: Route and component level
2. **Tree shaking**: Remove unused code
3. **Minification**: Compress JavaScript bundles
4. **Polyfill optimization**: Target modern browsers

### Data Loading Optimization
```typescript
// Implement efficient data loading
function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load from cache immediately
    const cached = localStorage.getItem('todos');
    if (cached) {
      setTodos(JSON.parse(cached));
      setLoading(false);
    }
    
    // Then sync with server in background
    syncWithServer().then(serverTodos => {
      if (JSON.stringify(serverTodos) !== cached) {
        setTodos(serverTodos);
      }
    });
  }, []);
  
  return { todos, loading };
}
```

## Dependencies
- @next/bundle-analyzer for bundle analysis
- web-vitals for performance monitoring
- react-intersection-observer for virtual scrolling
- size-limit for bundle size enforcement

## Success Criteria
- [ ] Lighthouse Performance score > 95
- [ ] First Contentful Paint < 1s
- [ ] Time to Interactive < 2s
- [ ] Bundle size < 200KB gzipped
- [ ] 60fps animations maintained
- [ ] No memory leaks detected

## Technical Debt & Future Enhancements
- Implement service worker for advanced caching
- Add performance monitoring dashboard
- Optimize for Core Web Vitals
- Implement predictive prefetching

## Change Log
| Date | Change | Author |
|------|--------|--------|
| TBD | Initial story creation | Developer |

## Related Stories
- Story 3.4: Loading & Transition States (animation performance)
- Story 3.6: Progressive Web App Features (service worker)
- Story 1.1: Project Setup (build optimization)

## References
- [Next.js Performance Best Practices](https://nextjs.org/docs/pages/building-your-application/optimizing/performance)
- [React Performance Optimization](https://react.dev/learn/render-and-commit#optimizing-performance)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analysis](https://nextjs.org/docs/pages/building-your-application/optimizing/bundle-analyzer)