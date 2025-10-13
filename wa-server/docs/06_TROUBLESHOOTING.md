# WhatsApp Web Bot - Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Connection Issues

#### QR Code Not Displaying
**Problem**: QR code is not showing or is corrupted
**Solutions**:
1. Check if the `qrImage` field contains valid base64 data
2. Ensure the image is properly decoded and displayed
3. Try refreshing the page or regenerating the QR code
4. Check browser console for JavaScript errors

**Code Example**:
```javascript
// Properly display QR code
const qrImage = document.getElementById('qr-image');
qrImage.src = response.data.qrImage;
```

#### QR Code Scanning Fails
**Problem**: WhatsApp mobile app cannot scan the QR code
**Solutions**:
1. Ensure WhatsApp mobile app is updated to the latest version
2. Check if the QR code is clear and not distorted
3. Try generating a new QR code
4. Ensure good lighting when scanning
5. Check if the phone's camera is working properly

#### Connection Stuck in "Pending" State
**Problem**: Connection remains in pending state after scanning QR code
**Solutions**:
1. Wait a few minutes for the connection to establish
2. Check if WhatsApp mobile app is active and connected to internet
3. Try disconnecting and reconnecting
4. Check server logs for error messages
5. Verify the phone number is correct

#### Connection Keeps Disconnecting
**Problem**: Connection disconnects frequently or immediately after connecting
**Solutions**:
1. Check internet connectivity on both server and mobile device
2. Ensure WhatsApp mobile app is not being used on another device
3. Check if the WhatsApp account is banned or restricted
4. Verify server resources (CPU, memory) are sufficient
5. Check for firewall or network restrictions

### Authentication Issues

#### Invalid API Key Error
**Problem**: Getting 401 Unauthorized error
**Solutions**:
1. Verify the API key is correct and active
2. Check if the API key has proper permissions
3. Ensure the API key is being sent in the correct header (`x-api-key`)
4. Check if the API key has been revoked
5. Verify the API key format is correct

**Code Example**:
```javascript
// Correct API key usage
const headers = {
  'x-api-key': 'your-api-key-here',
  'Content-Type': 'application/json'
};
```

#### API Key Not Found
**Problem**: API key exists but server cannot find it
**Solutions**:
1. Check if the API key is properly stored in the database
2. Verify the API key hash matches the stored hash
3. Check if the API key status is "active"
4. Ensure the database connection is working
5. Check server logs for database errors

### Message Sending Issues

#### Message Not Delivered
**Problem**: Message appears to be sent but recipient doesn't receive it
**Solutions**:
1. Check if the recipient's phone number is correct and valid
2. Verify the recipient has WhatsApp installed and active
3. Check if the recipient has blocked the sender
4. Ensure the message content complies with WhatsApp policies
5. Check if the connection is still active

#### Media Message Fails
**Problem**: Media messages fail to send
**Solutions**:
1. Check if the media file is properly encoded in base64
2. Verify the media file size is within limits (16MB for most types)
3. Ensure the MIME type is correct
4. Check if the media file is corrupted
5. Verify the media type is supported by WhatsApp

**Code Example**:
```javascript
// Proper media encoding
const fs = require('fs');
const mediaData = fs.readFileSync('image.png');
const base64Data = mediaData.toString('base64');

const media = {
  mimetype: 'image/png',
  filename: 'image.png',
  dataBase64: base64Data
};
```

#### Validation Errors
**Problem**: Getting 400 Bad Request with validation errors
**Solutions**:
1. Check if all required fields are provided
2. Verify field formats (phone number, connection ID, etc.)
3. Ensure phone numbers are in international format
4. Check if the request body is properly formatted JSON
5. Verify field lengths are within limits

### Server Issues

#### Server Not Starting
**Problem**: Server fails to start or crashes immediately
**Solutions**:
1. Check if all dependencies are installed (`npm install`)
2. Verify environment variables are set correctly
3. Check if the port is already in use
4. Ensure MongoDB is running and accessible
5. Check server logs for specific error messages

#### Database Connection Issues
**Problem**: Cannot connect to MongoDB
**Solutions**:
1. Verify MongoDB is running
2. Check the MongoDB connection string
3. Ensure the database user has proper permissions
4. Check network connectivity to MongoDB
5. Verify the database name exists

#### High Memory Usage
**Problem**: Server consumes too much memory
**Solutions**:
1. Check for memory leaks in the code
2. Implement proper cleanup of WhatsApp clients
3. Monitor connection count and limit if necessary
4. Check for infinite loops or recursive calls
5. Consider increasing server memory or optimizing code

