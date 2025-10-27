# Manual Testing Guide

This document outlines the manual tests that cannot be automated due to WhatsApp's real-world requirements.

## Prerequisites
- Running server with MongoDB
- Valid API key
- WhatsApp mobile app
- Test phone numbers

## Manual Test Cases

### 1. QR Code Generation and Scanning
**Test:** Verify QR codes are generated and can be scanned
```bash
curl -X POST http://localhost:4000/wa/add-number \
  -H "x-api-key: YOUR_API_KEY"
```
**Steps:**
1. Call the API
2. Open the `qrImage` data URL in browser
3. Scan with WhatsApp mobile app
4. Verify authentication succeeds

**Expected:** Connection status changes to "ready"

### 2. Message Sending
**Test:** Send actual WhatsApp messages
```bash
curl -X POST http://localhost:4000/wa/send \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "1234567890",
    "text": "Test message"
  }'
```
**Steps:**
1. Ensure connection is ready
2. Send message to valid WhatsApp number
3. Verify message appears on recipient's phone

**Expected:** Message delivered successfully

### 3. Session Persistence
**Test:** Verify sessions persist across server restarts
**Steps:**
1. Create and authenticate a connection
2. Send a test message
3. Restart the server
4. Send another message without scanning QR

**Expected:** Second message sends without re-authentication

### 4. Multiple Connections
**Test:** Manage multiple WhatsApp numbers
**Steps:**
1. Add first number and authenticate
2. Add second number and authenticate
3. Send messages from specific connections
4. Disconnect one connection
5. Verify other connections still work

**Expected:** Each connection works independently

### 5. Cross-Platform Testing
**Test:** Verify compatibility across different environments
**Environments to test:**
- Local development
- Docker container
- Cloud deployment (Heroku, AWS, etc.)
- Different operating systems

**Expected:** Consistent behavior across all environments

### 6. Network Resilience
**Test:** Handle network interruptions
**Steps:**
1. Create authenticated connection
2. Simulate network interruption
3. Restore network
4. Verify connection recovers

**Expected:** Connection recovers automatically

### 7. Error Scenarios
**Test:** Handle real-world error cases
**Scenarios:**
- Invalid phone numbers
- Network timeouts
- WhatsApp service outages
- Invalid QR codes
- Expired sessions

**Expected:** Graceful error handling and recovery

## Test Data Requirements

### Valid Test Numbers
- Use real WhatsApp numbers for testing
- Test with different country codes
- Test with different number formats

### Test Messages
- Text messages
- Media messages (images, documents)
- Long messages
- Special characters
- Emojis

### Test Scenarios
- Single recipient
- Multiple recipients
- Group messages (if supported)
- Broadcast messages

## Success Criteria

✅ All API endpoints respond correctly  
✅ QR codes generate and scan successfully  
✅ Messages send and deliver  
✅ Sessions persist across restarts  
✅ Multiple connections work independently  
✅ Error handling works gracefully  
✅ Performance is acceptable  
✅ No memory leaks or resource issues  

## Reporting Issues

When reporting issues, include:
1. Test case that failed
2. Steps to reproduce
3. Expected vs actual behavior
4. Server logs
5. Environment details
6. Screenshots (if applicable)
