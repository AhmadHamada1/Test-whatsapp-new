import { Client } from 'whatsapp-web.js';
import { ConnectionService } from '../modules/wa/service';
import { ActiveClient, ClientInfo } from '../types/WhatsappTypes';
import { CONNECTION_STATUS } from '../constants/ConnectionStatus';

export class EventHandler {
    private clients: Map<string, ActiveClient>;

    constructor(clients: Map<string, ActiveClient>) {
        this.clients = clients;
    }

    /**
     * Handle QR code generation event
     */
    async handleQREvent(connectionId: string, qr: string): Promise<string> {
        const QRCode = await import('qrcode');
        const qrImage = await QRCode.toDataURL(qr);

        const session = this.clients.get(connectionId);
        if (session) {
            session.qr = qrImage;
            session.status = CONNECTION_STATUS.WAITING_CONNECTION;
        }

        return qrImage;
    }

    /**
     * Handle client ready event
     */
    async handleReadyEvent(connectionId: string, client: Client, apiKeyId: string): Promise<void> {
        console.log(`[${connectionId}] connected`);

        const session = this.clients.get(connectionId);
        if (!session) {
            console.error(`[${connectionId}] Session not found in ready event`);
            return;
        }

        session.status = CONNECTION_STATUS.READY;

        // Update database with connected status
        try {
            await ConnectionService.updateConnectionStatus(connectionId, apiKeyId, CONNECTION_STATUS.READY);
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
            session.status = CONNECTION_STATUS.WAITING_CONNECTION;
            console.error(`[${connectionId}] Failed to update database:`, error);
        }
    }

    /**
     * Handle client disconnected event
     */
    async handleDisconnectedEvent(connectionId: string, apiKeyId: string): Promise<void> {
        console.log(`[${connectionId}] disconnected`);

        // Update database with disconnected status
        try {
            await ConnectionService.updateConnectionStatus(connectionId, apiKeyId, CONNECTION_STATUS.DISCONNECTED);
            console.log(`[${connectionId}] Database updated: disconnected`);
        } catch (error) {
            console.error(`[${connectionId}] Failed to update database:`, error);
        }

        this.clients.delete(connectionId);
    }

    /**
     * Handle QR event during restoration
     */
    handleQREventDuringRestoration(connectionId: string): void {
        console.log(`[${connectionId}] QR code generated during restoration - session may need re-authentication`);
        // Don't update the session status here as this indicates the session needs re-authentication
    }

    /**
     * Capture client information
     */
    private async captureClientInfo(client: Client, connectionId: string): Promise<ClientInfo> {
        try {
            const clientInfo: ClientInfo = {
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
