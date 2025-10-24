import { Client } from 'whatsapp-web.js';
import { ClientManager } from './ClientManager';
import { SessionManager } from './SessionManager';
import { QRResponse, ConnectionStatus, RealisticStatus, ReloadResult } from '../types/WhatsappTypes';
import { IConnection } from '../modules/wa/model';
import { CLIENT_STATUS } from '../constants/WhatsappConstants';

class WhatsappManager {
    private static instance: WhatsappManager;
    private clientManager: ClientManager;
    private sessionManager: SessionManager;

    private constructor() {
        this.clientManager = new ClientManager();
        this.sessionManager = new SessionManager();
    }

    public static getInstance(): WhatsappManager {
        if (!WhatsappManager.instance) {
            WhatsappManager.instance = new WhatsappManager();
        }
        return WhatsappManager.instance;
    }

    /** Create a new WhatsApp connection and return QR */
    async createConnection(connectionId: string, apiKeyId: string): Promise<QRResponse> {
        return new Promise((resolve, reject) => {
            const client = this.clientManager.createClient(connectionId);
            const eventHandler = this.clientManager.getEventHandler();

            client.on('qr', async (qr) => {
                const qrImage = await eventHandler.handleQREvent(connectionId, qr);
                this.clientManager.addClient(connectionId, client, qrImage);
                resolve({ qr: qrImage });
            });

            client.on('ready', async () => {
                await eventHandler.handleReadyEvent(connectionId, client, apiKeyId);
                console.log("client ready", client.info.wid.user.trim());
                setTimeout(() => {
                    client.sendMessage(`${client.info.wid.user.trim()}@c.us`, "Hello");
                }, 2800)
            });

            client.on('disconnected', async () => {
                await eventHandler.handleDisconnectedEvent(connectionId, apiKeyId);
            });

            client.initialize().catch(reject);
        });
    }

    /** Send a message */
    async sendMessage(connectionId: string, to: string, message: string) {
        return this.clientManager.sendMessage(connectionId, to, message);
    }

    /** Disconnect a client */
    async disconnect(connectionId: string) {
        try {
            await this.clientManager.destroyClient(connectionId);
        } catch (error) {
            console.error(`[${connectionId}] Error disconnecting client:`, error);
        }

        // Delete the hard records in files or database
        await this.sessionManager.deleteSessionData(connectionId);
        console.log(`[${connectionId}] Disconnected and cleaned up session data`);
    }

    /** Get connection status */
    getConnectionStatus(connectionId: string): ConnectionStatus {
        return this.clientManager.getConnectionStatus(connectionId);
    }

    /** List all active clients */
    listConnections() {
        return this.clientManager.listConnections();
    }

    /** Check if a connection exists in the manager */
    hasConnection(connectionId: string): boolean {
        return this.clientManager.hasClient(connectionId);
    }

    /** Get realistic status for a connection */
    getRealisticStatus(connectionId: string): RealisticStatus {
        return this.clientManager.getRealisticStatus(connectionId);
    }

    /** Reload all past sessions from database */
    async reloadPastSessions(): Promise<void> {
        await this.sessionManager.reloadPastSessions((connectionId, apiKeyId) =>
            this.restoreSession(connectionId, apiKeyId)
        );
    }

    /** Reload a specific session by connection ID */
    async reloadSession(connectionId: string): Promise<ReloadResult> {
        // First, check if session already exists and disconnect it
        if (this.clientManager.hasClient(connectionId)) {
            console.log(`Session ${connectionId} already exists, disconnecting first...`);
            await this.disconnect(connectionId);
        }

        return this.sessionManager.reloadSession(
            connectionId,
            (connectionId) => this.disconnect(connectionId),
            (connectionId, apiKeyId) => this.restoreSession(connectionId, apiKeyId)
        );
    }

    /** Restore a specific session by connectionId */
    async restoreSession(connectionId: string, apiKeyId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // Check if session already exists
            if (this.clientManager.hasClient(connectionId)) {
                console.log(`Session ${connectionId} already exists, skipping restoration`);
                resolve();
                return;
            }

            console.log(`Restoring session: ${connectionId}`);

            const client = this.clientManager.createClient(connectionId);
            const eventHandler = this.clientManager.getEventHandler();

            // Add session to clients map with 'qr_pending' status initially
            // This will be updated to 'ready' only when the actual ready event fires
            this.clientManager.addClient(connectionId, client);

            // Set up event handlers
            client.on('ready', async () => {
                console.log(`[${connectionId}] Session restored and ready - client is actually ready to send messages`);
                // console.log("client ready", client.info.wid.user);
                // client.sendMessage(`+${client.info.wid.user}`, "Hello");    
                await eventHandler.handleReadyEvent(connectionId, client, apiKeyId);
                resolve();
            });

            client.on('disconnected', async () => {
                await eventHandler.handleDisconnectedEvent(connectionId, apiKeyId);
            });

            client.on('qr', async (qr) => {
                eventHandler.handleQREventDuringRestoration(connectionId);
            });

            // Initialize the client
            client.initialize().catch((error) => {
                console.error(`[${connectionId}] Failed to initialize restored session:`, error);
                this.clientManager.removeClient(connectionId);
                reject(error);
            });
        });
    }

    /** Get all past sessions from database (for a specific API key) */
    async getPastSessions(apiKeyId: string): Promise<IConnection[]> {
        return this.sessionManager.getPastSessions(apiKeyId);
    }
}

export default WhatsappManager.getInstance();