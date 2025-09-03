# API Design

## API Overview

RESTful API design using Next.js API Routes for optional server-side persistence and future enhancements.

### Base URL

- Development: `http://localhost:3000/api`
- Production: `https://your-domain.vercel.app/api`

### API Versioning

Currently v1, with path-based versioning planned for future:

- Current: `/api/todos`
- Future: `/api/v2/todos`

## Endpoints

### Todo Endpoints

#### GET /api/todos

Retrieve all todos with optional filtering

**Query Parameters:**

- `status` (optional): `all` | `active` | `completed`
- `search` (optional): Search term for todo text
- `sort` (optional): `createdAt` | `updatedAt` | `text`
- `order` (optional): `asc` | `desc`
- `limit` (optional): Number of items to return
- `offset` (optional): Number of items to skip

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "Complete project documentation",
      "completed": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 42,
    "limit": 10,
    "offset": 0
  }
}
```

**Status Codes:**

- `200 OK`: Success
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error

#### POST /api/todos

Create a new todo

**Request Body:**

```json
{
  "text": "New todo item"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "text": "New todo item",
    "completed": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Codes:**

- `201 Created`: Todo created successfully
- `400 Bad Request`: Invalid input
- `500 Internal Server Error`: Server error

#### GET /api/todos/[id]

Retrieve a specific todo

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "text": "Complete project documentation",
    "completed": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Codes:**

- `200 OK`: Success
- `404 Not Found`: Todo not found
- `500 Internal Server Error`: Server error

#### PUT /api/todos/[id]

Update a todo

**Request Body:**

```json
{
  "text": "Updated todo text",
  "completed": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "text": "Updated todo text",
    "completed": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

**Status Codes:**

- `200 OK`: Updated successfully
- `400 Bad Request`: Invalid input
- `404 Not Found`: Todo not found
- `500 Internal Server Error`: Server error

#### DELETE /api/todos/[id]

Delete a todo

**Response:**

```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

**Status Codes:**

- `200 OK`: Deleted successfully
- `404 Not Found`: Todo not found
- `500 Internal Server Error`: Server error

### Bulk Operations

#### POST /api/todos/bulk

Perform bulk operations on todos

**Request Body:**

```json
{
  "operation": "update",
  "ids": ["id1", "id2", "id3"],
  "data": {
    "completed": true
  }
}
```

**Operations:**

- `update`: Update multiple todos
- `delete`: Delete multiple todos

**Response:**

```json
{
  "success": true,
  "data": {
    "affected": 3,
    "results": [...]
  }
}
```

### Backup Endpoints

#### POST /api/todos/backup

Create a backup of all todos

**Response:**

```json
{
  "success": true,
  "data": {
    "backupId": "backup-2024-01-15-103000",
    "todoCount": 42,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET /api/todos/backup

Retrieve the latest backup

**Response:**

```json
{
  "success": true,
  "data": {
    "todos": [...],
    "backupId": "backup-2024-01-15-103000",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Next.js API Route Implementation

### Route Structure

```
src/app/api/
├── todos/
│   ├── route.ts              # GET all, POST new
│   ├── [id]/
│   │   └── route.ts          # GET, PUT, DELETE by id
│   ├── bulk/
│   │   └── route.ts          # Bulk operations
│   └── backup/
│       └── route.ts          # Backup operations
```

### Route Handler Example

```typescript
// src/app/api/todos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TodoService } from '@/lib/services/todoService';

// GET /api/todos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      status: searchParams.get('status') as any,
      search: searchParams.get('search'),
      sort: searchParams.get('sort'),
      order: searchParams.get('order') as any,
    };

    const todos = await TodoService.getTodos(filters);

    return NextResponse.json({
      success: true,
      data: todos,
      meta: {
        total: todos.length,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch todos' }, { status: 500 });
  }
}

// POST /api/todos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Todo text is required' }, { status: 400 });
    }

    const todo = await TodoService.createTodo(body);

    return NextResponse.json({ success: true, data: todo }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create todo' }, { status: 500 });
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Todo text is required",
    "field": "text",
    "details": {}
  }
}
```

### Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `QUOTA_EXCEEDED`: Storage quota exceeded
- `INTERNAL_ERROR`: Unexpected server error
- `RATE_LIMIT`: Too many requests

### Error Handler Middleware

```typescript
export function errorHandler(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          field: error.field,
        },
      },
      { status: 400 }
    );
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}
```

## Request Validation

```typescript
import { z } from 'zod';

const CreateTodoSchema = z.object({
  text: z.string().min(1).max(500).trim(),
});

const UpdateTodoSchema = z.object({
  text: z.string().min(1).max(500).trim().optional(),
  completed: z.boolean().optional(),
});

export function validateRequest<T>(data: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.errors[0].message, error.errors[0].path[0] as string);
    }
    throw error;
  }
}
```

## Response Headers

### Standard Headers

```typescript
const headers = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
};
```

### CORS Configuration

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
```

## Rate Limiting

```typescript
import { RateLimiter } from '@/lib/rateLimiter';

const limiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

export async function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';

  if (!limiter.allow(ip)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT',
          message: 'Too many requests',
        },
      },
      { status: 429 }
    );
  }
}
```

## Testing API Routes

```typescript
import { GET, POST } from '@/app/api/todos/route';
import { NextRequest } from 'next/server';

describe('Todos API', () => {
  it('should return todos on GET', async () => {
    const request = new NextRequest('http://localhost:3000/api/todos');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should create todo on POST', async () => {
    const request = new NextRequest('http://localhost:3000/api/todos', {
      method: 'POST',
      body: JSON.stringify({ text: 'Test todo' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.text).toBe('Test todo');
  });
});
```
