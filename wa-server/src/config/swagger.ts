import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import config from "./env";

const options: swaggerJsdoc.Options = {
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
        Connection: {
          type: "object",
          properties: {
            connectionId: {
              type: "string",
              description: "Unique identifier for the WhatsApp connection",
              example: "conn_123456789"
            },
            status: {
              type: "string",
              enum: ["connecting", "connected", "disconnected", "error"],
              description: "Current status of the WhatsApp connection",
              example: "connected"
            },
            qrCode: {
              type: "string",
              description: "QR code data for WhatsApp Web authentication",
              example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the connection was created",
              example: "2024-01-15T10:30:00Z"
            },
            lastActivity: {
              type: "string",
              format: "date-time",
              description: "Timestamp of last activity on the connection",
              example: "2024-01-15T11:45:00Z"
            }
          }
        },
        Message: {
          type: "object",
          properties: {
            messageId: {
              type: "string",
              description: "Unique identifier for the message",
              example: "msg_123456789"
            },
            connectionId: {
              type: "string",
              description: "ID of the connection used to send the message",
              example: "conn_123456789"
            },
            to: {
              type: "string",
              description: "Recipient phone number (with country code)",
              example: "+1234567890"
            },
            content: {
              type: "string",
              description: "Message content",
              example: "Hello, this is a test message!"
            },
            type: {
              type: "string",
              enum: ["text", "image", "document", "audio", "video"],
              description: "Type of message",
              example: "text"
            },
            status: {
              type: "string",
              enum: ["pending", "sent", "delivered", "read", "failed"],
              description: "Message delivery status",
              example: "sent"
            },
            sentAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the message was sent",
              example: "2024-01-15T12:00:00Z"
            }
          }
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error type",
              example: "ValidationError"
            },
            message: {
              type: "string",
              description: "Error message",
              example: "Invalid phone number format"
            },
            details: {
              type: "object",
              description: "Additional error details",
              example: { field: "phoneNumber", value: "invalid" }
            }
          }
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Indicates if the operation was successful",
              example: true
            },
            message: {
              type: "string",
              description: "Success message",
              example: "Operation completed successfully"
            },
            data: {
              type: "object",
              description: "Response data"
            }
          }
        }
      }
    }
  },
  apis: [
    "./src/modules/**/*.ts",
    "./dist/modules/**/*.js"
  ]
};

const specs = swaggerJsdoc(options);

const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: "none",
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
};

export {
  specs,
  swaggerUi,
  swaggerOptions
};
