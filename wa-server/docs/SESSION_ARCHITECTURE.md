# Session Manager Architecture

## High-Level Picture

The Session Manager is a core component responsible for managing user sessions within the WhatsApp Web Bot system. It handles session lifecycle, state persistence, request routing, and communication with worker processes. The architecture is designed to be scalable, reliable, and secure to support high throughput and low latency requirements.

```
+-------------------+          +--------------------+          +----------------+
|                   |          |                    |          |                |
| Client Requests   +----------> Session Manager    +----------> Worker Processes|
|                   |          |                    |          |                |
+-------------------+          +--------------------+          +----------------+
         |                              |
         |                              |
         v                              v
   API Surface                  Persistent Storage
                                (Database / Cache)
```

## Data Model

The Session Manager maintains the following key data entities:

- **Session**: Represents a user's active connection, including session ID, user ID, state, and metadata.
- **State**: Captures the current status and context of a session.
- **Request**: Incoming operations associated with specific sessions.
- **Worker**: Represents a processing unit that handles session requests.

Example Session Entity:

```json
{
  "session_id": "abc123",
  "user_id": "user_456",
  "state": "active",
  "last_updated": "2024-06-01T12:34:56Z",
  "metadata": {
    "ip_address": "192.168.1.100",
    "client_version": "1.0.3"
  }
}
```

## Request Flow

1. Client sends a request to the Session Manager API.
2. Session Manager authenticates and validates the request.
3. The request is routed to the appropriate worker based on session ID hashing.
4. Worker processes the request and updates session state.
5. Session Manager persists updated state to the database/cache.
6. Response is sent back to the client.

## API Surface

The Session Manager exposes the following APIs:

- `POST /sessions` - Create a new session.
- `GET /sessions/{session_id}` - Retrieve session details.
- `PUT /sessions/{session_id}` - Update session state.
- `DELETE /sessions/{session_id}` - Terminate a session.
- `POST /sessions/{session_id}/request` - Submit a request to a session.

All APIs require authentication tokens and support JSON payloads.

## Session Manager Code Example

```typescript
import express from 'express';
import { SessionStore } from './sessionStore';
import { WorkerPool } from './workerPool';

const app = express();
app.use(express.json());

const sessionStore = new SessionStore();
const workerPool = new WorkerPool();

app.post('/sessions', async (req, res) => {
  const session = await sessionStore.createSession(req.body.userId);
  res.status(201).json(session);
});

app.post('/sessions/:sessionId/request', async (req, res) => {
  const { sessionId } = req.params;
  const session = await sessionStore.getSession(sessionId);
  if (!session) return res.status(404).send('Session not found');

  const worker = workerPool.getWorkerForSession(sessionId);
  const result = await worker.processRequest(sessionId, req.body);
  await sessionStore.updateSession(sessionId, result.updatedState);

  res.json(result.response);
});

app.listen(3000, () => console.log('Session Manager running on port 3000'));
```

## Worker Layout

Workers are stateless processes that handle session requests. They are horizontally scalable and communicate with the Session Manager via IPC or messaging queues.

- Each worker handles multiple sessions.
- Workers maintain in-memory caches for session data to reduce latency.
- Workers periodically sync state with persistent storage.

## Routing / Sharding

Sessions are routed to workers based on consistent hashing of the session ID. This ensures:

- Even distribution of load.
- Session affinity to the same worker for cache locality.
- Easy scaling by adding/removing workers with minimal re-shuffling.

## Reliability & Safety

- Session state is persisted in a durable storage backend (e.g., Redis, PostgreSQL).
- Workers and Session Manager instances run in multiple replicas for high availability.
- Heartbeat mechanisms detect and recover from worker failures.
- Transactions or optimistic locking prevent state corruption.

## Security

- All API endpoints require authentication and authorization.
- Data in transit is encrypted via TLS.
- Session data is sanitized and validated to prevent injection attacks.
- Access control policies restrict session operations to authorized users.

## Observability

- Metrics collected: request latency, error rates, session counts, worker utilization.
- Logs include structured context for tracing requests end-to-end.
- Alerts configured for abnormal conditions (e.g., high error rates, worker crashes).
- Distributed tracing supports debugging complex flows.

## Docker Compose

```yaml
version: '3.8'
services:
  session-manager:
    image: whatsapp/session-manager:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=redis
      - DB_PORT=6379
    depends_on:
      - redis

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
```

## Environment Configuration

| Variable         | Description                   | Default         |
|------------------|-------------------------------|-----------------|
| NODE_ENV         | Environment (development/production) | development    |
| DB_HOST          | Database host                 | localhost       |
| DB_PORT          | Database port                 | 6379            |
| SESSION_TTL      | Session expiration time (seconds) | 3600           |
| WORKER_COUNT     | Number of worker processes    | 4               |

## Capacity Planning

- Estimate peak concurrent sessions and requests per second.
- Allocate sufficient worker instances to handle load with headroom.
- Monitor resource usage and scale horizontally as needed.
- Use autoscaling policies based on CPU, memory, and request latency.

## Failure Modes

- **Worker crash**: Session Manager detects failure and reassigns sessions to other workers.
- **Database outage**: Session Manager enters degraded mode, queues requests, and retries.
- **Network partition**: Sessions may be temporarily unavailable; use retries and exponential backoff.
- **Data corruption**: Use backups and data validation to recover.

## Nice-to-Haves

- Session snapshotting for quick recovery.
- Session migration between workers during scaling.
- Real-time session analytics dashboard.
- Support for multi-region deployments.
- Integration with external identity providers for SSO.

---

This architecture provides a robust foundation for managing sessions in the WhatsApp Web Bot system, balancing performance, scalability, and security.
