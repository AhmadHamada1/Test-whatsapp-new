## PRD: Admin Dashboard (Web)

### Overview
An admin-facing dashboard to authenticate, manage API keys used by external services, view basic usage, and change the admin password.

### Users
- Admin (single seeded user)

### Objectives
- Fast, simple, secure admin operations
- Keep client bundles lean; server-side data access

### Scope
1) Authentication
   - Login form (email, password)
   - Persist via HttpOnly cookie
   - Logout (clear cookie)
2) API Keys
   - List keys with status, created date, usage count, last used
   - Create key with optional label; show plaintext token once
   - Revoke/Activate key
   - View single key details (optional)
3) Settings
   - Change password (current + new)
4) Dashboard
   - Basic usage summary (counts over period) [v1 minimal]

### Non-Goals (v1)
- Multi-user management, roles
- Advanced analytics/filters
- Audit logs

### Functional Requirements
- Only authenticated admin can access protected pages
- Creating a key returns plaintext token exactly once
- Revoked keys cannot authenticate; activation re-enables
- All requests proxied through Next route handlers

### Success Metrics
- TTFB < 200ms on cached pages locally
- P95 API action latency < 500ms
- Bundle size per page < 150KB JS (approx, v1)

### Security & Compliance
- JWT in HttpOnly cookie, SameSite=Lax, Secure in prod
- No JWT in localStorage/sessionStorage
- Input validation on all forms

### Risks
- Token leakage on create; mitigate via one-time display modal
- Backend downtime; show friendly errors, retries where safe

### Milestones
1) Auth flow complete
2) API keys CRUD complete
3) Settings (password change)
4) Dashboard summary + polish


