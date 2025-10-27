# WhatsApp Web Bot Server

A robust TypeScript-based API server that provides WhatsApp Web functionality through a REST API. Built with Express.js, MongoDB, and WhatsApp Web.js library.

## 🚀 Features

- **WhatsApp Web Integration**: Connect and manage multiple WhatsApp sessions
- **RESTful API**: Clean and well-documented API endpoints
- **Session Management**: Handle multiple WhatsApp sessions concurrently
- **API Key Authentication**: Secure API access with key-based authentication
- **MongoDB Integration**: Persistent data storage for sessions and API keys
- **TypeScript**: Full type safety and modern JavaScript features
- **Swagger Documentation**: Interactive API documentation
- **Health Monitoring**: Built-in health check endpoints
- **Error Handling**: Comprehensive error handling and logging
- **Testing**: Jest-based testing suite

## 📋 Prerequisites

- **Node.js**: >= 18.0.0
- **MongoDB**: >= 4.4
- **npm**: >= 8.0.0

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wa-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=4001
   MONGODB_URI=mongodb://localhost:27017/wa-server
   API_KEY_SECRET=your-secret-key-here
   ```

## 🏃‍♂️ Running the Project

### Development Mode

For development with hot reload and TypeScript compilation:

```bash
# Start development server with watch mode
npm run dev
```

This command will:
- Compile TypeScript files in watch mode
- Start the server with nodemon for auto-restart
- Monitor file changes and restart automatically

### Production Mode

For production deployment:

```bash
# Build the project
npm run build

# Start production server
npm start
```

Or run both commands together:
```bash
npm run start:ts
```

### Other Available Scripts

```bash
# Run tests
npm test

# Build TypeScript files
npm run build

# Build with watch mode
npm run build:watch

# Start TypeScript development server
npm run dev:ts
```

## 📁 Project Structure

```
wa-server/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── index.ts              # Server entry point
│   ├── config/               # Configuration files
│   │   ├── cors.ts           # CORS configuration
│   │   ├── db.ts             # Database connection
│   │   ├── env.ts            # Environment variables
│   │   └── swagger.ts        # API documentation
│   ├── middlewares/          # Express middlewares
│   │   ├── apiLogger.ts      # API request logging
│   │   ├── errorHandler.ts   # Error handling
│   │   ├── requireApiKey.ts  # API key authentication
│   │   └── validate.ts       # Request validation
│   ├── modules/              # Feature modules
│   │   ├── api-key/          # API key management
│   │   ├── health/           # Health check endpoints
│   │   └── wa/               # WhatsApp functionality
│   │       ├── controller.ts # WhatsApp business logic
│   │       ├── router.ts     # WhatsApp routes
│   │       └── lib/          # WhatsApp utilities
│   ├── tests/                # Test files
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
├── dist/                     # Compiled JavaScript files
├── docs/                     # Documentation
└── jest.config.ts           # Jest configuration
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `4001` | No |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `API_KEY_SECRET` | Secret for API key generation | - | Yes |

### TypeScript Configuration

The project uses strict TypeScript configuration with:
- Target: ES2020
- Module: CommonJS
- Strict mode enabled
- Source maps for debugging
- Declaration files generation

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:4001/api-docs`
- **Health Check**: `http://localhost:4001/health`

## 🚀 Deployment

### Using PM2 (Recommended)

1. **Install PM2 globally**
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 ecosystem file** (`ecosystem.config.js`):
   ```javascript
   module.exports = {
     apps: [{
       name: 'wa-server',
       script: 'dist/index.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 4001
       }
     }]
   };
   ```

3. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   ```

### Using Docker

#### Production Deployment

1. **Set up environment variables**:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your actual values
   nano .env
   ```

2. **Build and run with Docker Compose**:
   ```bash
   # Build and start the service
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop the service
   docker-compose down
   ```

3. **Or build and run manually**:
   ```bash
   # Build the image
   docker build -t wa-server .
   
   # Run the container
   docker run -d \
     --name wa-server \
     -p 4001:4001 \
     -e MONGODB_URI=your-mongodb-url \
     -e API_KEY_SECRET=your-secret-key \
     -v wa-sessions:/app/.wwebjs_auth \
     -v wa-cache:/app/.wwebjs_cache \
     wa-server
   ```

#### Development with Docker

```bash
# Run in development mode with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

## 🔍 Monitoring

### Health Check

The server provides a health check endpoint:
```bash
curl http://localhost:4001/health
```

### Logs

The server logs all API requests with response times and status codes. Check console output for detailed logs.

## 🛡️ Security

- API key authentication for all endpoints
- CORS configuration
- Helmet.js for security headers
- Input validation using Zod
- Error handling without sensitive data exposure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the UNLICENSED license.

## 🆘 Support

For support and questions:
- Check the documentation in the `docs/` folder
- Review the API documentation at `/api-docs`
- Check the health endpoint at `/health`

---

**Note**: This server requires a valid MongoDB connection and proper environment configuration to function correctly.
