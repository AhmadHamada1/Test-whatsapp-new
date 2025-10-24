// Re-export status constants for backward compatibility
export { CONNECTION_STATUS as CLIENT_STATUS, CONNECTION_STATUS as REALISTIC_STATUS } from './ConnectionStatus';

export const PUPPETEER_ARGS = ['--no-sandbox'];

export const SESSION_DIRS = {
    AUTH: '.wwebjs_auth',
    CACHE: '.wwebjs_cache'
} as const;
