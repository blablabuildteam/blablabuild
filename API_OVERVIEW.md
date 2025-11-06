# API Overview - blablabuild

All functionality in this application is API-driven for security and scalability.

## Authentication APIs

### POST `/api/auth/verify`
**Purpose**: Verify password and create authentication session

**Request Body**:
```json
{
  "password": "string"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Authentication successful"
}
```

**Response (Error - 401)**:
```json
{
  "error": "Invalid password"
}
```

**Side Effects**: Sets HTTP-only cookie `site_auth` for 7 days

---

### GET `/api/auth/check`
**Purpose**: Check if user is authenticated

**Response**:
```json
{
  "authenticated": boolean
}
```

---

### POST `/api/auth/logout`
**Purpose**: Clear authentication session

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Side Effects**: Clears `site_auth` cookie

---

## Chat & Analysis APIs

### POST `/api/init`
**Purpose**: Initialize a new analysis session

**Request Body**:
```json
{
  "utm_source": "string (optional)",
  "utm_medium": "string (optional)",
  "utm_campaign": "string (optional)"
}
```

**Response**:
```json
{
  "message": "string (first question)",
  "sessionId": "string (UUID)",
  "step": "init",
  "progress": number
}
```

---

### POST `/api/chat`
**Purpose**: Send user message and receive AI response

**Request Body**:
```json
{
  "sessionId": "string (UUID)",
  "message": "string (user input)"
}
```

**Response**:
```json
{
  "message": "string (AI response)",
  "sessionId": "string (UUID)",
  "step": "collecting" | "scoring" | "ideating" | "complete",
  "progress": number (0-100),
  "ideas": [...] (optional, when complete),
  "complete": boolean (optional)
}
```

---

### POST `/api/email`
**Purpose**: Send analysis results via email

**Request Body**:
```json
{
  "sessionId": "string (UUID)",
  "email": "string (email address)",
  "name": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

---

## Environment Variables (Server-Side Only)

### Authentication
- `SITE_PASSWORD` - Password for site access (default: "trump")
- `AUTH_TOKEN` - Token stored in authentication cookie

### Database
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public/anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side admin key

### AI & Services
- `OPENROUTER_API_KEY` - OpenRouter API key for AI models
- `RESEND_API_KEY` - Resend API key for email delivery

### Analytics
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog analytics key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host URL

### App Config
- `NEXT_PUBLIC_APP_URL` - Application URL for emails/links

---

## Security Features

1. **Password Protection**: All routes protected by authentication middleware via cookies
2. **HTTP-Only Cookies**: Authentication token not accessible via JavaScript
3. **Server-Side Validation**: All sensitive operations validated on server
4. **No Client-Side Secrets**: No API keys or passwords exposed to browser
5. **Secure Session Management**: 7-day cookie expiration with SameSite protection

---

## Client Components (All API-Driven)

### PasswordGate
- Checks authentication on mount via `/api/auth/check`
- Submits password via `/api/auth/verify`
- Maintains session via HTTP-only cookies

### AIWidget
- Initializes session via `/api/init`
- Sends messages via `/api/chat`
- Submits email via `/api/email`

---

## Data Flow

```
User Input → Client Component → API Route → Server Logic → Database/AI
                                    ↓
                            HTTP-Only Cookie
                                    ↓
                          Secure Authentication
```

All sensitive operations happen server-side. Client only sends user input and receives processed responses.

