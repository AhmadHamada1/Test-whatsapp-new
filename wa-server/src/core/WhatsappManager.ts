import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { ConnectionService } from '../modules/wa/service';

interface ActiveClient {
    id: string;
    client: Client;
    status: 'qr_pending' | 'ready' | 'disconnected';
    qr?: string;
}

class WhatsappManager {
    private static instance: WhatsappManager;
    private clients: Map<string, ActiveClient> = new Map();

    private constructor() { }

    public static getInstance(): WhatsappManager {
        if (!WhatsappManager.instance) {
            WhatsappManager.instance = new WhatsappManager();
        }
        return WhatsappManager.instance;
    }

    /** Create a new WhatsApp connection and return QR */
    async createConnection(connectionId: string, apiKeyId: string): Promise<{ qr: string }> {
        return new Promise((resolve, reject) => {
            const client = new Client({
                authStrategy: new LocalAuth({ clientId: connectionId }),
                puppeteer: { headless: true, args: ['--no-sandbox'] },
            });

            client.on('qr', async (qr) => {
                const qrImage = await QRCode.toDataURL(qr);
                this.clients.set(connectionId, { id: connectionId, client, qr: qrImage, status: 'qr_pending' });
                resolve({ qr: qrImage });
            });

            client.on('ready', async () => {
                console.log(`[${connectionId}] connected`);
                const session = this.clients.get(connectionId);
                if (!session) {
                    console.error(`[${connectionId}] Session not found in ready event`);
                    return;
                }

                session.status = 'ready';

                // Update database with connected status
                try {
                    await ConnectionService.updateConnectionStatus(connectionId, apiKeyId, 'connected');
                    console.log(`[${connectionId}] Database updated: connected`);
                } catch (error) {
                    session.status = 'qr_pending';
                    console.error(`[${connectionId}] Failed to update database:`, error);
                }
            });

            client.on('disconnected', async () => {
                console.log(`[${connectionId}] disconnected`);

                // Update database with disconnected status
                try {
                    await ConnectionService.updateConnectionStatus(connectionId, apiKeyId, 'disconnected');
                    console.log(`[${connectionId}] Database updated: disconnected`);
                } catch (error) {
                    console.error(`[${connectionId}] Failed to update database:`, error);
                }

                this.clients.delete(connectionId);
            });

            client.initialize().catch(reject);
        });
    }

    /** Send a message */
    async sendMessage(connectionId: string, to: string, message: string) {
        console.log("sending message", connectionId, to, message);
        const active = this.clients.get(connectionId);
        if (!active) {
            throw new Error(`Session not found for connection ID: ${connectionId}`);
        }
        if (active.status !== 'ready') {
            throw new Error(`Client not ready. Current status: ${active.status}`);
        }
        return active.client.sendMessage(to, message);
    }

    /** Disconnect a client */
    async disconnect(connectionId: string) {
        const active = this.clients.get(connectionId);
        if (!active) {
            throw new Error(`Session not found for connection ID: ${connectionId}`);
        }
        await active.client.destroy();
        this.clients.delete(connectionId);
    }

    /** Get connection status */
    getConnectionStatus(connectionId: string): { exists: boolean; status?: string; error?: string } {
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

    /** List all active clients */
    listConnections() {
        return Array.from(this.clients.values()).map((c) => ({
            id: c.id,
            status: c.status,
        }));
    }
}

export default WhatsappManager.getInstance();