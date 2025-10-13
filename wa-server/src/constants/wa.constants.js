"use strict";

/**
 * WhatsApp Module Constants
 * 
 * This file contains all error messages, status codes, and other constants
 * used throughout the WA module for better maintainability and consistency.
 */

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// WhatsApp Connection Statuses
const CONNECTION_STATUS = {
  NOT_STARTED: "not_started",
  PENDING: "pending",
  AUTHENTICATED: "authenticated",
  READY: "ready",
  AUTH_FAILED: "auth_failed",
  DISCONNECTED: "disconnected"
};

// Connection Steps
const CONNECTION_STEP = {
  NOT_STARTED: "not_started",
  QR_GENERATED: "qr_generated",
  AUTHENTICATED: "authenticated",
  READY: "ready",
  AUTH_FAILED: "auth_failed",
  DISCONNECTED: "disconnected"
};

// Error Messages
const ERROR_MESSAGES = {
  // Connection Initialization Errors
  CONNECTION_NOT_INITIALIZED: "WhatsApp connection is not initialized yet. Please scan the QR code first.",
  CLIENT_NOT_AVAILABLE: "WhatsApp client is not available. Please try again.",
  CLIENT_NOT_PROPERLY_INITIALIZED: "WhatsApp client is not properly initialized. The browser session may have crashed. Please try reconnecting your number.",
  NO_VALID_SESSION: "No valid session found for connection {connectionId}. Please scan the QR code first.",
  CLIENT_INITIALIZATION_TIMEOUT: "Client initialization timeout",
  AUTHENTICATION_FAILED: "Authentication failed: {msg}",
  CLIENT_DISCONNECTED: "Client disconnected: {reason}",
  
  // Connection Management Errors
  CONNECTION_NOT_FOUND: "Connection not found or not associated with this API key",
  CONNECTION_NOT_ACTIVE: "Connection not found or not active for this API key",
  NO_ACTIVE_CONNECTION: "No active connection found for this API key",
  FAILED_TO_DISCONNECT: "Failed to disconnect WhatsApp: {error}",
  
  // Message Sending Errors
  FAILED_TO_SEND_MESSAGE: "Failed to send message: {error}",
  
  // Status Check Errors
  FAILED_TO_GET_STATUS: "Failed to get connection status: {error}",
  
  // Validation Errors
  INVALID_RECIPIENT: "Invalid recipient",
  CONNECTION_ID_REQUIRED: "Connection ID is required",
  TEXT_OR_MEDIA_REQUIRED: "Either text or media must be provided",
  
  // General Errors
  CLIENT_INFO_NOT_AVAILABLE: "Client info not available"
};

// Status Messages
const STATUS_MESSAGES = {
  NO_CONNECTION_ATTEMPT: "No connection attempt found. Call /wa/add-number first.",
  QR_CODE_GENERATED: "QR code generated. Please scan it with your WhatsApp mobile app.",
  AUTHENTICATED_SUCCESSFULLY: "WhatsApp authenticated successfully. Finalizing connection...",
  CONNECTED_AND_READY: "WhatsApp is connected and ready to send messages!",
  AUTHENTICATION_FAILED: "Authentication failed. Please try scanning the QR code again.",
  CONNECTION_DISCONNECTED: "WhatsApp connection was disconnected.",
  CONNECTION_IN_PROGRESS: "Connection in progress...",
  UNKNOWN_STATUS: "Unknown connection status."
};

// Success Messages
const SUCCESS_MESSAGES = {
  CONNECTION_DISCONNECTED_SUCCESSFULLY: "WhatsApp connection disconnected successfully"
};

// Validation Error Messages
const VALIDATION_MESSAGES = {
  INVALID_RECIPIENT: "Invalid recipient",
  CONNECTION_ID_REQUIRED: "Connection ID is required",
  TEXT_OR_MEDIA_REQUIRED: "Either text or media must be provided"
};

// Error Response Structure
const ERROR_RESPONSE = {
  message: "Error message",
  details: "Additional error details (optional)"
};

// Success Response Structure
const SUCCESS_RESPONSE = {
  ok: true,
  data: "Response data"
};

// Utility function to format error messages with placeholders
function formatErrorMessage(message, replacements = {}) {
  let formattedMessage = message;
  Object.keys(replacements).forEach(key => {
    const placeholder = `{${key}}`;
    formattedMessage = formattedMessage.replace(placeholder, replacements[key]);
  });
  return formattedMessage;
}

// Utility function to get status message based on status and step
function getStatusMessage(status, connectionStep) {
  switch (status) {
    case CONNECTION_STATUS.PENDING:
      if (connectionStep === CONNECTION_STEP.QR_GENERATED) {
        return STATUS_MESSAGES.QR_CODE_GENERATED;
      }
      return STATUS_MESSAGES.CONNECTION_IN_PROGRESS;
    case CONNECTION_STATUS.AUTHENTICATED:
      return STATUS_MESSAGES.AUTHENTICATED_SUCCESSFULLY;
    case CONNECTION_STATUS.READY:
      return STATUS_MESSAGES.CONNECTED_AND_READY;
    case CONNECTION_STATUS.AUTH_FAILED:
      return STATUS_MESSAGES.AUTHENTICATION_FAILED;
    case CONNECTION_STATUS.DISCONNECTED:
      return STATUS_MESSAGES.CONNECTION_DISCONNECTED;
    default:
      return STATUS_MESSAGES.UNKNOWN_STATUS;
  }
}

module.exports = {
  HTTP_STATUS,
  CONNECTION_STATUS,
  CONNECTION_STEP,
  ERROR_MESSAGES,
  STATUS_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_MESSAGES,
  ERROR_RESPONSE,
  SUCCESS_RESPONSE,
  formatErrorMessage,
  getStatusMessage
};
