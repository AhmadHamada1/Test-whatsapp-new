# WhatsApp Web Bot - User Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB database access
- Valid API key from the main server
- WhatsApp mobile app for QR code scanning

### Quick Start
1. **Install Dependencies**
   ```bash
   cd wa-server
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the Server**
   ```bash
   npm run dev
   ```

4. **Access Documentation**
   - Open `http://localhost:4001/api-docs` for interactive API documentation
   - API JSON spec available at `http://localhost:4001/api-docs-json`

## 📱 Setting Up WhatsApp Connection

### Step 1: Create a Connection
Send a POST request to create a new WhatsApp connection:

```bash
curl -X POST http://localhost:4001/wa/add-number \
  -H "x-api-key: your-api-key-here" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "connectionId": "507f1f77bcf86cd799439011",
    "alreadyConnected": false,
    "qr": "2@ABC123DEF456...",
    "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

### Step 2: Scan QR Code
1. Open the `qrImage` data URL in your browser or save it as an image
2. Open WhatsApp on your mobile device
3. Go to Settings > Linked Devices > Link a Device
4. Scan the QR code
5. Wait for the connection to be established

### Step 3: Verify Connection
Check the connection status:

```bash
curl -X GET http://localhost:4001/wa/status/507f1f77bcf86cd799439011 \
  -H "x-api-key: your-api-key-here"
```

**Response when ready:**
```json
{
  "ok": true,
  "data": {
    "connectionId": "507f1f77bcf86cd799439011",
    "status": "ready",
    "connectionStep": "ready",
    "isReady": true,
    "message": "WhatsApp is connected and ready to send messages!",
    "accountInfo": {
      "phoneNumber": "1234567890",
      "whatsappId": "1234567890@c.us",
      "profileName": "John Doe",
      "platform": "android"
    }
  }
}
```

## 💬 Sending Messages

### Text Messages
Send a simple text message:

```bash
curl -X POST http://localhost:4001/wa/send \
  -H "x-api-key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "text": "Hello from WhatsApp Bot!",
    "connectionId": "507f1f77bcf86cd799439011"
  }'
```

### Media Messages
Send an image, document, or other media:

```bash
curl -X POST http://localhost:4001/wa/send \
  -H "x-api-key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "media": {
      "mimetype": "image/png",
      "filename": "image.png",
      "dataBase64": "iVBORw0KGgoAAAANSUhEUgAA..."
    },
    "connectionId": "507f1f77bcf86cd799439011"
  }'
```

## 🔧 Integration Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

class WhatsAppBot {
  constructor(apiKey, baseUrl = 'http://localhost:4001') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    };
  }

  async createConnection() {
    const response = await axios.post(`${this.baseUrl}/wa/add-number`, {}, {
      headers: this.headers
    });
    return response.data;
  }

  async getConnectionStatus(connectionId) {
    const response = await axios.get(`${this.baseUrl}/wa/status/${connectionId}`, {
      headers: this.headers
    });
    return response.data;
  }

  async sendMessage(to, text, connectionId) {
    const response = await axios.post(`${this.baseUrl}/wa/send`, {
      to,
      text,
      connectionId
    }, {
      headers: this.headers
    });
    return response.data;
  }

  async sendMedia(to, media, connectionId) {
    const response = await axios.post(`${this.baseUrl}/wa/send`, {
      to,
      media,
      connectionId
    }, {
      headers: this.headers
    });
    return response.data;
  }
}

// Usage
const bot = new WhatsAppBot('your-api-key-here');

// Create connection
const connection = await bot.createConnection();
console.log('QR Code:', connection.data.qrImage);

// Wait for connection to be ready, then send message
const status = await bot.getConnectionStatus(connection.data.connectionId);
if (status.data.isReady) {
  await bot.sendMessage('1234567890', 'Hello!', connection.data.connectionId);
}
```

### Python
```python
import requests
import base64
import time

class WhatsAppBot:
    def __init__(self, api_key, base_url='http://localhost:4001'):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'x-api-key': api_key,
            'Content-Type': 'application/json'
        }

    def create_connection(self):
        response = requests.post(f'{self.base_url}/wa/add-number', 
                               headers=self.headers)
        return response.json()

    def get_connection_status(self, connection_id):
        response = requests.get(f'{self.base_url}/wa/status/{connection_id}', 
                              headers=self.headers)
        return response.json()

    def send_message(self, to, text, connection_id):
        data = {
            'to': to,
            'text': text,
            'connectionId': connection_id
        }
        response = requests.post(f'{self.base_url}/wa/send', 
                               json=data, headers=self.headers)
        return response.json()

    def send_media(self, to, media_path, connection_id):
        with open(media_path, 'rb') as f:
            media_data = base64.b64encode(f.read()).decode('utf-8')
        
        data = {
            'to': to,
            'media': {
                'mimetype': 'image/png',
                'filename': 'image.png',
                'dataBase64': media_data
            },
            'connectionId': connection_id
        }
        response = requests.post(f'{self.base_url}/wa/send', 
                               json=data, headers=self.headers)
        return response.json()

# Usage
bot = WhatsAppBot('your-api-key-here')

# Create connection
connection = bot.create_connection()
print(f"QR Code: {connection['data']['qrImage']}")

# Wait for connection to be ready
while True:
    status = bot.get_connection_status(connection['data']['connectionId'])
    if status['data']['isReady']:
        break
    time.sleep(5)

# Send message
result = bot.send_message('1234567890', 'Hello from Python!', 
                         connection['data']['connectionId'])
print(f"Message sent: {result}")
```

