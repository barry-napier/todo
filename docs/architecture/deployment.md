# Deployment Architecture

## Deployment Platform

### Vercel (Primary)

**Rationale:** Optimal Next.js integration with zero-config deployment

**Features:**

- Automatic deployments from GitHub
- Preview deployments for PRs
- Edge Functions for API routes
- Global CDN distribution
- Built-in analytics
- Automatic SSL certificates

### Environment Configuration

#### Environment Variables

```bash
# .env.local (Development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
STORAGE_TYPE=localStorage
ENABLE_ANALYTICS=false

# .env.production (Production)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api
STORAGE_TYPE=localStorage
ENABLE_ANALYTICS=true
VERCEL_ANALYTICS_ID=your-analytics-id
```

#### vercel.json Configuration

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "functions": {
    "app/api/todos/route.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run tests
        run: npm run test

      - name: Build application
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Deployment Process

#### Development Workflow

1. Create feature branch
2. Make changes and commit
3. Push to GitHub
4. Automatic preview deployment created
5. Review changes in preview URL
6. Merge to main after approval

#### Production Deployment

1. Merge PR to main branch
2. GitHub Actions runs tests
3. Vercel automatically deploys
4. Production URL updated
5. Old deployment retained for rollback

## Build Optimization

### Next.js Optimization Config

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Output optimization
  output: 'standalone',

  // Bundle analyzer
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

### Performance Budgets

```json
{
  "performanceBudget": {
    "firstContentfulPaint": 1000,
    "largestContentfulPaint": 2500,
    "timeToInteractive": 3500,
    "totalBundleSize": 200000,
    "totalPageWeight": 500000
  }
}
```

## Monitoring & Analytics

### Vercel Analytics Setup

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom Analytics Events

```typescript
// lib/analytics.ts
import { track } from '@vercel/analytics';

export const trackEvent = (eventName: string, metadata?: any) => {
  if (process.env.NODE_ENV === 'production') {
    track(eventName, metadata);
  }
};

// Usage
trackEvent('todo_created', { todoLength: text.length });
trackEvent('todo_completed', { completionTime: Date.now() - createdAt });
```

### Error Monitoring

```typescript
// lib/errorReporting.ts
export function reportError(error: Error, context?: any) {
  if (process.env.NODE_ENV === 'production') {
    console.error('Error:', error, 'Context:', context);
    // Future: Send to error tracking service
    // Sentry.captureException(error, { extra: context });
  }
}
```

## Security Configuration

### Security Headers

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: '/:path*',
};
```

### Content Security Policy

```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  block-all-mixed-content;
  upgrade-insecure-requests;
`;
```

## Rollback Strategy

### Vercel Rollback Process

1. Access Vercel Dashboard
2. Navigate to Deployments
3. Find previous stable deployment
4. Click "Promote to Production"
5. Confirm rollback

### Automated Rollback

```javascript
// scripts/rollback.js
const { exec } = require('child_process');

async function rollback(deploymentId) {
  exec(`vercel alias set ${deploymentId} your-domain.vercel.app`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Rollback failed: ${error}`);
      return;
    }
    console.log(`Rolled back to: ${deploymentId}`);
  });
}
```

## Scaling Strategy

### Vercel Auto-Scaling

- Automatic horizontal scaling
- Global edge network distribution
- Serverless function concurrency
- No configuration needed

### Performance Optimization

1. **Static Generation**: Pre-render pages at build time
2. **ISR**: Incremental Static Regeneration for dynamic content
3. **Edge Functions**: Run API routes at edge locations
4. **Image Optimization**: Automatic image optimization
5. **Code Splitting**: Automatic per-page code splitting

### Caching Strategy

```typescript
// API Route caching
export async function GET() {
  return NextResponse.json(
    { todos },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
      },
    }
  );
}
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] TypeScript build successful
- [ ] ESLint no errors
- [ ] Environment variables configured
- [ ] Performance budgets met
- [ ] Security headers configured

### Post-Deployment

- [ ] Verify production URL
- [ ] Test critical user flows
- [ ] Check analytics tracking
- [ ] Monitor error logs
- [ ] Verify API endpoints
- [ ] Test on multiple devices

### Rollback Criteria

- [ ] 500 errors > 1% of requests
- [ ] Core functionality broken
- [ ] Performance degradation > 20%
- [ ] Security vulnerability detected
