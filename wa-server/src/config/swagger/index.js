"use strict";

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const config = require("../env");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WhatsApp Web Bot API",
      version: "1.0.0",
      description: "API for managing WhatsApp connections and sending messages",
      contact: {
        name: "WhatsApp Bot Support",
        email: "support@whatsappbot.com"
      },
      license: {
        name: "UNLICENSED"
      }
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: "Development server"
      },
      {
        url: "https://wa-server.yourdomain.com",
        description: "Production server"
      }
    ],
    components: {
      securitySchemes: {
        apiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "API key for authentication"
        }
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "Error message"
                },
                details: {
                  type: "array",
                  items: {
                    type: "object"
                  },
                  description: "Additional error details"
                }
              }
            }
          }
        },
        Success: {
          type: "object",
          properties: {
            ok: {
              type: "boolean",
              example: true
            },
            data: {
              type: "object",
              description: "Response data"
            }
          }
        },
        Connection: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Connection ID"
            },
            status: {
              type: "string",
              enum: ["pending", "authenticated", "ready", "auth_failed", "disconnected"],
              description: "Connection status"
            },
            connectionStep: {
              type: "string",
              enum: ["not_started", "qr_generated", "authenticated", "ready", "auth_failed", "disconnected"],
              description: "Current connection step"
            },
            isReady: {
              type: "boolean",
              description: "Whether the connection is ready to send messages"
            },
            message: {
              type: "string",
              description: "Status message"
            },
            lastQrAt: {
              type: "string",
              format: "date-time",
              description: "Last QR code generation time"
            },
            authenticatedAt: {
              type: "string",
              format: "date-time",
              description: "Authentication time"
            },
            readyAt: {
              type: "string",
              format: "date-time",
              description: "Connection ready time"
            },
            authFailedAt: {
              type: "string",
              format: "date-time",
              description: "Authentication failure time"
            },
            disconnectedAt: {
              type: "string",
              format: "date-time",
              description: "Disconnection time"
            },
            error: {
              type: "string",
              description: "Error message if any"
            },
            disconnectReason: {
              type: "string",
              description: "Reason for disconnection"
            },
            accountInfo: {
              type: "object",
              properties: {
                phoneNumber: {
                  type: "string",
                  description: "Connected WhatsApp phone number"
                },
                whatsappId: {
                  type: "string",
                  description: "Full WhatsApp ID with country code"
                },
                profileName: {
                  type: "string",
                  description: "Display name set by the user"
                },
                platform: {
                  type: "string",
                  description: "Device platform (Android/iOS)"
                },
                profilePictureUrl: {
                  type: "string",
                  description: "URL to user's profile picture"
                },
                statusMessage: {
                  type: "string",
                  description: "User's status message"
                },
                lastSeen: {
                  type: "string",
                  format: "date-time",
                  description: "When the account was last active"
                }
              }
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Connection creation time"
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update time"
            }
          }
        },
        QRCode: {
          type: "object",
          properties: {
            connectionId: {
              type: "string",
              description: "Unique identifier for this connection"
            },
            alreadyConnected: {
              type: "boolean",
              description: "True if already connected"
            },
            qr: {
              type: "string",
              description: "QR code string for WhatsApp pairing"
            },
            qrImage: {
              type: "string",
              format: "data-url",
              description: "Base64 encoded PNG image of the QR code"
            },
            accountInfo: {
              $ref: "#/components/schemas/Connection/properties/accountInfo"
            }
          }
        },
        Message: {
          type: "object",
          properties: {
            to: {
              type: "string",
              description: "Recipient phone number",
              example: "1234567890"
            },
            text: {
              type: "string",
              description: "Text message content",
              example: "Hello from WhatsApp Bot!"
            },
            media: {
              type: "object",
              properties: {
                mimetype: {
                  type: "string",
                  description: "Media MIME type",
                  example: "image/png"
                },
                filename: {
                  type: "string",
                  description: "Media filename",
                  example: "image.png"
                },
                dataBase64: {
                  type: "string",
                  description: "Base64 encoded media data",
                  example: "iVBORw0KGgoAAAANSUhEUgAA..."
                }
              },
              description: "Media message content"
            },
            connectionId: {
              type: "string",
              description: "Connection ID to use for sending the message",
              example: "507f1f77bcf86cd799439011"
            }
          },
          required: ["to", "connectionId"]
        },
        MessageResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Message ID"
            },
            timestamp: {
              type: "number",
              description: "Message timestamp"
            }
          }
        }
      }
    },
    tags: [
      {
        name: "WhatsApp",
        description: "WhatsApp connection and messaging operations"
      },
      {
        name: "Health",
        description: "Health check endpoints"
      }
    ]
  },
  apis: [
    "./src/routes/*.js",
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
  swaggerOptions: {
    explorer: true,
    swaggerOptions: {
      docExpansion: "none",
      filter: true,
      showRequestHeaders: true,
      showCommonExtensions: true,
      tryItOutEnabled: true
    }
  }
};
