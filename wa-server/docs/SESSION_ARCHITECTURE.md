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

1. Client sends a request to the Connection Manager API.
2. Connection Manager authenticates and validates the request.
3. The request is routed to the appropriate worker based on connectionId hashing.
4. Worker processes the request and updates connection state.
5. Connection Manager persists updated state to the database/cache.
6. Response is sent back to the client.

## API Surface

The Connection Manager exposes the following APIs:

| Endpoint                                           | Method | Description                           | Request Example | Response Example |
|----------------------------------------------------|--------|---------------------------------------|-----------------|-----------------|
| `/v1/wa/connections/add`                           | POST   | Create a new connection               | ```json<br>{ "userId": "user_456" }<br>``` | ```json<br>{ "connectionId": "conn_789", "status": "connected", "createdAt": "2024-06-01T12:34:56Z" }<br>``` |
| `/v1/wa/connections/:connectionId/status`          | GET    | Retrieve connection status            | —               | ```json<br>{ "connectionId": "conn_789", "status": "connected", "lastUpdated": "2024-06-01T12:45:00Z" }<br>``` |
| `/v1/wa/messages/send`                             | POST   | Send a message through a connection   | ```json<br>{ "connectionId": "conn_789", "message": "Hello, world!" }<br>``` | ```json<br>{ "messageId": "msg_123", "status": "sent", "timestamp": "2024-06-01T12:46:00Z" }<br>``` |
| `/v1/wa/connections/:connectionId/status`          | PUT    | Update connection state               | ```json<br>{ "status": "active" }<br>``` | ```json<br>{ "connectionId": "conn_789", "status": "active", "updatedAt": "2024-06-01T12:47:00Z" }<br>``` |
| `/v1/wa/connections/:connectionId/disconnect`      | POST   | Terminate a connection                | —               | ```json<br>{ "connectionId": "conn_789", "status": "disconnected", "disconnectedAt": "2024-06-01T12:50:00Z" }<br>``` |


All APIs require authentication tokens and support JSON payloads.

## Session Manager Singleton Class

The Session Manager is typically implemented as a singleton class to ensure that only one instance of the manager exists throughout the application lifecycle. This design guarantees centralized management of sessions, consistent state, and prevents conflicting updates from multiple manager instances.

The singleton pattern is achieved by making the constructor private and exposing a static `getInstance()` method. This method either creates the instance (if it doesn't exist) or returns the existing one. The singleton `SessionManager` holds references to the `SessionStore` (for session persistence) and `WorkerPool` (for request processing), and exposes methods to interact with connection APIs.

### Example Implementation

```typescript
export class SessionManager {
  private static instance: SessionManager;
  private sessionStore: SessionStore;
  private workerPool: WorkerPool;

  private constructor() {
    this.sessionStore = new SessionStore();
    this.workerPool = new WorkerPool();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async handleConnection(userId: string) {
    const connection = await this.sessionStore.createSession(userId);
    return connection;
  }

  async handleMessageSend(connectionId: string, message: string) {
    const session = await this.sessionStore.getSession(connectionId);
    if (!session) throw new Error('Connection not found');
    const worker = this.workerPool.getWorkerForSession(connectionId);
    const result = await worker.processRequest(connectionId, { message });
    await this.sessionStore.updateSession(connectionId, result.updatedState);
    return result.response;
  }
}
```

**Benefits:** Using a singleton for the Session Manager provides centralized control, reduces resource duplication, and simplifies scaling and coordination across the application.

## Session Manager Code Example

```typescript
import express from 'express';
import { SessionStore } from './sessionStore';
import { WorkerPool } from './workerPool';

const app = express();
app.use(express.json());

const sessionStore = new SessionStore();
const workerPool = new WorkerPool();

app.post('/v1/wa/connections/add', async (req, res) => {
  const connection = await sessionStore.createSession(req.body.userId);
  res.status(201).json({
    connectionId: connection.session_id,
    status: connection.state,
    createdAt: connection.last_updated,
  });
});

app.post('/v1/wa/messages/send', async (req, res) => {
  const { connectionId, message } = req.body;
  const session = await sessionStore.getSession(connectionId);
  if (!session) return res.status(404).send('Connection not found');

  const worker = workerPool.getWorkerForSession(connectionId);
  const result = await worker.processRequest(connectionId, { message });
  await sessionStore.updateSession(connectionId, result.updatedState);

  res.json({
    messageId: result.response.messageId,
    status: result.response.status,
    timestamp: result.response.timestamp,
  });
});

app.get('/v1/wa/connections/:connectionId/status', async (req, res) => {
  const { connectionId } = req.params;
  const session = await sessionStore.getSession(connectionId);
  if (!session) return res.status(404).send('Connection not found');

  res.json({
    connectionId: session.session_id,
    status: session.state,
    lastUpdated: session.last_updated,
  });
});

app.put('/v1/wa/connections/:connectionId/status', async (req, res) => {
  const { connectionId } = req.params;
  const { status } = req.body;
  const session = await sessionStore.getSession(connectionId);
  if (!session) return res.status(404).send('Connection not found');

  await sessionStore.updateSession(connectionId, { state: status });
  res.json({
    connectionId,
    status,
    updatedAt: new Date().toISOString(),
  });
});

app.post('/v1/wa/connections/:connectionId/disconnect', async (req, res) => {
  const { connectionId } = req.params;
  const session = await sessionStore.getSession(connectionId);
  if (!session) return res.status(404).send('Connection not found');

  await sessionStore.updateSession(connectionId, { state: 'disconnected' });
  res.json({
    connectionId,
    status: 'disconnected',
    disconnectedAt: new Date().toISOString(),
  });
});

app.listen(3000, () => console.log('Connection Manager running on port 3000'));
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
