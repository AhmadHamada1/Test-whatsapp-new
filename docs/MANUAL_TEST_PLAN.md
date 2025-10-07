# WhatsApp Web Bot - Manual Test Plan

## Overview

This document provides a comprehensive manual testing guide for the WhatsApp Web Bot API. Manual testing is essential for this project due to WhatsApp's real-world authentication requirements and the need to verify actual message delivery.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Test Environment Setup](#test-environment-setup)
3. [API Authentication Tests](#api-authentication-tests)
4. [WhatsApp Connection Tests](#whatsapp-connection-tests)
5. [Message Sending Tests](#message-sending-tests)
6. [Connection Management Tests](#connection-management-tests)
7. [Admin Panel Tests](#admin-panel-tests)
8. [Error Handling Tests](#error-handling-tests)
9. [Performance Tests](#performance-tests)
10. [Cross-Platform Tests](#cross-platform-tests)
11. [Security Tests](#security-tests)
12. [Test Data Requirements](#test-data-requirements)
13. [Success Criteria](#success-criteria)
14. [Issue Reporting](#issue-reporting)

## Prerequisites

### System Requirements
- Node.js 16+ installed
- MongoDB running locally or accessible
- Docker (for containerized testing)
- WhatsApp mobile app installed
- Valid phone numbers for testing
- API testing tool (Postman, curl, or similar)

### Test Accounts
- Admin account with valid credentials
- At least 2-3 test WhatsApp numbers
- Different country codes for international testing
- Test numbers with different WhatsApp features enabled

## Test Environment Setup

### 1. Server Setup
```bash
# Clone and setup
cd /path/to/project
npm install

# Start MongoDB
mongod

# Start server
npm start

# Verify server is running
curl http://localhost:4000/healthz
```

### 2. Database Setup
```bash
# Seed admin user
node src/scripts/seedAdmin.js

# Verify database connection
curl http://localhost:4000/health
```

### 3. API Key Generation
```bash
# Login as admin
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'

# Create API key
curl -X POST http://localhost:4000/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"label": "Test API Key"}'
```

## API Authentication Tests

### Test Case 1.1: Admin Login
**Objective:** Verify admin authentication works correctly

**Steps:**
1. Send POST request to `/auth/login` with valid credentials
2. Send POST request to `/auth/login` with invalid credentials
3. Send POST request to `/auth/login` with missing fields

**Expected Results:**
- ✅ Valid credentials return JWT token
- ❌ Invalid credentials return 401 error
- ❌ Missing fields return 400 validation error

**Test Data:**
```json
// Valid
{"email": "admin@example.com", "password": "admin123"}

// Invalid
{"email": "wrong@example.com", "password": "wrongpass"}

// Missing fields
{"email": "admin@example.com"}
```

### Test Case 1.2: API Key Authentication
**Objective:** Verify API key authentication works correctly

**Steps:**
1. Send request with valid API key in `x-api-key` header
2. Send request with invalid API key
3. Send request without API key header
4. Send request with expired/revoked API key

**Expected Results:**
- ✅ Valid API key allows access
- ❌ Invalid API key returns 401 error
- ❌ Missing API key returns 401 error
- ❌ Revoked API key returns 401 error

## WhatsApp Connection Tests

### Test Case 2.1: QR Code Generation
**Objective:** Verify QR code generation and scanning process

**Steps:**
1. Call `POST /wa/add-number` with valid API key
2. Verify response contains `connectionId`, `qr`, and `qrImage`
3. Open `qrImage` data URL in browser
4. Scan QR code with WhatsApp mobile app
5. Monitor connection status via `GET /wa/status`

**Expected Results:**
- ✅ QR code generates successfully
- ✅ QR code is scannable
- ✅ Connection status progresses: `pending` → `authenticated` → `ready`
- ✅ Account information is captured correctly

**Test Commands:**
```bash
# Generate QR code
curl -X POST http://localhost:4000/wa/add-number \
  -H "x-api-key: YOUR_API_KEY"

# Check status
curl -X GET http://localhost:4000/wa/status \
  -H "x-api-key: YOUR_API_KEY"
```

### Test Case 2.2: Already Connected Detection
**Objective:** Verify system detects existing connections

**Steps:**
1. Create and authenticate a connection
2. Call `POST /wa/add-number` again
3. Verify response shows `alreadyConnected: true`

**Expected Results:**
- ✅ Returns existing connection info
- ✅ No new QR code generated
- ✅ Account info is returned

### Test Case 2.3: Connection Status Monitoring
**Objective:** Verify connection status tracking

**Steps:**
1. Start connection process
2. Monitor status at each stage:
   - `not_started`
   - `pending` (qr_generated)
   - `authenticated`
   - `ready`
3. Test status with specific connection ID
4. Test status without connection ID (most recent)

**Expected Results:**
- ✅ Status updates correctly at each stage
- ✅ Appropriate messages are returned
- ✅ Timestamps are accurate
- ✅ Both status endpoints work correctly

## Message Sending Tests

### Test Case 3.1: Text Message Sending
**Objective:** Verify text message sending functionality

**Steps:**
1. Ensure WhatsApp connection is ready
2. Send text message to valid WhatsApp number
3. Verify message appears on recipient's device
4. Check response contains message ID and timestamp

**Test Data:**
```json
{
  "to": "1234567890",
  "text": "Hello! This is a test message from WhatsApp Web Bot."
}
```

**Expected Results:**
- ✅ Message sends successfully
- ✅ Message appears on recipient's device
- ✅ Response contains valid message ID
- ✅ Timestamp is accurate

### Test Case 3.2: Media Message Sending
**Objective:** Verify media message sending functionality

**Steps:**
1. Prepare base64 encoded media file
2. Send media message with proper mimetype and filename
3. Verify media appears on recipient's device
4. Test different media types (image, document, audio)

**Test Data:**
```json
{
  "to": "1234567890",
  "media": {
    "mimetype": "image/jpeg",
    "filename": "test-image.jpg",
    "dataBase64": "iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

**Expected Results:**
- ✅ Media message sends successfully
- ✅ Media appears correctly on recipient's device
- ✅ Proper file type and name are preserved

### Test Case 3.3: Message Sending with Connection ID
**Objective:** Verify sending messages with specific connection

**Steps:**
1. Create multiple connections
2. Send message specifying `connectionId`
3. Verify message is sent from correct WhatsApp account
4. Send message without `connectionId` (should fail)

**Expected Results:**
- ✅ Message sent from specified connection
- ✅ Error when connectionId is not provided
- ✅ Error when invalid connection ID provided

### Test Case 3.4: Message Validation
**Objective:** Verify message validation and error handling

**Steps:**
1. Send message without `to` field
2. Send message with invalid phone number format
3. Send message with empty text
4. Send message with both text and media
5. Send message to non-WhatsApp number

**Expected Results:**
- ❌ Missing `to` field returns validation error
- ❌ Invalid phone number format returns error
- ❌ Empty text returns validation error
- ❌ Both text and media returns validation error
- ❌ Non-WhatsApp number returns appropriate error

## Connection Management Tests

### Test Case 4.1: List Connections
**Objective:** Verify connection listing functionality

**Steps:**
1. Create multiple connections
2. Call `GET /wa/connections`
3. Verify all connections are listed
4. Check connection details are accurate

**Expected Results:**
- ✅ All connections are listed
- ✅ Connection details are accurate
- ✅ Status information is current
- ✅ Account info is included

### Test Case 4.2: Disconnect Connection
**Objective:** Verify connection disconnection

**Steps:**
1. Create and authenticate connection
2. Send test message to verify it works
3. Disconnect connection via `POST /wa/disconnect/{connectionId}`
4. Try to send message (should fail)
5. Check connection status

**Expected Results:**
- ✅ Connection disconnects successfully
- ✅ Message sending fails after disconnect
- ✅ Status shows as disconnected
- ✅ Client is properly cleaned up

### Test Case 4.3: Multiple Connection Management
**Objective:** Verify managing multiple connections

**Steps:**
1. Create first connection and authenticate
2. Create second connection and authenticate
3. Send messages from each connection
4. Disconnect one connection
5. Verify other connection still works

**Expected Results:**
- ✅ Multiple connections work independently
- ✅ Each connection can send messages
- ✅ Disconnecting one doesn't affect others
- ✅ Connection isolation is maintained

## Admin Panel Tests

### Test Case 5.1: API Key Management
**Objective:** Verify admin can manage API keys

**Steps:**
1. Login as admin
2. Create new API key
3. List all API keys
4. Get specific API key details
5. Revoke API key
6. Activate API key
7. Delete API key

**Expected Results:**
- ✅ API keys can be created successfully
- ✅ API key list shows all keys
- ✅ Key details are accurate
- ✅ Revoke/activate works correctly
- ✅ Deleted keys are removed

### Test Case 5.2: Admin Connection Monitoring
**Objective:** Verify admin can monitor all connections

**Steps:**
1. Create connections with different API keys
2. Use admin endpoint to list connections for specific API key
3. Verify admin can see all connection details

**Expected Results:**
- ✅ Admin can view connections for any API key
- ✅ Connection details are complete
- ✅ Status information is accurate

## Error Handling Tests

### Test Case 6.1: Authentication Errors
**Objective:** Verify authentication error handling

**Steps:**
1. Test with invalid API key
2. Test with expired JWT token
3. Test with malformed headers
4. Test with missing authentication

**Expected Results:**
- ❌ All invalid authentication returns 401
- ❌ Error messages are clear and helpful
- ❌ No sensitive information is leaked

### Test Case 6.2: WhatsApp Service Errors
**Objective:** Verify WhatsApp service error handling

**Steps:**
1. Test with invalid phone numbers
2. Test when WhatsApp service is down
3. Test with expired QR codes
4. Test with authentication failures

**Expected Results:**
- ❌ Appropriate error codes returned
- ❌ Error messages are user-friendly
- ❌ System recovers gracefully

### Test Case 6.3: Network Error Handling
**Objective:** Verify network error handling

**Steps:**
1. Simulate network interruption during connection
2. Simulate network interruption during message sending
3. Test with slow network conditions
4. Test with intermittent connectivity

**Expected Results:**
- ✅ System handles network interruptions gracefully
- ✅ Appropriate timeouts are set
- ✅ Retry mechanisms work when appropriate

## Performance Tests

### Test Case 7.1: Concurrent Connections
**Objective:** Verify system handles multiple concurrent connections

**Steps:**
1. Create 5+ connections simultaneously
2. Send messages from all connections
3. Monitor system resources
4. Check for memory leaks

**Expected Results:**
- ✅ All connections work correctly
- ✅ No memory leaks detected
- ✅ System remains stable
- ✅ Response times are acceptable

### Test Case 7.2: Message Throughput
**Objective:** Verify message sending performance

**Steps:**
1. Send 100+ messages rapidly
2. Monitor response times
3. Check for rate limiting
4. Verify all messages are delivered

**Expected Results:**
- ✅ Messages send within acceptable time
- ✅ No messages are lost
- ✅ Rate limiting works if implemented
- ✅ System remains stable

## Cross-Platform Tests

### Test Case 8.1: Docker Container Testing
**Objective:** Verify system works in Docker

**Steps:**
1. Build Docker image
2. Run container with proper configuration
3. Test all major functionality
4. Verify persistence works

**Expected Results:**
- ✅ All features work in Docker
- ✅ Data persists across container restarts
- ✅ Performance is acceptable

### Test Case 8.2: Different Operating Systems
**Objective:** Verify cross-platform compatibility

**Test on:**
- macOS
- Linux (Ubuntu/CentOS)
- Windows (if applicable)

**Expected Results:**
- ✅ System works on all supported platforms
- ✅ No platform-specific issues
- ✅ Performance is consistent

## Security Tests

### Test Case 9.1: API Key Security
**Objective:** Verify API key security

**Steps:**
1. Test API key rotation
2. Test API key revocation
3. Test API key scope limitations
4. Test API key logging

**Expected Results:**
- ✅ API keys can be rotated securely
- ✅ Revoked keys are immediately invalid
- ✅ API key usage is logged
- ✅ No unauthorized access possible

### Test Case 9.2: Data Protection
**Objective:** Verify data protection measures

**Steps:**
1. Test session data encryption
2. Test message content handling
3. Test database security
4. Test log sanitization

**Expected Results:**
- ✅ Sensitive data is encrypted
- ✅ Message content is handled securely
- ✅ Database is properly secured
- ✅ Logs don't contain sensitive data

## Test Data Requirements

### Valid Test Numbers
- **Primary Test Number:** +1234567890 (US)
- **International Test Number:** +447700900123 (UK)
- **Different Format:** 1234567890 (without country code)
- **With Country Code:** +1234567890@c.us

### Test Messages
- **Short Text:** "Hi"
- **Long Text:** 1000+ character message
- **Special Characters:** "Hello! @#$%^&*()_+-=[]{}|;':\",./<>?"
- **Emojis:** "Hello! 👋🚀💯"
- **Unicode:** "Hello! 你好 مرحبا"

### Test Media Files
- **Images:** JPEG, PNG, GIF (various sizes)
- **Documents:** PDF, DOC, TXT
- **Audio:** MP3, WAV
- **Video:** MP4 (if supported)

## Success Criteria

### Functional Requirements
- ✅ All API endpoints respond correctly
- ✅ QR code generation and scanning works
- ✅ Messages send and deliver successfully
- ✅ Multiple connections work independently
- ✅ Connection status tracking is accurate
- ✅ Admin panel functions correctly

### Non-Functional Requirements
- ✅ Response times < 2 seconds for most operations
- ✅ System handles 10+ concurrent connections
- ✅ No memory leaks during extended testing
- ✅ Graceful error handling and recovery
- ✅ Security measures are effective
- ✅ Cross-platform compatibility

### Quality Requirements
- ✅ Error messages are clear and helpful
- ✅ API responses are consistent
- ✅ Documentation matches implementation
- ✅ No critical bugs or crashes
- ✅ System is production-ready

## Issue Reporting

### When Reporting Issues, Include:

1. **Test Case:** Which test case failed
2. **Environment:** OS, Node.js version, MongoDB version
3. **Steps to Reproduce:** Detailed steps
4. **Expected vs Actual:** What should happen vs what happened
5. **Logs:** Relevant server logs and error messages
6. **Screenshots:** If applicable (QR codes, error messages)
7. **Test Data:** The specific data used that caused the issue
8. **Frequency:** How often the issue occurs
9. **Workaround:** Any temporary solutions found

### Issue Severity Levels

- **Critical:** System crashes, data loss, security vulnerabilities
- **High:** Core functionality broken, major features not working
- **Medium:** Minor functionality issues, performance problems
- **Low:** UI issues, documentation problems, enhancement requests

### Test Completion Checklist

- [ ] All authentication tests pass
- [ ] All WhatsApp connection tests pass
- [ ] All message sending tests pass
- [ ] All connection management tests pass
- [ ] All admin panel tests pass
- [ ] All error handling tests pass
- [ ] All performance tests pass
- [ ] All cross-platform tests pass
- [ ] All security tests pass
- [ ] Documentation is updated
- [ ] No critical issues remain
- [ ] System is ready for production

---

**Last Updated:** [Current Date]
**Version:** 1.0
**Tested By:** [Tester Name]
**Approved By:** [Approver Name]
