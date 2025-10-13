# 📱 WhatsApp WebJS API Wrapper

A lightweight Node.js + Express API wrapper built on top of [whatsapp-web.js](https://wwebjs.dev/).  
It enables external applications to connect WhatsApp accounts, send messages, and manage multiple sessions programmatically through REST APIs.

---

## 📚 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [API Endpoints](#-api-endpoints)
- [Connection Lifecycle](#-connection-lifecycle)
- [Session Persistence](#-session-persistence)
- [Receiving Messages](#-receiving-messages)
- [Database Schema](#-database-schema)
- [Event Handling](#-event-handling)
- [Error Handling](#-error-handling)
- [Security](#-security)
- [Scaling & Concurrency](#-scaling--concurrency)
- [Environment Setup](#-environment-setup)
- [Testing & Usage](#-testing--usage)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)
- [License](#-license)

---

## 🚀 Features

- 🔗 Connect WhatsApp numbers using QR codes  
- 🧠 Automatically track connection status and session lifecycle  
- 💬 Send messages through any active connection  
- 🗂 Manage multiple WhatsApp sessions simultaneously  
- 🗃 MongoDB persistence for session data and connection states  
- ⚡ Auto-refresh and keep connections alive on message send  
- 🧩 Simple REST API for integration with any backend or frontend system  

---

## 🏗 Architecture

```
              ┌───────────────────────────────┐
              │         Client App            │
              │ (Dashboard, Mobile, Backend)  │
              └──────────────┬────────────────┘
                             │ REST API
                             ▼
                ┌──────────────────────────────┐
                │     Express.js API Server    │
                │  - Routes (/wa/*)            │
                │  - Controllers               │
                │  - WhatsApp Service Layer    │
                └──────────────┬───────────────┘
                               │
                        WhatsApp-Web.js
                               │
                             WhatsApp
                               │
                               ▼
                         MongoDB (Sessions)
```

### Key Components

- **Connection Model:** Stores session state, profile info, timestamps, etc.  
- **WhatsApp Service:** Manages multiple WhatsApp clients, sessions, and event listeners.  
- **Controller Layer:** Handles HTTP requests and responses.  
- **Routes:** Define Express endpoints for `/wa/*` APIs.  

---

## 📡 API Endpoints

| Method | Endpoint | Description | Request Body | Example Response |
|---------|-----------|-------------|---------------|------------------|
| **POST** | `/wa/add-number` | Creates a new WhatsApp client session and returns a QR code for device linking. | — | `{ "connectionId": "abc123", "status": "pending", "qr": "data:image/png;base64,..." }` |
| **POST** | `/wa/disconnect/:connectionId` | Disconnects and archives an existing WhatsApp connection. | — | `{ "message": "Connection abc123 disconnected and archived." }` |
| **POST** | `/wa/send/:connectionId` | Sends a message using a specific active WhatsApp connection. | `{ "to": "923001234567", "message": "Hello from API!" }` | `{ "success": true, "messageId": "AB12345", "timestamp": "2025-10-13T12:00:00Z" }` |
| **GET** | `/wa/connections` | Retrieves all existing WhatsApp connections with their current states. | — | `[ { "connectionId": "abc123", "status": "connected", "number": "923001234567", "lastActive": "2025-10-13T12:00:00Z" } ]` |

---

## 🧠 Connection Lifecycle

1. **Add Number (`/wa/add-number`)**
   - Creates a new WhatsApp client
   - Returns QR code for scanning
   - Saves session and updates DB when connected

2. **Send Message (`/wa/send/:id`)**
   - Validates client state
   - Restores session automatically if expired
   - Sends message through WhatsApp

3. **Disconnect (`/wa/disconnect/:id`)**
   - Gracefully closes the connection
   - Archives record in MongoDB

4. **Retrieve All (`/wa/connections`)**
   - Fetches all connections with their state

---

## 🧠 Session Persistence

Each WhatsApp client generates a unique session.  
When authenticated, session credentials are **serialized** and stored in MongoDB.

### On Server Restart
- The WhatsApp Service rehydrates all active sessions.  
- Clients reconnect automatically using stored session data.  
- Expired sessions are marked as `disconnected`.

---

## 📨 Receiving Messages

The system listens for incoming messages on connected clients:

```js
client.on('message', async (msg) => {
  console.log(`Message from ${msg.from}: ${msg.body}`);
});
```

Future versions may expose `/wa/webhook` for external message forwarding.

---

## 💾 Database Schema

Example **Mongoose Schema** for connection state:

```js
import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  connectionId: { type: String, unique: true, required: true },
  status: { type: String, enum: ['pending', 'connected', 'disconnected'], default: 'pending' },
  whatsappNumber: String,
  profileInfo: Object,
  sessionData: Object,
  lastActive: Date
}, { timestamps: true });

export default mongoose.model('Connection', connectionSchema);
```

---

## 🔥 Event Handling

| Event | Description | Action |
|--------|--------------|--------|
| `qr` | QR generated | Send QR image to client |
| `authenticated` | Authentication successful | Update DB, mark as connected |
| `ready` | Client ready | Store profile info |
| `message` | Message received | Log or forward to webhook |
| `disconnected` | Session closed | Update DB, clean cache |

---

## ⚠️ Error Handling

All endpoints return structured error responses:

```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "No active connection found for this ID"
  }
}
```

### Common Error Codes
| Code | Description |
|------|--------------|
| `INVALID_REQUEST` | Missing or malformed parameters |
| `SESSION_NOT_FOUND` | Connection ID not found or expired |
| `WHATSAPP_NOT_READY` | Client not authenticated yet |
| `MESSAGE_FAILED` | Message delivery failed |
| `SERVER_ERROR` | Internal server or DB issue |

---

## 🔒 Security

For production:
- Protect routes using **API Keys** or **JWT Tokens**
- Validate request origins
- Securely store session files or data
- Avoid logging sensitive info like QR codes or messages
- Restrict access by IP or user role

---

## ⚙️ Scaling & Concurrency

Each WhatsApp client spawns a Chromium instance.

To scale safely:
- Limit concurrent sessions (recommended ≤ 10 per instance)
- Use queues like **BullMQ/Redis** for message delivery
- Use worker processes or containers for horizontal scaling
- Monitor CPU & memory usage
- Gracefully handle restarts with persistent session recovery

---

## 🧰 Environment Setup

```bash
# Clone repository
git clone https://github.com/yourname/whatsapp-api-wrapper.git
cd whatsapp-api-wrapper

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

### .env Example

```
MONGO_URI=mongodb://localhost:27017/whatsapp_api
PORT=5000
SESSION_DIR=./sessions
```

| Variable | Description |
|-----------|--------------|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Express server port |
| `SESSION_DIR` | Directory for temporary session cache |

### Run Server
```bash
npm start
```

API will be live at: `http://localhost:5000`

---

## 🧪 Testing & Usage

### Example with cURL

```bash
# Add a number
curl -X POST http://localhost:5000/wa/add-number

# Send a message
curl -X POST http://localhost:5000/wa/send/abc123 \
  -H "Content-Type: application/json" \
  -d '{"to": "923001234567", "message": "Hello!"}'
```

You can also import the included Postman collection for easier testing.

---

## 🧭 Future Enhancements

- ✅ WebSocket / SSE for real-time updates  
- ✅ Message delivery tracking  
- ✅ Multi-tenant support with API keys  
- ✅ Web dashboard for managing sessions  
- ✅ Role-based access control  

---

## 🧑‍💻 Author
**Muhammad Ali** — [TheHexaTown](https://thehexatown.com)

---

## 📝 License
This project is **proprietary** and intended for internal or client use under contract.  
Distribution, resale, or reuse without written permission is prohibited.  
© 2025 Muhammad Ali.