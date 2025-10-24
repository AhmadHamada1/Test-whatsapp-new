import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { ConnectionService } from '../modules/wa/service';
import { IConnection } from '../modules/wa/model';
import * as fs from 'fs';
import * as path from 'path';

interface ActiveClient {
    id: string;
    status: 'qr_pending' | 'ready' | 'disconnected' | "needs_restore";
    client: Client;
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
                    await ConnectionService.updateConnectionStatus(connectionId, apiKeyId, 'ready');
                    console.log(`[${connectionId}] Database updated: connected`);
                    
                    // Capture and save client information
                    try {
                        const clientInfo = await this.captureClientInfo(client, connectionId);
                        await ConnectionService.updateConnectionClientInfo(connectionId, apiKeyId, clientInfo);
                        console.log(`[${connectionId}] Client info saved:`, {
                            phoneNumber: clientInfo.phoneNumber,
                            platform: clientInfo.platform,
                            profileName: clientInfo.whatsappInfo?.profileName
                        });
                    } catch (clientInfoError) {
                        console.warn(`[${connectionId}] Failed to save client info:`, clientInfoError);
                        // Don't fail the connection if client info capture fails
                    }
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
        console.log("connection status", active);
        return active.client.sendMessage(to, message);
    }

    /** Disconnect a client */
    async disconnect(connectionId: string) {
        const active = this.clients.get(connectionId);
        if (!active) {
            throw new Error(`Session not found for connection ID: ${connectionId}`);
        }

        try {
            // Destroy the client first
            await active.client.destroy();
            console.log(`[${connectionId}] Client destroyed successfully`);
        } catch (error) {
            console.error(`[${connectionId}] Error destroying client:`, error);
        }

        // Remove from clients map
        this.clients.delete(connectionId);

        // Delete session cache and auth data
        await this.deleteSessionData(connectionId);

        console.log(`[${connectionId}] Disconnected and cleaned up session data`);
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

    /** Check if a connection exists in the manager */
    hasConnection(connectionId: string): boolean {
        return this.clients.has(connectionId);
    }

    /** Get realistic status for a connection */
    getRealisticStatus(connectionId: string): { 
        status: 'ready' | 'needs_restore' | 'disconnected' | 'expired';
        message: string;
        needsRestore: boolean;
    } {
        const active = this.clients.get(connectionId);
        
        if (!active) {
            return {
                status: 'needs_restore',
                message: 'Connection needs to be restored before use',
                needsRestore: true
            };
        }

        switch (active.status) {
            case 'ready':
                return {
                    status: 'ready',
                    message: 'Connection is ready to send messages',
                    needsRestore: false
                };
            case 'qr_pending':
                return {
                    status: 'expired',
                    message: 'Connection expired, needs to scan QR code again',
                    needsRestore: false
                };
            case 'disconnected':
                return {
                    status: 'disconnected',
                    message: 'Connection is disconnected',
                    needsRestore: true
                };
            default:
                return {
                    status: 'needs_restore',
                    message: 'Connection status unknown, needs to be restored',
                    needsRestore: true
                };
        }
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
                if (connection.status === 'ready') {
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

    /** Reload map without creating actual clients (for server restart) */
    async reloadMapOnly(): Promise<void> {
        try {
            console.log('Reloading connection map without creating clients...');
            
            // Get all connections from database
            const connections = await ConnectionService.getAllConnections();
            
            console.log(`Found ${connections.length} connections in database`);
            
            // Clear existing clients map
            this.clients.clear();
            
            // Just log the connections without creating clients
            for (const connection of connections) {
                const connectionId = (connection._id as any).toString();
                console.log(`Connection ${connectionId}: status=${connection.status}`);
            }
            
            console.log('Connection map reloaded successfully (no clients created)');
        } catch (error) {
            console.error('Error reloading connection map:', error);
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
                    await ConnectionService.updateConnectionStatus(connectionId, apiKeyId, 'ready');
                    console.log(`[${connectionId}] Database updated: connected`);
                    
                    // Capture and save client information
                    try {
                        const clientInfo = await this.captureClientInfo(client, connectionId);
                        await ConnectionService.updateConnectionClientInfo(connectionId, apiKeyId, clientInfo);
                        console.log(`[${connectionId}] Client info saved:`, {
                            phoneNumber: clientInfo.phoneNumber,
                            platform: clientInfo.platform,
                            profileName: clientInfo.whatsappInfo?.profileName
                        });
                    } catch (clientInfoError) {
                        console.warn(`[${connectionId}] Failed to save client info:`, clientInfoError);
                        // Don't fail the connection if client info capture fails
                    }
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

            // Add session to clients map with 'qr_pending' status
            this.clients.set(connectionId, {
                id: connectionId,
                client,
                status: 'qr_pending'
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

    /** Helper function to delete session cache and auth data */
    private async deleteSessionData(connectionId: string): Promise<void> {
        try {
            console.log(`[${connectionId}] Deleting session data`, process.cwd());
            const authDir = path.join(process.cwd(), '.wwebjs_auth', `session-${connectionId}`);
            const cacheDir = path.join(process.cwd(), '.wwebjs_cache', `session-${connectionId}`);

            // Delete auth directory if it exists
            if (fs.existsSync(authDir)) {
                fs.rmSync(authDir, { recursive: true, force: true });
                console.log(`[${connectionId}] Deleted auth directory: ${authDir}`);
            }

            // Delete cache directory if it exists
            if (fs.existsSync(cacheDir)) {
                fs.rmSync(cacheDir, { recursive: true, force: true });
                console.log(`[${connectionId}] Deleted cache directory: ${cacheDir}`);
            }
        } catch (error) {
            console.error(`[${connectionId}] Error deleting session data:`, error);
            // Don't throw error here as we still want to disconnect the client
        }
    }

    /** Helper function to capture client information */
    private async captureClientInfo(client: Client, connectionId: string): Promise<any> {
        try {
            const clientInfo: any = {
                connectionDetails: {
                    connectedAt: new Date(),
                    lastSeen: new Date()
                }
            };

            // Get client info from WhatsApp Web
            try {
                const clientInfoData = await client.info;
                if (clientInfoData) {
                    clientInfo.phoneNumber = clientInfoData.wid?.user;
                    clientInfo.platform = 'WhatsApp Web';
                    
                    // Extract phone details if available
                    if (clientInfoData.pushname) {
                        clientInfo.whatsappInfo = {
                            profileName: clientInfoData.pushname,
                            isBusiness: false, // Default to false, can be updated later
                            isVerified: false // Default to false, can be updated later
                        };
                    }
                }
            } catch (infoError) {
                console.warn(`[${connectionId}] Could not get client info:`, infoError);
            }

            // Try to get device info
            try {
                const deviceInfo = await client.getState();
                if (deviceInfo) {
                    clientInfo.platform = deviceInfo;
                }
            } catch (deviceError) {
                console.warn(`[${connectionId}] Could not get device info:`, deviceError);
            }

            return clientInfo;
        } catch (error) {
            console.error(`[${connectionId}] Error capturing client info:`, error);
            return {
                connectionDetails: {
                    connectedAt: new Date(),
                    lastSeen: new Date()
                }
            };
        }
    }
}

export default WhatsappManager.getInstance();