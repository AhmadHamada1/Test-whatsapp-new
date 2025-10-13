# 📱 WhatsApp WebJS API Wrapper

A lightweight Node.js + Express API wrapper built on top of [whatsapp-web.js](https://wwebjs.dev/).  
It allows external applications to connect WhatsApp accounts, send messages, and manage multiple sessions programmatically through REST APIs.

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

## 🏗 Tech Stack

| Component | Technology |
|------------|-------------|
| **Backend Framework** | Node.js + Express.js |
| **WhatsApp API** | [whatsapp-web.js](https://wwebjs.dev/) |
| **Database** | MongoDB (with Mongoose ORM) |
| **QR Generation** | `qrcode` npm package |
| **Session Management** | MongoDB persistence layer |
| **Language** | JavaScript / TypeScript (optional) |

---

## 📡 API Endpoints

### 1. `POST /wa/add-number`
Start a new WhatsApp connection and return a QR code for scanning.

**Response:**
```json
{
  "connectionId": "abc123",
  "status": "pending",
  "qr": "data:image/png;base64,..."
}
```

**Behavior:**
- Generates a unique connection ID
- Returns QR code as Base64
- Listens for authentication and connection events
- Updates MongoDB once connected

---

### 2. `POST /wa/disconnect/:connectionId`
Disconnects and archives the WhatsApp connection.

**Response:**
```json
{
  "message": "Connection abc123 disconnected and archived."
}
```

**Behavior:**
- Stops the client instance  
- Removes session cache  
- Updates database state to `disconnected`  

---

### 3. `POST /wa/send/:connectionId`
Sends a message through a connected WhatsApp session.

**Request Body:**
```json
{
  "to": "923001234567",
  "message": "Hello from API!"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "AB12345",
  "timestamp": "2025-10-13T12:00:00Z"
}
```

**Behavior:**
- Validates connection  
- Refreshes session if needed  
- Sends the message through WhatsApp  

---

### 4. `GET /wa/connections`
Returns a list of all connections with their statuses.

**Response:**
```json
[
  {
    "connectionId": "abc123",
    "status": "connected",
    "number": "923001234567",
    "lastActive": "2025-10-13T12:00:00Z"
  }
]
```

---

## 🧩 Architecture Overview

```
src/
 ┣ 📁 models/
 ┃ ┗ connection.model.js
 ┣ 📁 services/
 ┃ ┗ whatsapp.service.js
 ┣ 📁 routes/
 ┃ ┗ wa.routes.js
 ┣ 📁 controllers/
 ┃ ┗ wa.controller.js
 ┣ 📁 utils/
 ┃ ┗ qrcode.util.js
 ┣ server.js
```

### Key Components

- **Connection Model:** stores session state, profile info, timestamps, etc.  
- **WhatsApp Service:** manages multiple WhatsApp clients, sessions, and event listeners.  
- **Controller Layer:** handles HTTP requests and responses.  
- **Routes:** define Express endpoints for `/wa/*` APIs.  

---

## 🧠 Connection Lifecycle

1. **Add Number (`/wa/add-number`)**
   - Creates a new WhatsApp client
   - Returns QR code to be scanned
   - Saves session and updates DB when connected

2. **Send Message (`/wa/send/:id`)**
   - Validates if the client is active
   - Refreshes session automatically if needed
   - Sends message through WhatsApp

3. **Disconnect (`/wa/disconnect/:id`)**
   - Gracefully closes the connection
   - Archives record in MongoDB

4. **Retrieve All (`/wa/connections`)**
   - Fetches all connections with their current state

---

## 💾 MongoDB Schema (Connection Example)

```js
{
  connectionId: String,
  status: String, // 'pending' | 'connected' | 'disconnected'
  whatsappNumber: String,
  profileInfo: Object,
  sessionData: Object,
  lastActive: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔥 Event Handling

| Event | Description | Action |
|--------|--------------|--------|
| `qr` | QR generated | Send QR image to client |
| `authenticated` | Auth success | Update DB, mark as connected |
| `ready` | Client ready | Store profile info |
| `disconnected` | Session closed | Update DB, clean cache |

---

## 🧰 Installation & Setup

```bash
# Clone repository
git clone https://github.com/yourname/whatsapp-api-wrapper.git
cd whatsapp-api-wrapper

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

### .env Example
```
MONGO_URI=mongodb://localhost:27017/whatsapp_api
PORT=5000
SESSION_DIR=./sessions
```

### Run Server
```bash
npm start
```

API will be available at `http://localhost:5000`

---

## 🧭 Future Enhancements

- ✅ WebSocket / SSE for real-time message & QR updates  
- ✅ Message delivery status tracking  
- ✅ Multi-tenant support with API keys  
- ✅ Role-based access control  
- ✅ Web dashboard for session monitoring  

---

## 🧑‍💻 Author
**Muhammad Ali** — [TheHexaTown](https://thehexatown.com)

---

## 📝 License
This project is proprietary and not open-sourced.  
All rights reserved © 2025 Muhammad Ali.