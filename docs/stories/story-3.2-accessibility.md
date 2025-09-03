# Story 3.2: Accessibility Features

**Epic:** Epic 3 - User Experience Polish  
**Status:** 📝 Draft  
**Estimate:** 2 hours  
**Assignee:** Developer

## Story

**As a** user with accessibility needs  
**I want** full keyboard and screen reader support  
**So that** I can use the app effectively

## Acceptance Criteria

- [ ] All interactive elements keyboard accessible
- [ ] Tab order logical and predictable
- [ ] Focus indicators clearly visible
- [ ] ARIA labels for all controls
- [ ] Screen reader announcements for actions
- [ ] High contrast mode support
- [ ] Minimum 4.5:1 color contrast ratio

## Technical Implementation

### ARIA Labels and Roles

```typescript
// Todo list with proper semantics
<main>
  <section aria-labelledby="todo-heading">
    <h1 id="todo-heading">Todo List</h1>
    <ul role="list" aria-label="Todo items">
      <li role="listitem">
        <label>
          <input
            type="checkbox"
            aria-describedby={`todo-${id}-desc`}
            onChange={handleToggle}
          />
          <span id={`todo-${id}-desc`}>{text}</span>
        </label>
      </li>
    </ul>
  </section>
</main>
```

### Focus Management

```typescript
// Custom hook for keyboard navigation
function useKeyboardNavigation() {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        focusNextItem();
        break;
      case 'ArrowUp':
        focusPreviousItem();
        break;
      case 'Enter':
      case ' ':
        toggleSelectedItem();
        break;
    }
  };
}
```

### Screen Reader Support

```typescript
// Live region for announcements
<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {announcement}
</div>

// Announce todo actions
const announceAction = (action: string, todoText: string) => {
  setAnnouncement(`${action}: ${todoText}`);
};
```

## Implementation Checklist

### Keyboard Navigation

- [ ] Tab order follows visual layout
- [ ] All interactive elements reachable via keyboard
- [ ] Arrow keys navigate within todo list
- [ ] Enter/Space activate buttons and checkboxes
- [ ] Escape key cancels edit mode
- [ ] Focus trap in modal dialogs

### Screen Reader Support

- [ ] Semantic HTML structure (`main`, `section`, `ul`, `li`)
- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] ARIA labels for icon buttons
- [ ] ARIA descriptions for complex interactions
- [ ] Live regions for dynamic content updates
- [ ] Screen reader testing with NVDA/JAWS/VoiceOver

### Visual Accessibility

- [ ] Focus indicators meet 3:1 contrast ratio
- [ ] Text meets 4.5:1 contrast ratio (WCAG AA)
- [ ] Color is not the only way to convey information
- [ ] Touch targets minimum 44x44px
- [ ] Text can be zoomed to 200% without horizontal scroll

### High Contrast Mode

- [ ] Windows High Contrast Mode support
- [ ] CSS custom properties for theming
- [ ] Border styles visible in high contrast
- [ ] Icons remain visible and meaningful

## Dev Notes

### shadcn/ui Accessibility Features

Based on `/workspaces/todo/docs/architecture/tech-stack.md`, shadcn/ui components are built on Radix UI primitives which provide excellent accessibility support:

- Radix UI components include ARIA attributes by default
- Built-in keyboard navigation patterns
- Focus management utilities
- Screen reader optimized interactions

### TypeScript Accessibility Types

```typescript
// From coding standards in /workspaces/todo/docs/architecture/coding-standards.md
interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  role?: string;
}
```

### Focus Management Implementation

```typescript
// Following React component standards from architecture docs
function useFocusManagement() {
  const focusedIndex = useRef<number>(-1);
  const listRef = useRef<HTMLUListElement>(null);

  const focusItem = useCallback((index: number) => {
    const items = listRef.current?.querySelectorAll('[role="listitem"]');
    if (items?.[index]) {
      (items[index] as HTMLElement).focus();
      focusedIndex.current = index;
    }
  }, []);

  return { focusItem, listRef };
}
```

## Testing Requirements

### Manual Testing

- [ ] Navigate entire app using only keyboard
- [ ] Test with screen reader (NVDA on Windows, VoiceOver on Mac)
- [ ] Test in Windows High Contrast Mode
- [ ] Verify focus indicators are visible
- [ ] Check color contrast ratios with tools

### Automated Testing

```typescript
// Accessibility testing with jest-axe
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = render(<TodoApp />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Testing Tools

- [ ] axe DevTools browser extension
- [ ] WAVE accessibility evaluation tool
- [ ] Lighthouse accessibility audit
- [ ] Color contrast analyzers
- [ ] Keyboard navigation testing

## Dependencies

- react-aria (if needed beyond shadcn/ui)
- @testing-library/jest-dom for accessibility assertions
- jest-axe for automated accessibility testing

## Success Criteria

- [ ] Zero accessibility violations in axe audit
- [ ] Screen reader can navigate and interact with all features
- [ ] All functionality available via keyboard
- [ ] WCAG 2.1 AA compliance achieved
- [ ] Focus management works smoothly

## Technical Debt & Future Enhancements

- Consider implementing skip links for keyboard users
- Evaluate need for reduced motion preferences
- Plan for internationalization (RTL languages)

## Change Log

| Date | Change                 | Author    |
| ---- | ---------------------- | --------- |
| TBD  | Initial story creation | Developer |

## Related Stories

- Story 3.1: Responsive Design Implementation
- Story 3.4: Loading & Transition States

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Radix UI Documentation](https://www.radix-ui.com/)
