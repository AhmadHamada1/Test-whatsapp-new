import { Client, LocalAuth } from 'whatsapp-web.js';
import { EventHandler } from './EventHandler';
import { ActiveClient, ConnectionStatus, RealisticStatus } from '../types/WhatsappTypes';
import { CLIENT_STATUS, REALISTIC_STATUS, PUPPETEER_ARGS } from '../constants/WhatsappConstants';

export class ClientManager {
    private clients: Map<string, ActiveClient> = new Map();
    private eventHandler: EventHandler;

    constructor() {
        this.eventHandler = new EventHandler(this.clients);
    }

    /**
     * Create a new WhatsApp client
     */
    createClient(connectionId: string): Client {
        return new Client({
            authStrategy: new LocalAuth({ clientId: connectionId }),
            puppeteer: { headless: true, args: PUPPETEER_ARGS },
        });
    }

    /**
     * Add client to the clients map
     */
    addClient(connectionId: string, client: Client, qr?: string): void {
        const activeClient: ActiveClient = {
            id: connectionId,
            client,
            status: CLIENT_STATUS.QR_PENDING
        };

        if (qr) {
            activeClient.qr = qr;
        }

        this.clients.set(connectionId, activeClient);
    }

    /**
     * Get client by connection ID
     */
    getClient(connectionId: string): ActiveClient | undefined {
        return this.clients.get(connectionId);
    }

    /**
     * Remove client from the clients map
     */
    removeClient(connectionId: string): void {
        this.clients.delete(connectionId);
    }

    /**
     * Check if client exists
     */
    hasClient(connectionId: string): boolean {
        return this.clients.has(connectionId);
    }

    /**
     * Get all clients
     */
    getAllClients(): ActiveClient[] {
        return Array.from(this.clients.values());
    }

    /**
     * Get clients map
     */
    getClientsMap(): Map<string, ActiveClient> {
        return this.clients;
    }

    /**
     * Clear all clients
     */
    clearClients(): void {
        this.clients.clear();
    }

    /**
     * Get connection status
     */
    getConnectionStatus(connectionId: string): ConnectionStatus {
        const active = this.clients.get(connectionId);
        if (!active) {
            return {
                exists: false,
                error: `Session not found for connection ID: ${connectionId}`
            };
        }
        return {
            exists: true,
            status: active.status
        };
    }

    /**
     * Get realistic status for a connection
     */
    getRealisticStatus(connectionId: string): RealisticStatus {
        const active = this.clients.get(connectionId);

        if (!active) {
            return {
                status: REALISTIC_STATUS.NEEDS_RESTORE,
                message: 'Connection needs to be restored before use',
                needsRestore: true
            };
        }

        switch (active.status) {
            case CLIENT_STATUS.READY:
                return {
                    status: REALISTIC_STATUS.READY,
                    message: 'Connection is ready to send messages',
                    needsRestore: false
                };
            case CLIENT_STATUS.QR_PENDING:
                return {
                    status: REALISTIC_STATUS.EXPIRED,
                    message: 'Connection expired, needs to scan QR code again',
                    needsRestore: false
                };
            case CLIENT_STATUS.DISCONNECTED:
                return {
                    status: REALISTIC_STATUS.DISCONNECTED,
                    message: 'Connection is disconnected',
                    needsRestore: true
                };
            default:
                return {
                    status: REALISTIC_STATUS.NEEDS_RESTORE,
                    message: 'Connection status unknown, needs to be restored',
                    needsRestore: true
                };
        }
    }

    /**
     * List all active clients
     */
    listConnections() {
        return Array.from(this.clients.values()).map((c) => ({
            id: c.id,
            status: c.status,
        }));
    }

    /**
     * Send a message using a client
     */
    async sendMessage(connectionId: string, to: string, message: string) {
        console.log("sending message", connectionId, to, message);
        const active = this.clients.get(connectionId);
        if (!active) {
            throw new Error(`Session not found for connection ID: ${connectionId}`);
        }
        if (active.status !== CLIENT_STATUS.READY) {
            throw new Error(`Client not ready. Current status: ${active.status}`);
        }

        let cleanedTo = String(to).trim();
        if (cleanedTo.startsWith("+")) cleanedTo = cleanedTo.slice(1);
        if (!cleanedTo.endsWith("@c.us")) cleanedTo = `${cleanedTo}@c.us`;
        

        // sends typing indicator for 25 seconds
        // return active.client.sendStateTyping();

        return active.client.sendMessage(cleanedTo, message);
    }

    /**
     * Destroy a client
     */
    async destroyClient(connectionId: string): Promise<void> {
        const active = this.clients.get(connectionId);
        if (!active) {
            throw new Error(`Session not found for connection ID: ${connectionId}`);
        }

        try {
            await active.client.destroy();
            console.log(`[${connectionId}] Client destroyed successfully`);
        } catch (error) {
            console.error(`[${connectionId}] Error destroying client:`, error);
        }

        // Remove from clients map
        this.clients.delete(connectionId);
    }

    /**
     * Get event handler
     */
    getEventHandler(): EventHandler {
        return this.eventHandler;
    }
}
