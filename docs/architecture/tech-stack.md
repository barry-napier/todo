# Technology Stack

This is the DEFINITIVE technology selection for the entire project. All development must use these exact versions.

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3.3 | Type-safe development | Enhanced developer experience and runtime error prevention |
| Frontend Framework | Next.js | 15.0.0 | Full-stack React framework | App Router, built-in optimization, Vercel integration |
| UI Component Library | shadcn/ui | Latest | Design system components | Accessible components with Tailwind integration |
| State Management | React Built-in | 18.3.1 | Local component state | Sufficient for simple todo app, avoid over-engineering |
| Backend Language | TypeScript | 5.3.3 | API route development | Shared types across frontend and backend |
| Backend Framework | Next.js API Routes | 15.0.0 | Serverless API endpoints | Integrated with frontend, optimal for simple persistence |
| API Style | REST | N/A | HTTP endpoints | Simple CRUD operations, well-understood patterns |
| Database | localStorage + JSON Files | Native | Data persistence | Instant client access with server backup option |
| Cache | Browser Cache | Native | Asset caching | Built-in browser caching with Vercel CDN |
| File Storage | Vercel File System | N/A | Server-side backup | Simple file-based persistence for backup |
| Authentication | None (Phase 1) | N/A | No auth initially | Single-user personal app, auth in future phases |
| Frontend Testing | Vitest + Testing Library | 2.0.5 | Component testing | Fast, modern testing with React component support |
| Backend Testing | Vitest | 2.0.5 | API route testing | Unified testing framework across stack |
| E2E Testing | Playwright | 1.40.0 | End-to-end testing | Cross-browser testing with accessibility features |
| Build Tool | Next.js | 15.0.0 | Build optimization | Integrated build with automatic optimizations |
| Bundler | Turbopack | Latest | Fast bundling | Next.js default, faster than Webpack |
| IaC Tool | Vercel CLI | Latest | Deployment automation | Infrastructure defined in vercel.json |
| CI/CD | GitHub Actions | Latest | Automated deployment | Integrated with Vercel deployment |
| Monitoring | Vercel Analytics | Latest | Performance monitoring | Built-in real user monitoring |
| Logging | Console + Vercel Logs | Native | Error tracking | Simple logging with Vercel log aggregation |
| CSS Framework | Tailwind CSS | 4.0.0 | Utility-first styling | Modern styling with shadcn/ui compatibility |

## Package Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "uuid": "^9.0.1"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/uuid": "^9",
    "autoprefixer": "^10.4.17",
    "eslint": "^8",
    "eslint-config-next": "15.0.0",
    "postcss": "^8",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.3.3",
    "@testing-library/react": "^14.2.0",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.2.1",
    "vitest": "^2.0.5",
    "@playwright/test": "^1.40.0"
  }
}
```

## Version Management

### Version Lock Strategy
- Exact versions for critical dependencies (Next.js, React, TypeScript)
- Caret ranges for utility libraries
- Lock file committed to repository
- Renovate bot for automated updates with testing

### Upgrade Policy
- Security patches: Immediate
- Minor updates: Weekly review
- Major updates: Quarterly planning
- Breaking changes: Feature branch testing

## Technology Decisions

### Why Next.js App Router?
- Server Components for optimal performance
- Built-in code splitting and optimization
- Simplified data fetching patterns
- Native TypeScript support
- Vercel deployment optimization

### Why shadcn/ui?
- Copy-paste component model for customization
- Radix UI primitives for accessibility
- Tailwind CSS integration
- TypeScript by default
- No runtime overhead

### Why localStorage First?
- Zero latency for user interactions
- Works offline by default
- No database setup required
- Sufficient for personal use case
- Easy migration path to server storage

### Why Tailwind CSS 4?
- Next generation performance improvements
- Better developer experience
- Native CSS variables integration
- Reduced bundle size
- Future-proof styling solution