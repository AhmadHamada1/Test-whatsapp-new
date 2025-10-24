import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { ConnectionService } from '../modules/wa/service';
import { IConnection } from '../modules/wa/model';

interface ActiveClient {
    id: string;
    client: Client;
    status: 'qr_pending' | 'ready' | 'disconnected' | 'restoring';
    qr?: string;
}

// Strategy, we need a status on the connection
// if the connection is not ready, the user first needs to activate the connection
// when the connection is ready, the user can send messages

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

    /** Reload all past sessions from database */
    async reloadPastSessions(): Promise<void> {
        try {
            console.log('Starting to reload past sessions...');
            
            // Get all connections that were previously connected
            const connections = await ConnectionService.getAllConnections();
            
            console.log(`Found ${connections.length} past connections to reload`);
            
            for (const connection of connections) {
                // Only reload connections that were previously connected
                if (connection.status === 'connected') {
                    try {
                        const connectionId = (connection._id as any).toString();
                        const apiKeyId = (connection.apiKeyId as any).toString();
                        await this.restoreSession(connectionId, apiKeyId);
                        console.log(`Successfully restored session: ${connectionId}`);
                    } catch (error) {
                        const connectionId = (connection._id as any).toString();
                        const apiKeyId = (connection.apiKeyId as any).toString();
                        console.error(`Failed to restore session ${connectionId}:`, error);
                        // Update status to disconnected if restoration fails
                        await ConnectionService.updateConnectionStatus(
                            connectionId, 
                            apiKeyId, 
                            'disconnected'
                        );
                    }
                }
            }
            
            console.log('Finished reloading past sessions');
        } catch (error) {
            console.error('Error reloading past sessions:', error);
        }
    }

    /** Reload a specific session by connection ID */
    async reloadSession(connectionId: string): Promise<{ success: boolean; message: string }> {
        try {
            console.log(`Reloading specific session: ${connectionId}`);
            
            // First, check if session already exists and disconnect it
            if (this.clients.has(connectionId)) {
                console.log(`Session ${connectionId} already exists, disconnecting first...`);
                await this.disconnect(connectionId);
            }
            
            // Get connection details from database
            const connection = await ConnectionService.getConnectionByIdOnly(connectionId);
            if (!connection) {
                return {
                    success: false,
                    message: `Connection ${connectionId} not found in database`
                };
            }
            
            // Restore the session
            await this.restoreSession(connectionId, (connection.apiKeyId as any).toString());
            
            return {
                success: true,
                message: `Session ${connectionId} reloaded successfully`
            };
        } catch (error) {
            console.error(`Error reloading session ${connectionId}:`, error);
            return {
                success: false,
                message: `Failed to reload session ${connectionId}: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /** Restore a specific session by connectionId */
    async restoreSession(connectionId: string, apiKeyId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // Check if session already exists
            if (this.clients.has(connectionId)) {
                console.log(`Session ${connectionId} already exists, skipping restoration`);
                resolve();
                return;
            }

            console.log(`Restoring session: ${connectionId}`);
            
            const client = new Client({
                authStrategy: new LocalAuth({ clientId: connectionId }),
                puppeteer: { headless: true, args: ['--no-sandbox'] },
            });

            // Set up event handlers
            client.on('ready', async () => {
                console.log(`[${connectionId}] Session restored and ready`);
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
                    session.status = 'disconnected';
                    console.error(`[${connectionId}] Failed to update database:`, error);
                }
                
                resolve();
            });

            client.on('disconnected', async () => {
                console.log(`[${connectionId}] Restored session disconnected`);
                
                // Update database with disconnected status
                try {
                    await ConnectionService.updateConnectionStatus(connectionId, apiKeyId, 'disconnected');
                    console.log(`[${connectionId}] Database updated: disconnected`);
                } catch (error) {
                    console.error(`[${connectionId}] Failed to update database:`, error);
                }

                this.clients.delete(connectionId);
            });

            client.on('qr', async (qr) => {
                console.log(`[${connectionId}] QR code generated during restoration - session may need re-authentication`);
                // Don't update the session status here as this indicates the session needs re-authentication
            });

            // Add session to clients map with 'restoring' status
            this.clients.set(connectionId, { 
                id: connectionId, 
                client, 
                status: 'restoring' 
            });

            // Initialize the client
            client.initialize().catch((error) => {
                console.error(`[${connectionId}] Failed to initialize restored session:`, error);
                this.clients.delete(connectionId);
                reject(error);
            });
        });
    }

    /** Get all past sessions from database (for a specific API key) */
    async getPastSessions(apiKeyId: string): Promise<IConnection[]> {
        try {
            return await ConnectionService.getConnectionsByApiKey(apiKeyId);
        } catch (error) {
            console.error('Error fetching past sessions:', error);
            return [];
        }
    }
}

export default WhatsappManager.getInstance();