# Source Tree Structure

## Complete Directory Layout

```
personal-todo-app/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # CI pipeline
│       └── deploy.yml              # Deployment workflow
├── .vscode/
│   ├── settings.json              # VS Code settings
│   └── extensions.json           # Recommended extensions
├── public/
│   ├── favicon.ico               # App favicon
│   ├── manifest.json              # PWA manifest
│   └── icons/                    # PWA icons
│       ├── icon-192.png
│       └── icon-512.png
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   ├── globals.css           # Global styles
│   │   ├── error.tsx             # Error boundary
│   │   ├── loading.tsx           # Loading state
│   │   └── api/                  # API routes
│   │       └── todos/
│   │           ├── route.ts      # GET/POST todos
│   │           └── [id]/
│   │               └── route.ts  # PUT/DELETE todo
│   ├── components/               # React components
│   │   ├── todo/                 # Todo feature components
│   │   │   ├── TodoItem.tsx
│   │   │   ├── TodoList.tsx
│   │   │   ├── AddTodo.tsx
│   │   │   ├── TodoActions.tsx
│   │   │   ├── TodoCheckbox.tsx
│   │   │   └── TodoFilters.tsx
│   │   ├── layout/               # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Container.tsx
│   │   └── ui/                   # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── checkbox.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── skeleton.tsx
│   │       └── toast.tsx
│   ├── lib/                      # Utilities and services
│   │   ├── storage/              # Data persistence
│   │   │   ├── localStorage.ts
│   │   │   ├── storageService.ts
│   │   │   └── types.ts
│   │   ├── utils/                # Helper functions
│   │   │   ├── cn.ts            # Class name utility
│   │   │   ├── date.ts         # Date formatting
│   │   │   └── validation.ts   # Input validation
│   │   └── hooks/                # Custom React hooks
│   │       ├── useTodos.ts
│   │       ├── useLocalStorage.ts
│   │       └── useDebounce.ts
│   ├── types/                    # TypeScript types
│   │   ├── todo.ts              # Todo interfaces
│   │   └── api.ts               # API types
│   └── styles/                   # Additional styles
│       └── animations.css        # Custom animations
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   │   ├── components/
│   │   └── lib/
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
│       └── todo-workflow.spec.ts
├── docs/                         # Documentation
│   ├── prd.md                   # Product requirements
│   ├── architecture.md          # Architecture doc
│   ├── ux-ui-spec.md           # UX/UI specifications
│   └── api.md                   # API documentation
├── .env.example                  # Environment variables example
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Git ignore file
├── .prettierrc                  # Prettier configuration
├── components.json              # shadcn/ui configuration
├── next-env.d.ts               # Next.js types
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies
├── postcss.config.js           # PostCSS configuration
├── README.md                   # Project documentation
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── vercel.json                 # Vercel deployment config
└── vitest.config.ts            # Vitest configuration
```

## Key Directory Descriptions

### `/src/app`

Next.js App Router directory containing pages, layouts, and API routes. Each file represents a route in the application.

### `/src/components`

Reusable React components organized by feature (todo) and type (ui, layout). Follow single responsibility principle.

### `/src/lib`

Business logic, utilities, and services. Keep framework-agnostic when possible for better testability.

### `/src/types`

Centralized TypeScript type definitions shared across the application.

### `/tests`

Organized by test type (unit, integration, e2e) mirroring the src structure.

## File Naming Conventions

### Components

- PascalCase for component files: `TodoItem.tsx`
- Index files for barrel exports: `index.ts`
- Test files alongside components: `TodoItem.test.tsx`

### Utilities & Hooks

- camelCase for utility files: `localStorage.ts`
- Prefix hooks with 'use': `useTodos.ts`

### Types

- camelCase for type files: `todo.ts`
- Use `.d.ts` for declaration files

## Import Path Aliases

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  }
}
```

Usage example:

```typescript
import { TodoItem } from '@/components/todo/TodoItem';
import { useTodos } from '@/lib/hooks/useTodos';
import type { Todo } from '@/types/todo';
```

## Module Organization

### Feature Modules

Group related functionality together:

```
components/todo/
├── TodoItem.tsx        # Single todo display
├── TodoList.tsx        # List container
├── AddTodo.tsx         # Add form
├── TodoActions.tsx     # Action buttons
├── TodoCheckbox.tsx    # Custom checkbox
├── TodoFilters.tsx     # Filter controls
└── index.ts           # Barrel export
```

### Shared Modules

Reusable across features:

```
components/ui/
├── button.tsx         # Base button component
├── input.tsx          # Form input
├── checkbox.tsx       # Checkbox component
└── index.ts          # Barrel export
```

## Build Output Structure

```
.next/
├── cache/            # Build cache
├── server/           # Server-side code
├── static/           # Static assets
└── types/           # Generated types

out/                 # Static export (if used)
```

## Configuration Files

### Essential Configs

- `next.config.js` - Next.js settings
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.ts` - Tailwind CSS customization
- `components.json` - shadcn/ui component settings

### Development Configs

- `.eslintrc.json` - Code linting rules
- `.prettierrc` - Code formatting rules
- `vitest.config.ts` - Test runner configuration

### Deployment Configs

- `vercel.json` - Vercel platform settings
- `.env.example` - Environment variable template

## Best Practices

### Keep It Organized

- One component per file
- Co-locate related files
- Use barrel exports for clean imports

### Maintain Consistency

- Follow naming conventions strictly
- Keep similar structures for similar features
- Document non-obvious organization choices

### Scale Thoughtfully

- Start simple, refactor when needed
- Don't over-organize prematurely
- Keep the structure flat when possible
