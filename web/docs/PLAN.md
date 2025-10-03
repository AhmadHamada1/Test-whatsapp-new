## Web App Technical Plan

### Goals
- Admin login with JWT via Next route handler proxy
- Server-only data fetching for security and performance
- Manage API keys (list/create/revoke/activate)
- Change password
- Minimal UI with good UX, lean bundles

### Architecture
- Next.js App Router
- Internal Route Handlers under `/api/*` proxy to Backend API
- JWT stored in HttpOnly cookie `token`
- React Server Components for reads; Client islands for forms/actions
- Zustand only for ephemeral UI state (toasts/modals/loading)

### Routing
- `/login` (public)
- `/dashboard` (protected)
- `/api-keys` (protected)
- `/api-keys/[id]` (optional)
- `/settings` (protected)
- Middleware guards protected routes by `token` cookie

### Data Flow
- Login: POST `/api/auth/login` → Backend `/auth/login` → set cookie `token`
- Me: GET `/api/auth/me` → Backend `/auth/me` (no-store)
- Keys: GET/POST `/api/api-keys` → Backend `/api-keys`
- Key actions: POST `/api/api-keys/:id/(revoke|activate)`
- Change password: POST `/api/admin/change-password`

### Caching/Revalidation
- Dashboard summary: `revalidate: 30`
- API keys list: tag `api-keys`, revalidate after mutations
- Me: `no-store`

### Env
- `NEXT_PUBLIC_API_BASE_URL` → Backend base URL

### Security
- JWT only in HttpOnly cookie (SameSite=Lax, Secure in prod)
- No secrets on client; internal routes handle tokens server-side

### Milestones
1) Middleware, auth handlers, login page
2) App shell + protected routes
3) API keys list + create + actions
4) Settings change password
5) Dashboard summary + polish (toasts, errors)


