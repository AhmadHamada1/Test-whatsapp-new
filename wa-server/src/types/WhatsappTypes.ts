export interface ActiveClient {
    id: string;
    status: 'qr_pending' | 'ready' | 'disconnected' | "needs_restore";
    client: any; // WhatsApp Client type
    qr?: string;
}

export interface ConnectionStatus {
    exists: boolean;
    status?: string;
    error?: string;
}

export interface RealisticStatus {
    status: 'ready' | 'needs_restore' | 'disconnected' | 'expired';
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
