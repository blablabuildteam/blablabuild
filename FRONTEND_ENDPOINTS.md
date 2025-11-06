# 📡 Frontend API Integration Guide

This document shows how all frontend components integrate with the API endpoints.

## Architecture Overview

```
Frontend (React Components)
         ↓
    API Routes (Next.js)
         ↓
  Backend Logic (Server-side)
         ↓
Database (Supabase) / AI (OpenRouter)
```

---

## 1. Password Gate Component

**File**: `components/PasswordGate.tsx`

### API Integration

#### On Component Mount
```typescript
// Check if already authenticated
const response = await fetch('/api/auth/check');
const data = await response.json();
// data.authenticated → true/false
```

**Endpoint**: `GET /api/auth/check`  
**Purpose**: Check if user has valid authentication cookie  
**Response**: `{ authenticated: boolean }`

#### On Password Submit
```typescript
const response = await fetch('/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password }),
});
const data = await response.json();
// data.success → true (with cookie set)
// data.error → "Invalid password"
```

**Endpoint**: `POST /api/auth/verify`  
**Purpose**: Verify password and set authentication cookie  
**Request**: `{ password: string }`  
**Response Success**: `{ success: true, message: string }`  
**Response Error**: `{ error: string }` (401 status)

---

## 2. AI Widget Component

**File**: `components/AIWidget.tsx`

### API Integration

#### Initialize Session
```typescript
const response = await fetch('/api/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    utm_source: new URLSearchParams(window.location.search).get('utm_source'),
    utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
    utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
  }),
});
const data = await response.json();
// data.sessionId → "session_xxx"
// data.message → Welcome message
// data.step → "collecting"
// data.progress → 0
```

**Endpoint**: `POST /api/init`  
**Purpose**: Create new analysis session  
**Request**: `{ utm_source?, utm_medium?, utm_campaign? }`  
**Response**: `{ message: string, sessionId: string, step: string, progress: number }`

#### Send Chat Message
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: currentSessionId,
    message: userInput,
  }),
});
const data = await response.json();
// data.message → AI response
// data.step → current step
// data.progress → 0-100
// data.ideas → [...] (when complete)
// data.complete → true (when done)
```

**Endpoint**: `POST /api/chat`  
**Purpose**: Send user message, get AI response  
**Request**: `{ sessionId: string, message: string }`  
**Response**: `{ message: string, sessionId: string, step: string, progress: number, ideas?: Idea[], complete?: boolean }`

#### Submit Email
```typescript
const response = await fetch('/api/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: currentSessionId,
    email: userEmail,
  }),
});
const data = await response.json();
// data.success → true
```

**Endpoint**: `POST /api/email`  
**Purpose**: Send analysis results via email  
**Request**: `{ sessionId: string, email: string }`  
**Response**: `{ success: boolean }`

---

## 3. Analytics Integration

**File**: `lib/analytics.ts`

### PostHog Events Tracked

```typescript
// Page view
trackEvent('page_view', { page: 'home' });

// Widget interactions
trackEvent('widget_opened', { session_id: string });
trackEvent('widget_closed', { session_id: string });
trackEvent('message_sent', { session_id: string });

// CTA clicks
trackEvent('cta_nav_clicked');
trackEvent('cta_bottom_clicked');

// Conversion
trackEvent('email_submitted', { session_id: string, email: string });
```

**No API calls** - Events sent directly to PostHog client-side

---

## Complete User Flow

### 1. First Visit
```
1. User visits site
   ↓
2. PasswordGate mounts
   ↓
3. GET /api/auth/check → { authenticated: false }
   ↓
4. Show password gate
   ↓
5. User enters password: "trump"
   ↓
6. POST /api/auth/verify → { success: true }
   ↓
7. Cookie set: site_auth=blabla_authenticated_2024
   ↓
8. Show main site content
```

### 2. Return Visit (Within 7 Days)
```
1. User visits site
   ↓
