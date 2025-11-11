# 📋 Logging System Guide

## Overview

We use a Supabase-based logging system instead of Vercel logs, making it easy to share debugging information with contributors.

## Features

- ✅ **Shareable**: All logs stored in Supabase, accessible to team members
- ✅ **Searchable**: Filter by level, session, endpoint, date range
- ✅ **Web UI**: View logs at `/debug/logs`
- ✅ **API Access**: Query logs via `/api/debug/logs`
- ✅ **Non-blocking**: Logging failures won't break your app

## Setup

### 1. Run Database Migration

```bash
# Run the migration script in Supabase SQL Editor
psql $DATABASE_URL < scripts/migrate-add-logs-table.sql

# Or copy/paste the SQL from scripts/migrate-add-logs-table.sql
```

### 2. Use the Logger

Replace `console.log`/`console.error` with the logger:

```typescript
import { logger } from '@/lib/logger';

// Instead of console.log
logger.info('User logged in', { userId: '123' });

// Instead of console.error
logger.error('Failed to process payment', error, { orderId: '456' });

// Instead of console.warn
logger.warn('API rate limit approaching', { remaining: 10 });

// Debug logs (only in development)
logger.debug('Processing request', { endpoint: '/api/chat' });
```

### 3. Context-Aware Logging

Create a logger with default context:

```typescript
import { logger } from '@/lib/logger';

// In an API route
const routeLogger = logger.withContext({
  endpoint: '/api/chat',
  sessionId: sessionId,
});

routeLogger.info('Processing message');
routeLogger.error('Failed to process', error);
```

## Viewing Logs

### Option 1: Web UI (Recommended)

Navigate to: `https://your-app.vercel.app/debug/logs`

Features:
- Filter by level, session ID, endpoint
- Pagination
- View stack traces and context
- Share URL with contributors

### Option 2: API Endpoint

```bash
# Get recent errors
curl https://your-app.vercel.app/api/debug/logs?level=error&limit=50

# Filter by session
curl https://your-app.vercel.app/api/debug/logs?sessionId=session_abc123

# Filter by endpoint
curl https://your-app.vercel.app/api/debug/logs?endpoint=/api/chat

# Get logs since a date
curl "https://your-app.vercel.app/api/debug/logs?since=2024-01-01T00:00:00Z"

# Pagination
curl "https://your-app.vercel.app/api/debug/logs?limit=100&offset=100"
```

### Option 3: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. Open the `logs` table
4. Use filters and sorting as needed

## API Reference

### GET /api/debug/logs

Query parameters:
- `level` (optional): Filter by level (`info`, `warn`, `error`, `debug`)
- `sessionId` (optional): Filter by session ID
- `endpoint` (optional): Filter by endpoint path
- `limit` (optional): Number of logs (default: 100, max: 1000)
- `offset` (optional): Pagination offset (default: 0)
- `since` (optional): ISO timestamp - logs after this time
- `before` (optional): ISO timestamp - logs before this time

Response:
```json
{
  "logs": [
    {
      "id": "uuid",
      "level": "error",
      "message": "Failed to process",
      "context": { "orderId": "123" },
      "session_id": "session_abc",
      "endpoint": "/api/chat",
      "stack_trace": "...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 500,
    "hasMore": true
  },
  "filters": {
    "level": "error",
    "sessionId": null,
    "endpoint": null,
    "since": null,
    "before": null
  }
}
```

### DELETE /api/debug/logs

Delete old logs (cleanup).

Query parameters:
- `olderThan` (required): ISO timestamp - delete logs older than this
- `level` (optional): Only delete logs of this level

Example:
```bash
# Delete logs older than 30 days
curl -X DELETE "https://your-app.vercel.app/api/debug/logs?olderThan=2024-01-01T00:00:00Z"
```

## Sharing with Contributors

### Method 1: Share Web UI URL
Simply share: `https://your-app.vercel.app/debug/logs`

Contributors can:
- View all logs
- Filter by error type, session, endpoint
- See stack traces and context
- No authentication required (if you want to add auth, see below)

### Method 2: Share Supabase Access
1. Add contributors to your Supabase project
2. They can view logs in the Table Editor
3. They can run custom SQL queries

### Method 3: Share API Endpoint
Share the API endpoint with filters:
```
https://your-app.vercel.app/api/debug/logs?level=error&limit=100
```

## Best Practices

1. **Use appropriate log levels**:
   - `error`: For errors that need attention
   - `warn`: For warnings that might cause issues
   - `info`: For important events
   - `debug`: For detailed debugging (only in dev)

2. **Include context**:
   ```typescript
   logger.error('Payment failed', error, {
     userId: user.id,
     orderId: order.id,
     amount: order.amount,
   });
   ```

3. **Don't log sensitive data**:
   - Never log passwords, API keys, tokens
   - Be careful with PII (personally identifiable information)

4. **Clean up old logs**:
   ```bash
   # Delete logs older than 90 days
   curl -X DELETE "https://your-app.vercel.app/api/debug/logs?olderThan=$(date -u -d '90 days ago' +%Y-%m-%dT%H:%M:%SZ)"
   ```

## Migration from console.log

To migrate existing code:

1. Replace `console.log` → `logger.info`
2. Replace `console.error` → `logger.error`
3. Replace `console.warn` → `logger.warn`
4. Add context where helpful

Example:
```typescript
// Before
console.log('Processing message:', message);
console.error('Error:', error);

// After
logger.info('Processing message', { message: message.substring(0, 50) });
logger.error('Error processing message', error, { sessionId });
```

## Security Considerations

- The `/debug/logs` page is publicly accessible by default
- Consider adding authentication if logs contain sensitive information
- Use RLS policies in Supabase to restrict access if needed
- Regularly clean up old logs to reduce storage costs

## Troubleshooting

**Logs not appearing?**
1. Check Supabase connection
2. Verify `logs` table exists
3. Check browser console for errors
4. Verify `SUPABASE_SERVICE_ROLE_KEY` is set

**Too many logs?**
- Use log levels appropriately
- Don't log in tight loops
- Clean up old logs regularly

**Performance concerns?**
- Logging is non-blocking (async)
- Indexes are created for efficient queries
- Consider archiving old logs to cold storage

