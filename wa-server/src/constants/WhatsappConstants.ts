export const CLIENT_STATUS = {
    QR_PENDING: 'qr_pending',
    READY: 'ready',
    DISCONNECTED: 'disconnected',
    NEEDS_RESTORE: 'needs_restore'
} as const;

export const REALISTIC_STATUS = {
    READY: 'ready',
    NEEDS_RESTORE: 'needs_restore',
    DISCONNECTED: 'disconnected',
    EXPIRED: 'expired'
} as const;

export const PUPPETEER_ARGS = ['--no-sandbox'];

export const SESSION_DIRS = {
    AUTH: '.wwebjs_auth',
    CACHE: '.wwebjs_cache'
} as const;
