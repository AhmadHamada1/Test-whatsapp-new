import { Connection, IConnection } from "./model";
import { ConnectionStatus } from "../../types";
import mongoose from "mongoose";

export class ConnectionService {
  /**
   * Get all connections for a specific API key
   */
  static async getConnectionsByApiKey(apiKeyId: string): Promise<IConnection[]> {
    try {
      const connections = await Connection.find({ 
        apiKeyId: new mongoose.Types.ObjectId(apiKeyId) 
      })
      .sort({ createdAt: -1 });
      
      return connections.map(conn => conn.toObject());
    } catch (error) {
      throw new Error(`Failed to fetch connections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all connections (for session restoration)
   */
  static async getAllConnections(): Promise<IConnection[]> {
    try {
      const connections = await Connection.find({})
        .sort({ createdAt: -1 });
      
      return connections.map(conn => conn.toObject());
    } catch (error) {
      throw new Error(`Failed to fetch all connections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific connection by ID and API key
   */
  static async getConnectionById(connectionId: string, apiKeyId: string): Promise<IConnection | null> {
    try {
      const connection = await Connection.findOne({ 
        _id: new mongoose.Types.ObjectId(connectionId),
        apiKeyId: new mongoose.Types.ObjectId(apiKeyId) 
      });
      
      return connection ? connection.toObject() : null;
    } catch (error) {
      throw new Error(`Failed to fetch connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific connection by ID only (for internal use)
   */
  static async getConnectionByIdOnly(connectionId: string): Promise<IConnection | null> {
    try {
      const connection = await Connection.findOne({ 
        _id: new mongoose.Types.ObjectId(connectionId)
      });
      
      return connection ? connection.toObject() : null;
    } catch (error) {
      throw new Error(`Failed to fetch connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new connection
   */
  static async createConnection(
    apiKeyId: string, 
    name?: string,
    deviceInfo?: any
  ): Promise<IConnection> {
    try {
      const connection = new Connection({
        apiKeyId: new mongoose.Types.ObjectId(apiKeyId),
        name,
        deviceInfo,
        lastActivity: new Date()
      });

      await connection.save();
      return connection;
    } catch (error) {
      throw new Error(`Failed to create connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update connection status
   */
  static async updateConnectionStatus(
    connectionId: string, 
    apiKeyId: string, 
    status: ConnectionStatus
  ): Promise<IConnection | null> {
    try {
      const connection = await Connection.findOneAndUpdate(
        { 
          _id: new mongoose.Types.ObjectId(connectionId),
          apiKeyId: new mongoose.Types.ObjectId(apiKeyId) 
        },
        { 
          status,
          lastActivity: new Date()
        },
        { new: true }
      );
      
      return connection ? connection.toObject() : null;
    } catch (error) {
      throw new Error(`Failed to update connection status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update connection QR code
   */
  static async updateConnectionQRCode(
    connectionId: string, 
    apiKeyId: string, 
    qrCode: string
  ): Promise<IConnection | null> {
    try {
      const connection = await Connection.findOneAndUpdate(
        { 
          _id: new mongoose.Types.ObjectId(connectionId),
          apiKeyId: new mongoose.Types.ObjectId(apiKeyId) 
        },
        { 
          qrCode,
          status: "waiting_connection",
          lastActivity: new Date()
        },
        { new: true }
      );
      
      return connection ? connection.toObject() : null;
    } catch (error) {
      throw new Error(`Failed to update connection QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a connection
   */
  static async deleteConnection(connectionId: string, apiKeyId: string): Promise<boolean> {
    try {
      const result = await Connection.deleteOne({ 
        _id: new mongoose.Types.ObjectId(connectionId),
        apiKeyId: new mongoose.Types.ObjectId(apiKeyId) 
      });
      
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get connection statistics for an API key
   */
  static async getConnectionStats(apiKeyId: string): Promise<{
    total: number;
    connected: number;
    connecting: number;
    disconnected: number;
    error: number;
  }> {
    try {
      const stats = await Connection.aggregate([
        { $match: { apiKeyId: new mongoose.Types.ObjectId(apiKeyId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        total: 0,
        connected: 0,
        connecting: 0,
        disconnected: 0,
        error: 0
      };

      stats.forEach(stat => {
        result.total += stat.count;
        result[stat._id as keyof typeof result] = stat.count;
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to get connection stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
