# WhatsApp Server

This is the WhatsApp Web Bot server that handles WhatsApp connections and messaging functionality. It's a separate Express.js server that runs independently from the main admin server.

## Features

- WhatsApp Web.js integration
- QR code generation for device pairing
- Message sending (text and media)
- Connection management
- Session persistence with MongoDB
- API key authentication
- Health monitoring

## API Endpoints

- `POST /wa/add-number` - Start WhatsApp connection and get QR code
- `GET /wa/status` - Get connection status
- `GET /wa/status/:connectionId` - Get specific connection status
- `GET /wa/connections` - List all connections for API key
- `POST /wa/disconnect/:connectionId` - Disconnect specific connection
- `POST /wa/send` - Send message (text or media)
- `GET /healthz` - Health check

## Environment Variables

```env
NODE_ENV=development
PORT=4001
MONGODB_URI=mongodb://localhost:27017/whatsapp-bot
JWT_SECRET=change-me-jwt
MAIN_SERVER_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build the image
docker build -t wa-server .
```

## Architecture

This server is designed to be a microservice that handles only WhatsApp-related functionality:

- **Main Server**: Handles admin authentication, API key management, and dashboard
- **WA Server**: Handles WhatsApp connections, messaging, and session management

Both servers share the same MongoDB database for data consistency.

## Dependencies

- Express.js for HTTP server
- WhatsApp Web.js for WhatsApp integration
- MongoDB for data persistence
- Zod for request validation
- Helmet for security
- CORS for cross-origin requests
