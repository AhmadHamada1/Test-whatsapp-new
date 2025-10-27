# ERD Architecture of WhatsApp Web Bot System

## 1. Overview

The ERD (Entity-Relationship Diagram) architecture for the WhatsApp Web Bot system provides a structured representation of the core data entities and their relationships within the system. It serves as a blueprint for understanding how users, connections, messages, workers, and other components interact and persist data. This architecture facilitates scalable management of multiple WhatsApp sessions, message queues, webhook integrations, and authentication flows.

---

## 2. Core Entities / Classes

| Entity / Class          | Description                                                                                   | Key Fields / Attributes                         |
|------------------------|-----------------------------------------------------------------------------------------------|------------------------------------------------|
| **User**               | Represents a user of the system who owns one or more WhatsApp connections.                    | `userId`, `username`, `email`                   |
| **Connection**         | Represents an active WhatsApp connection/session owned by a User.                             | `connectionId`, `userId`, `status`, `deviceInfo` |
| **Message**            | Represents messages sent or received through a connection.                                   | `messageId`, `connectionId`, `content`, `timestamp`, `direction` |
| **Worker**             | Background process that handles message processing, sending, and connection management.       | `workerId`, `connectionId`, `status`            |
| **Webhook**            | Configuration for external HTTP endpoints to receive event notifications.                     | `webhookId`, `connectionId`, `url`, `eventTypes` |
| **SessionStore**       | Persistent storage for session data and authentication credentials.                           | `sessionId`, `connectionId`, `data`              |
| **RemoteAuth**         | Handles remote authentication flows for WhatsApp connections.                                | `authId`, `connectionId`, `authState`            |
| **SessionManager / ConnectionManager** | Manages lifecycle and state of connections and sessions.                              | `managerId`, `activeConnections`                  |
| **QueueJob**           | Represents queued tasks such as sending messages or processing events.                        | `jobId`, `connectionId`, `jobType`, `status`     |

---

## 3. Implementation and API Integration

### User

```typescript
interface User {
  userId: string;
  username: string;
  email: string;
}
```

### Connection

```typescript
class Connection {
  constructor(public connectionId: string, public userId: string, public status: string) {}

  connect() {
    // logic to initiate WhatsApp connection
  }
}
```

**API Usage:**

```http
POST /v1/wa/connection/create
{
  "userId": "123",
  "deviceInfo": "Chrome on Windows"
}
```

---

### Message

```typescript
class Message {
  constructor(
    public messageId: string,
    public connectionId: string,
    public content: string,
    public timestamp: Date,
    public direction: "inbound" | "outbound"
  ) {}

  send() {
    // send message via WhatsApp API
  }
}
```

**API Usage:**

```http
POST /v1/wa/message/send
{
  "connectionId": "abc",
  "content": "Hello, World!"
}
```

---

### Worker

```typescript
class Worker {
  constructor(public workerId: string, public connectionId: string) {}

  processQueue() {
    // process queued jobs for the connection
  }
}
```

---

### Webhook

```typescript
interface Webhook {
  webhookId: string;
  connectionId: string;
  url: string;
  eventTypes: string[];
}

function triggerWebhook(eventType: string, payload: any) {
  // send HTTP POST to webhook url if eventType matches
}
```

---

### SessionStore

```typescript
class SessionStore {
  saveSession(sessionId: string, data: any) {
    // persist session data
  }

  loadSession(sessionId: string) {
    // retrieve session data
  }
}
```

---

### RemoteAuth

```typescript
class RemoteAuth {
  constructor(public authId: string, public connectionId: string) {}

  authenticate() {
    // remote authentication flow
  }
}
```

---

### SessionManager / ConnectionManager

```typescript
class ConnectionManager {
  private activeConnections: Map<string, Connection> = new Map();

  addConnection(connection: Connection) {
    this.activeConnections.set(connection.connectionId, connection);
  }

  removeConnection(connectionId: string) {
    this.activeConnections.delete(connectionId);
  }
}
```

---

### QueueJob

```typescript
interface QueueJob {
  jobId: string;
  connectionId: string;
  jobType: string;
  status: "pending" | "processing" | "completed";
}
```

---

## 4. ERD Relationships

- **User 1 : N Connection** — A user can have multiple WhatsApp connections.
- **Connection 1 : N Message** — Each connection handles many messages.
- **Connection 1 : N Worker** — Multiple workers can be assigned for processing a connection's tasks.
- **Connection 1 : N Webhook** — Each connection can have multiple webhook configurations.
- **Connection 1 : 1 SessionStore** — Each connection has one session store for persistence.
- **Connection 1 : 1 RemoteAuth** — Each connection has one remote authentication handler.
- **ConnectionManager 1 : N Connection** — Manages multiple active connections.
- **Connection 1 : N QueueJob** — Each connection has multiple queued jobs for processing.

---

## 5. Textual Architecture Diagram

```
+---------+        1        +-------------+        1       +------------+
|  User   | --------------< | Connection  | --------------< |  Message   |
+---------+                 +-------------+                +------------+
                              |   1   | 1
                              |       |
                              v       v
                        +---------+ +---------+
                        | Worker  | | Webhook |
                        +---------+ +---------+
                              |
                              v
                      +----------------+
                      | SessionStore   |
                      +----------------+
                              |
                              v
                      +----------------+
                      | RemoteAuth     |
                      +----------------+

ConnectionManager
      |
      v
+----------------+
| Connection(s)  |
+----------------+

Connection
   |
   v
+----------+
| QueueJob |
+----------+
```

---

## 6. Summary

The WhatsApp Web Bot system orchestrates multiple components to provide real-time messaging capabilities. Users own connections representing WhatsApp sessions. Each connection manages its messages, workers, webhooks, and session data. The ConnectionManager oversees active connections, while workers asynchronously process queued jobs such as sending messages or handling events. Remote authentication ensures secure session management. Webhooks allow external systems to receive event notifications. The API endpoints (e.g., `/v1/wa/connection/create`, `/v1/wa/message/send`) provide interfaces for clients to interact with these entities, enabling seamless integration with the WhatsApp network.

---

![ERD Architecture Diagram](./ERD_ARCHITECTURE_DIAGRAM.png)