### Performance Issues

#### Slow Response Times
**Problem**: API responses are slow
**Solutions**:
1. Check server resources (CPU, memory, disk)
2. Monitor database query performance
3. Implement caching where appropriate
4. Check for network latency issues
5. Optimize database indexes

#### Connection Timeouts
**Problem**: Connections timeout frequently
**Solutions**:
1. Increase connection timeout values
2. Check network stability
3. Implement retry logic with exponential backoff
4. Monitor connection pool usage
5. Check for firewall or proxy issues

## 🔍 Debugging Techniques

### Enable Debug Logging
Set the log level to debug for more detailed information:

```bash
export DEBUG=wa-server:*
npm run dev
```

### Check Server Logs
Monitor server logs for errors and warnings:

```bash
# Using PM2
pm2 logs wa-server

# Using Docker
docker logs wa-server

# Using systemd
journalctl -u wa-server -f
```

### Test API Endpoints
Use curl or Postman to test API endpoints:

```bash
# Health check
curl http://localhost:4001/healthz

# Test connection
curl -X POST http://localhost:4001/wa/add-number \
  -H "x-api-key: your-api-key-here"
```

### Monitor Database
Check database for connection records:

```javascript
// MongoDB query to check connections
db.waconnections.find({apiKey: ObjectId("your-api-key-id")})
```

## 📊 Monitoring & Metrics

### Health Check Endpoints
- **Server Health**: `GET /healthz`
- **Database Health**: Check MongoDB connection
- **Connection Health**: Monitor active connections

### Key Metrics to Monitor
1. **API Response Time**: Should be < 200ms
2. **Connection Success Rate**: Should be > 95%
3. **Message Delivery Rate**: Should be > 98%
4. **Error Rate**: Should be < 1%
5. **Memory Usage**: Should be stable
6. **CPU Usage**: Should be reasonable

### Alerting Thresholds
- Response time > 500ms
- Error rate > 5%
- Memory usage > 80%
- Connection success rate < 90%
- Message delivery rate < 95%

## 🛠️ Maintenance Tasks

### Regular Maintenance
1. **Clean up disconnected connections** (automated)
2. **Monitor server resources**
3. **Check error logs**
4. **Update dependencies**
5. **Backup database**

### Weekly Tasks
1. **Review error logs**
2. **Check connection statistics**
3. **Monitor performance metrics**
4. **Update documentation**
5. **Test backup procedures**

### Monthly Tasks
1. **Security audit**
2. **Performance review**
3. **Dependency updates**
4. **Capacity planning**
5. **Disaster recovery testing**

## 🆘 Emergency Procedures

### Server Down
1. Check server status and logs
2. Restart the server
3. Check database connectivity
4. Verify environment variables
5. Contact support if needed

### Database Issues
1. Check MongoDB status
2. Verify connection string
3. Check disk space
4. Restart MongoDB if needed
5. Restore from backup if necessary

### Security Incident
1. Revoke compromised API keys
2. Check access logs
3. Update security measures
4. Notify affected users
5. Document the incident

## 📞 Support Contacts

### Technical Support
- **Email**: support@whatsappbot.com
- **Documentation**: `/api-docs`
- **GitHub Issues**: [Repository Issues]
- **Community Forum**: [Community Link]

### Emergency Support
- **Phone**: +1-XXX-XXX-XXXX
- **Email**: emergency@whatsappbot.com
- **Slack**: #emergency-support

### Business Support
- **Email**: business@whatsappbot.com
- **Phone**: +1-XXX-XXX-XXXX
- **Sales**: sales@whatsappbot.com

## 📚 Additional Resources

### Documentation
- [API Documentation](/api-docs)
- [01. Product Overview](01_PRODUCT_OVERVIEW.md)
- [05. User Guide](05_USER_GUIDE.md)
- [04. Architecture Guide](04_ARCHITECTURE.md)
- [03. Features Overview](03_FEATURES.md)

### Code Examples
- [JavaScript Examples](examples/javascript/)
- [Python Examples](examples/python/)
- [PHP Examples](examples/php/)
- [cURL Examples](examples/curl/)

### Community
- [GitHub Repository](https://github.com/your-org/whatsapp-bot)
- [Discord Community](https://discord.gg/your-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/whatsapp-bot)
- [Reddit Community](https://reddit.com/r/whatsappbot)
