# WhatsApp Web Bot - Technical Architecture

## 🏗️ System Architecture

### High-Level Overview
The WhatsApp Web Bot is built as a microservice architecture that separates concerns between the main admin server and the WhatsApp-specific functionality. This design enables independent scaling, deployment, and maintenance of WhatsApp features.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile Client  │    │  Third-party    │
│   (Dashboard)   │    │   (WhatsApp)    │    │   Applications  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer                           │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway                                  │
│              (Authentication & Routing)                        │
└─────────────────┬───────────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌─────────────┐    ┌─────────────────┐
│ Main Server │    │   WA Server     │
│ (Admin API) │    │ (WhatsApp API)  │
└─────────────┘    └─────────────────┘
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
        ┌─────────────────┐
        │    MongoDB      │
        │   (Shared DB)   │
        └─────────────────┘
```

## 🔧 WA Server Architecture

### Component Overview
The WA Server is designed as a single-purpose microservice focused exclusively on WhatsApp functionality.

```
┌─────────────────────────────────────────────────────────────────┐
│                        WA Server                                │
├─────────────────────────────────────────────────────────────────┤
│  Express.js Application                                         │
│  ├── Routes Layer                                               │
│  ├── Middleware Layer                                           │
│  ├── Controller Layer                                           │
│  └── Service Layer                                              │
├─────────────────────────────────────────────────────────────────┤
│  WhatsApp Web.js Integration                                    │
│  ├── Client Management                                          │
│  ├── Session Persistence                                        │
│  ├── Message Handling                                           │
│  └── Connection Lifecycle                                       │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer                                                     │
│  ├── MongoDB Models                                             │
│  ├── Session Storage                                            │
│  └── Connection Management                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Detailed Component Breakdown

#### 1. Application Layer
- **Express.js Server**: HTTP server handling API requests
- **Route Handlers**: RESTful endpoint definitions
- **Middleware Stack**: Authentication, validation, logging, error handling
- **CORS Configuration**: Cross-origin request handling

#### 2. Business Logic Layer
- **WhatsApp Service**: Core WhatsApp Web.js integration
- **Connection Manager**: Connection lifecycle management
- **Message Service**: Message sending and handling
- **QR Code Service**: QR code generation and management

#### 3. Data Layer
- **MongoDB Integration**: Database connectivity and models
- **Session Storage**: WhatsApp session persistence
- **Connection Models**: Database schemas for connections and API keys

## 📊 Data Flow Architecture

### 1. Connection Establishment Flow
```
Client Request → API Gateway → WA Server → WhatsApp Web.js → QR Code → Client
     ↓              ↓            ↓            ↓
  API Key      Authentication  Validation  Session Start
  Validation   & Routing      & Processing  & QR Generation
```

### 2. Message Sending Flow
```
Client Request → API Gateway → WA Server → WhatsApp Web.js → WhatsApp API → Recipient
     ↓              ↓            ↓            ↓              ↓
  Message      Authentication  Validation  Client Ready   Message
  Validation   & Routing      & Processing  Check         Delivery
```

### 3. Status Monitoring Flow
```
Client Request → API Gateway → WA Server → Connection Status → Response
     ↓              ↓            ↓            ↓
  API Key      Authentication  Status      Real-time
  Validation   & Routing      Check       Status Data
```

## 🗄️ Database Schema

### Core Collections

