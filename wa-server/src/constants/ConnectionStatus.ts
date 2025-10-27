// Centralized Connection Status System
export const CONNECTION_STATUS = {
  WAITING_CONNECTION: 'waiting_connection',
  READY: 'ready',
  DISCONNECTED: 'disconnected',
  NEEDS_RESTORE: 'needs_restore',
  ERROR: 'error'
} as const;

// Extract union type from const object
export type ConnectionStatus = typeof CONNECTION_STATUS[keyof typeof CONNECTION_STATUS];

// Status metadata for UI and behavior
export const STATUS_METADATA = {
  [CONNECTION_STATUS.WAITING_CONNECTION]: {
    color: 'yellow',
    message: 'Waiting for device to scan QR code',
    needsRestore: false,
    isActive: false,
    canSendMessage: false
  },
  [CONNECTION_STATUS.READY]: {
    color: 'green',
    message: 'Connection is ready to send messages',
    needsRestore: false,
    isActive: true,
    canSendMessage: true
  },
  [CONNECTION_STATUS.DISCONNECTED]: {
    color: 'gray',
    message: 'Connection is disconnected',
    needsRestore: true,
    isActive: false,
    canSendMessage: false
  },
  [CONNECTION_STATUS.NEEDS_RESTORE]: {
    color: 'orange',
    message: 'Connection needs to be restored',
    needsRestore: true,
    isActive: false,
    canSendMessage: false
  },
  [CONNECTION_STATUS.ERROR]: {
    color: 'red',
    message: 'Connection error occurred',
    needsRestore: true,
    isActive: false,
    canSendMessage: false
  }
} as const;

// Helper functions
export const getStatusMetadata = (status: ConnectionStatus) => {
  return STATUS_METADATA[status] || STATUS_METADATA[CONNECTION_STATUS.ERROR];
};

export const isConnectionActive = (status: ConnectionStatus): boolean => {
  return getStatusMetadata(status).isActive;
};

export const canSendMessage = (status: ConnectionStatus): boolean => {
  return getStatusMetadata(status).canSendMessage;
};

export const needsRestore = (status: ConnectionStatus): boolean => {
  return getStatusMetadata(status).needsRestore;
};
