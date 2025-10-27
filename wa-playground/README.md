# WhatsApp Business Manager

A full-stack Next.js application for managing WhatsApp Business API connections and sending messages.

## Features

- 🔐 API Key Authentication
- 📱 Device Connection Management
- 📊 QR Code Generation for Device Pairing
- 💬 Message Sending Interface
- 📜 Message History & Status Tracking
- 🎨 Modern UI with shadcn/ui Components

## Getting Started

### Prerequisites

- Node.js 18+ installed
- WhatsApp Business API credentials (for production use)

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
├── app/
│   ├── api/                    # API routes
│   │   ├── connections/        # Connection management endpoints
│   │   └── messages/           # Message endpoints
│   ├── page.tsx                # Main dashboard
│   └── layout.tsx              # Root layout
├── components/
│   ├── api-key-setup.tsx       # API key entry form
│   ├── connections-list.tsx    # Connection list display
│   ├── add-connection-dialog.tsx  # New connection dialog
│   ├── send-message-dialog.tsx    # Message sending dialog
│   └── message-history-dialog.tsx # Message history viewer
├── contexts/
│   └── api-context.tsx         # Global state management
├── lib/
│   ├── api-client.ts           # API client for backend calls
│   └── types.ts                # TypeScript type definitions
└── README.md
\`\`\`

## API Routes

### Connections

- `GET /api/connections` - Fetch all connections
- `POST /api/connections` - Create new connection
- `GET /api/connections/[id]` - Fetch specific connection
- `PATCH /api/connections/[id]` - Update connection status
- `DELETE /api/connections/[id]` - Delete connection
- `GET /api/connections/[id]/qr` - Generate QR code

### Messages

- `GET /api/messages?connectionId={id}` - Fetch messages for connection
- `POST /api/messages` - Send a message
- `GET /api/messages/[id]` - Fetch message status

## Authentication

All API requests require an `x-api-key` header with a valid API key.

## Development Notes

- Currently uses localStorage for client-side data persistence
- API routes are scaffolded but need WhatsApp Business API integration
- For production, replace localStorage with a proper database (Supabase, Neon, etc.)
- Add environment variables for WhatsApp Business API credentials

## Next Steps for Production

1. **Database Integration**: Replace localStorage with Supabase or Neon
2. **WhatsApp Business API**: Integrate official WhatsApp Business API
3. **Webhooks**: Add webhook handlers for incoming messages
4. **Authentication**: Implement proper user authentication (NextAuth.js)
5. **Rate Limiting**: Add rate limiting to API routes
6. **Error Handling**: Enhance error handling and logging
7. **Testing**: Add unit and integration tests

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: React Context API
- **QR Codes**: qrcode library

## License

MIT