### PHP
```php
<?php
class WhatsAppBot {
    private $apiKey;
    private $baseUrl;
    private $headers;

    public function __construct($apiKey, $baseUrl = 'http://localhost:4001') {
        $this->apiKey = $apiKey;
        $this->baseUrl = $baseUrl;
        $this->headers = [
            'x-api-key: ' . $apiKey,
            'Content-Type: application/json'
        ];
    }

    public function createConnection() {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/wa/add-number');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }

    public function getConnectionStatus($connectionId) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/wa/status/' . $connectionId);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }

    public function sendMessage($to, $text, $connectionId) {
        $data = [
            'to' => $to,
            'text' => $text,
            'connectionId' => $connectionId
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/wa/send');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $this->headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
}

// Usage
$bot = new WhatsAppBot('your-api-key-here');

// Create connection
$connection = $bot->createConnection();
echo "QR Code: " . $connection['data']['qrImage'] . "\n";

// Wait for connection to be ready
do {
    $status = $bot->getConnectionStatus($connection['data']['connectionId']);
    sleep(5);
} while (!$status['data']['isReady']);

// Send message
$result = $bot->sendMessage('1234567890', 'Hello from PHP!', 
                           $connection['data']['connectionId']);
echo "Message sent: " . json_encode($result) . "\n";
?>
```

## 🔍 Monitoring & Troubleshooting

### Health Check
Check if the server is running:

```bash
curl http://localhost:4001/healthz
```

**Response:**
```json
{
  "ok": true,
  "service": "wa-server"
}
```

### List Connections
Get all connections for your API key:

```bash
curl -X GET http://localhost:4001/wa/connections \
  -H "x-api-key: your-api-key-here"
```

### Disconnect Connection
Disconnect a specific connection:

```bash
curl -X POST http://localhost:4001/wa/disconnect/507f1f77bcf86cd799439011 \
  -H "x-api-key: your-api-key-here"
```

## ⚠️ Common Issues & Solutions

### Connection Issues
1. **QR Code Not Working**
   - Ensure WhatsApp mobile app is updated
   - Try generating a new QR code
   - Check if the connection is already established

2. **Connection Keeps Disconnecting**
   - Check internet connectivity
   - Ensure WhatsApp mobile app is active
   - Verify the connection is not being used elsewhere

3. **Authentication Failed**
   - Clear WhatsApp data and try again
   - Ensure the phone number is correct
   - Check if the account is banned or restricted

### API Issues
1. **Invalid API Key**
   - Verify the API key is correct
   - Check if the API key is active
   - Ensure the API key has proper permissions

2. **Rate Limiting**
   - Implement proper rate limiting in your application
   - Use exponential backoff for retries
   - Monitor your API usage

3. **Validation Errors**
   - Check request format and required fields
   - Ensure phone numbers are in correct format
   - Verify media files are properly encoded

## 📚 Best Practices

### 1. Connection Management
- Always check connection status before sending messages
- Implement proper error handling and retry logic
- Monitor connection health regularly
- Clean up disconnected connections

### 2. Message Sending
- Validate phone numbers before sending
- Implement rate limiting to avoid spam
- Use appropriate message types for content
- Handle delivery failures gracefully

### 3. Security
- Keep API keys secure and rotate them regularly
- Use HTTPS in production
- Implement proper input validation
- Monitor for suspicious activity

### 4. Performance
- Cache connection status when possible
- Use connection pooling for high-volume applications
- Implement proper logging and monitoring
- Scale horizontally when needed

## 🆘 Support

### Getting Help
- **Documentation**: Check the API documentation at `/api-docs`
- **Logs**: Check server logs for detailed error information
- **Health Check**: Use the health endpoint to verify server status
- **Community**: Join our developer community for support

### Reporting Issues
When reporting issues, please include:
- API key (masked)
- Request/response details
- Error messages
- Server logs
- Steps to reproduce
