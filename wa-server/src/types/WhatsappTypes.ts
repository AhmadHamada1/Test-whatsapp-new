import { ConnectionStatus } from '../constants/ConnectionStatus';

export interface ActiveClient {
    id: string;
    status: ConnectionStatus;
    client: any; // WhatsApp Client type
    qr?: string;
}

export interface ConnectionStatusResponse {
    exists: boolean;
    status?: string;
    error?: string;
}

export interface RealisticStatus {
    status: ConnectionStatus;
    message: string;
    needsRestore: boolean;
}

export interface ReloadResult {
    success: boolean;
    message: string;
}

export interface ClientInfo {
    phoneNumber?: string;
    platform?: string;
    whatsappInfo?: {
        profileName?: string;
        isBusiness?: boolean;
        isVerified?: boolean;
    };
    connectionDetails: {
        connectedAt: Date;
        lastSeen: Date;
    };
}

export interface QRResponse {
    qr: string;
}