2. PasswordGate mounts
   ↓
3. GET /api/auth/check → { authenticated: true }
   ↓
4. Show main site content (skip password gate)
```

### 3. Analysis Flow
```
1. User clicks widget sparkles button
   ↓
2. POST /api/init → { sessionId, message }
   ↓
3. Display welcome message
   ↓
4. User types response
   ↓
5. POST /api/chat → { message, progress }
   ↓
6. Display AI response
   ↓
7. Repeat steps 4-6 (~7 times)
   ↓
8. POST /api/chat → { complete: true, ideas: [...] }
   ↓
9. Display results
   ↓
10. User enters email
    ↓
11. POST /api/email → { success: true }
    ↓
12. Show success message
```

---

## Error Handling

### Authentication Errors
```typescript
// Wrong password
try {
  const response = await fetch('/api/auth/verify', ...);
  if (!response.ok) {
    const data = await response.json();
    setError(data.error); // "Invalid password"
  }
} catch (error) {
  setError('Authentication failed. Please try again.');
}
```

### Chat Errors
```typescript
try {
  const response = await fetch('/api/chat', ...);
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
} catch (error) {
  // Show error to user
  // Retry logic can be added
}
```

### Network Errors
```typescript
// All fetch calls wrapped in try/catch
// User sees friendly error message
// No stack traces exposed
```

---

## Loading States

### PasswordGate
- `isLoading` - Checking authentication on mount
- `isSubmitting` - Verifying password
- Button disabled during submission

### AIWidget
- `isLoading` - Waiting for AI response
- Input disabled during processing
- Loading spinner shown
- Progress bar updates

---

## State Management

### PasswordGate State
```typescript
const [password, setPassword] = useState('');
const [isUnlocked, setIsUnlocked] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState('');
```

### AIWidget State
```typescript
const [isOpen, setIsOpen] = useState(false);
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [sessionId, setSessionId] = useState<string | null>(null);
const [progress, setProgress] = useState(0);
const [isComplete, setIsComplete] = useState(false);
```

---

## API Response Types

### TypeScript Interfaces

```typescript
// From lib/types.ts

interface ChatResponse {
  message: string;
  sessionId: string;
  step: 'init' | 'collecting' | 'scoring' | 'ideating' | 'complete';
  progress?: number;
  ideas?: Idea[];
  complete?: boolean;
}

interface Idea {
  title: string;
  summary: string;
  stack: string[];
  effort: 'S' | 'M' | 'L' | 'XL';
  impact: 'Low' | 'Medium' | 'High' | 'Very High';
  risks: string[];
  cost_lo: number;
  cost_hi: number;
  cost_assumptions: string;
  confidence: number;
}
```

---

## Best Practices

### 1. Always Handle Errors
```typescript
try {
  const response = await fetch(...);
  if (!response.ok) throw new Error();
  const data = await response.json();
} catch (error) {
  // Show user-friendly message
}
```

### 2. Show Loading States
```typescript
setIsLoading(true);
try {
  await fetch(...);
} finally {
  setIsLoading(false);
}
```

### 3. Validate Before Sending
```typescript
if (!sessionId || !message.trim()) {
  return; // Don't send empty messages
}
```

### 4. Track Important Events
```typescript
trackEvent('conversion_event', {
  session_id: sessionId,
  email: email,
});
```

---

## Quick Reference

| Action | Endpoint | Method | Auth Required |
|--------|----------|--------|---------------|
| Check auth | `/api/auth/check` | GET | No |
| Login | `/api/auth/verify` | POST | No |
| Logout | `/api/auth/logout` | POST | Yes (cookie) |
| Start session | `/api/init` | POST | No |
| Send message | `/api/chat` | POST | No |
| Submit email | `/api/email` | POST | No |

---

**All frontend components are fully API-driven** ✅  
**No business logic on client-side** ✅  
**Secure authentication via HTTP-only cookies** ✅

