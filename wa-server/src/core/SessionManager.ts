import * as fs from 'fs';
import * as path from 'path';
import { ConnectionService } from '../modules/wa/service';
import { ReloadResult } from '../types/WhatsappTypes';
import { IConnection } from '../modules/wa/model';
import { ConnectionStatus } from '../types';
import { SESSION_DIRS } from '../constants/WhatsappConstants';

export class SessionManager {
    /**
     * Delete session cache and auth data
     */
    async deleteSessionData(connectionId: string): Promise<void> {
        try {
            console.log(`[${connectionId}] Deleting session data`, process.cwd());
            const authDir = path.join(process.cwd(), SESSION_DIRS.AUTH, `session-${connectionId}`);
            const cacheDir = path.join(process.cwd(), SESSION_DIRS.CACHE, `session-${connectionId}`);

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

    /**
     * Get all past sessions from database (for a specific API key)
     */
    async getPastSessions(apiKeyId: string): Promise<IConnection[]> {
        try {
            return await ConnectionService.getConnectionsByApiKey(apiKeyId);
        } catch (error) {
            console.error('Error fetching past sessions:', error);
            return [];
        }
    }

    /**
     * Get all connections from database
     */
    async getAllConnections(): Promise<IConnection[]> {
        try {
            return await ConnectionService.getAllConnections();
        } catch (error) {
            console.error('Error fetching all connections:', error);
            return [];
        }
    }

    /**
     * Get connection by ID only
     */
    async getConnectionById(connectionId: string): Promise<IConnection | null> {
        try {
            return await ConnectionService.getConnectionByIdOnly(connectionId);
        } catch (error) {
            console.error(`Error fetching connection ${connectionId}:`, error);
            return null;
        }
    }

    /**
     * Update connection status in database
     */
    async updateConnectionStatus(connectionId: string, apiKeyId: string, status: ConnectionStatus): Promise<void> {
        try {
            await ConnectionService.updateConnectionStatus(connectionId, apiKeyId, status);
        } catch (error) {
            console.error(`Error updating connection status for ${connectionId}:`, error);
            throw error;
        }
    }

    /**
     * Update connection client info in database
     */
    async updateConnectionClientInfo(connectionId: string, apiKeyId: string, clientInfo: any): Promise<void> {
        try {
            await ConnectionService.updateConnectionClientInfo(connectionId, apiKeyId, clientInfo);
        } catch (error) {
            console.error(`Error updating client info for ${connectionId}:`, error);
            throw error;
        }
    }

    /**
     * Reload all past sessions from database
     */
    async reloadPastSessions(restoreSessionCallback: (connectionId: string, apiKeyId: string) => Promise<void>): Promise<void> {
        try {
            console.log('Starting to reload past sessions...');

            // Get all connections that were previously connected
            const connections = await this.getAllConnections();

            console.log(`Found ${connections.length} past connections to reload`);

            for (const connection of connections) {
                // Only reload connections that were previously connected
                if (connection.status === 'ready') {
                    try {
                        const connectionId = (connection._id as any).toString();
                        const apiKeyId = (connection.apiKeyId as any).toString();
                        await restoreSessionCallback(connectionId, apiKeyId);
                        console.log(`Successfully restored session: ${connectionId}`);
                    } catch (error) {
                        const connectionId = (connection._id as any).toString();
                        const apiKeyId = (connection.apiKeyId as any).toString();
                        console.error(`Failed to restore session ${connectionId}:`, error);
                        // Update status to disconnected if restoration fails
                        await this.updateConnectionStatus(
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

    /**
     * Reload a specific session by connection ID
     */
    async reloadSession(
        connectionId: string, 
        disconnectCallback: (connectionId: string) => Promise<void>,
        restoreSessionCallback: (connectionId: string, apiKeyId: string) => Promise<void>
    ): Promise<ReloadResult> {
        try {
            console.log(`Reloading specific session: ${connectionId}`);

            // Get connection details from database
            const connection = await this.getConnectionById(connectionId);
            if (!connection) {
                return {
                    success: false,
                    message: `Connection ${connectionId} not found in database`
                };
            }

            // Restore the session
            await restoreSessionCallback(connectionId, (connection.apiKeyId as any).toString());

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
}