#### 1. ApiKeys Collection
```javascript
{
  _id: ObjectId,
  label: String,
  tokenHash: String,        // SHA-256 hash of API key
  tokenPrefix: String,      // First 8 characters for identification
  status: String,           // "active" | "revoked"
  createdBy: ObjectId,      // Reference to Admin
  usageCount: Number,       // Total API calls
  lastUsedAt: Date,         // Last API call timestamp
  revokedAt: Date,          // Revocation timestamp
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. WaConnections Collection
```javascript
{
  _id: ObjectId,
  apiKey: ObjectId,         // Reference to ApiKey
  status: String,           // Connection status
  connectionStep: String,   // Current step in connection process
  
  // QR Code fields
  lastQr: String,           // Last generated QR code
  lastQrAt: Date,           // QR generation timestamp
  
  // Timeline fields
  authenticatedAt: Date,    // Authentication timestamp
  readyAt: Date,            // Ready timestamp
  authFailedAt: Date,       // Auth failure timestamp
  disconnectedAt: Date,     // Disconnection timestamp
  
  // Error handling
  error: String,            // Error message
  disconnectReason: String, // Disconnection reason
  
  // WhatsApp account info
  phoneNumber: String,      // WhatsApp phone number
  whatsappId: String,       // Full WhatsApp ID
  profileName: String,      // Display name
  platform: String,         // Device platform
  profilePictureUrl: String,// Profile picture URL
  statusMessage: String,    // Status message
  lastSeen: Date,           // Last seen timestamp
  
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 State Management

### Connection States
The system manages WhatsApp connections through a well-defined state machine:

```
not_started → pending → authenticated → ready
     ↓           ↓           ↓           ↓
     └───────────┴───────────┴───────────┴→ auth_failed
     └─────────────────────────────────────→ disconnected
```

### State Transitions
1. **not_started**: Initial state, no connection attempt
2. **pending**: QR code generated, waiting for scan
3. **authenticated**: WhatsApp authenticated, finalizing
4. **ready**: Fully connected, ready to send messages
5. **auth_failed**: Authentication failed, needs retry
6. **disconnected**: Connection lost, needs reconnection

## 🚀 Performance Architecture

### 1. In-Memory Caching
- **Client Instances**: Active WhatsApp clients cached in memory
- **Connection Status**: Real-time connection status caching
- **QR Code Data**: Temporary QR code storage for active connections

### 2. Database Optimization
- **Indexes**: Optimized indexes for common queries
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Optimized queries for performance

### 3. Scalability Features
- **Horizontal Scaling**: Multiple server instances
- **Load Distribution**: Even load distribution across instances
- **Session Affinity**: Consistent session handling

## 🔒 Security Architecture

### 1. Authentication & Authorization
- **API Key Authentication**: SHA-256 hashed API keys
- **Request Validation**: Comprehensive input validation
- **Rate Limiting**: Per-API key rate limiting
- **CORS Protection**: Configurable cross-origin policies

### 2. Data Security
- **Encryption at Rest**: Encrypted database storage
- **Encryption in Transit**: HTTPS/TLS for all communications
- **Session Security**: Secure WhatsApp session management
- **Input Sanitization**: Protection against injection attacks

### 3. Privacy & Compliance
- **Data Minimization**: Only collect necessary data
- **Audit Logging**: Comprehensive audit trails
- **Data Retention**: Configurable retention policies
- **GDPR Compliance**: European data protection compliance

## 📈 Monitoring & Observability

### 1. Health Monitoring
- **Health Checks**: Built-in health monitoring endpoints
- **Connection Status**: Real-time connection health monitoring
- **Performance Metrics**: Response time and throughput tracking
- **Error Tracking**: Comprehensive error logging and alerting

### 2. Logging Strategy
- **Structured Logging**: JSON-formatted logs for easy parsing
- **Log Levels**: Debug, info, warn, error levels
- **Request Logging**: Complete API request/response logging
- **Error Logging**: Detailed error information and stack traces

### 3. Metrics & Analytics
- **Usage Metrics**: API usage and message volume tracking
- **Performance Metrics**: Response time and throughput metrics
- **Error Metrics**: Error rates and types tracking
- **Business Metrics**: Connection success rates and user engagement

## 🐳 Deployment Architecture

### 1. Containerization
- **Docker**: Containerized application for consistent deployment
- **Multi-stage Builds**: Optimized Docker images
- **Health Checks**: Container health monitoring
- **Resource Limits**: CPU and memory limits

### 2. Orchestration
- **Docker Compose**: Local development and testing
- **Kubernetes**: Production orchestration (planned)
- **Service Discovery**: Automatic service discovery
- **Load Balancing**: Built-in load balancing

### 3. Infrastructure
- **Cloud Deployment**: AWS, Azure, GCP support
- **Auto-scaling**: Automatic scaling based on demand
- **Multi-region**: Global deployment capabilities
- **CDN Integration**: Content delivery network support

## 🔄 Integration Patterns

### 1. API Integration
- **RESTful Design**: Standard REST API patterns
- **JSON Communication**: JSON request/response format
- **HTTP Status Codes**: Standard HTTP status code usage
- **Error Handling**: Consistent error response format

### 2. Webhook Integration (Planned)
- **Event Notifications**: Real-time event notifications
- **Retry Logic**: Automatic retry for failed webhooks
- **Signature Verification**: Webhook signature validation
- **Rate Limiting**: Webhook delivery rate limiting

### 3. SDK Integration
- **Language Support**: Multiple programming language support
- **Code Examples**: Comprehensive code examples
- **Documentation**: Detailed integration documentation
- **Testing Tools**: Testing and debugging tools
