import { ApiCallLog, IApiCallLog } from './model';
import { IApiKey } from '../api-key/model';

export class ApiLogsService {
  /**
   * Create a new API call log entry
   */
  static async createLog(logData: {
    apiKey: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    requestBody?: any;
    responseStatus: number;
    responseBody?: any;
    responseTime?: number;
    userAgent?: string;
    ipAddress?: string;
    error?: string;
  }): Promise<IApiCallLog> {
    try {
      const log = new ApiCallLog({
        apiKey: logData.apiKey,
        endpoint: logData.endpoint,
        method: logData.method,
        requestBody: logData.requestBody,
        responseStatus: logData.responseStatus,
        responseBody: logData.responseBody,
        responseTime: logData.responseTime,
        userAgent: logData.userAgent,
        ipAddress: logData.ipAddress,
        error: logData.error,
      });

      return await log.save();
    } catch (error) {
      console.error('Error creating API call log:', error);
      throw error;
    }
  }

  /**
   * Get API logs for a specific API key
   */
  static async getLogsByApiKey(
    apiKeyId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<IApiCallLog[]> {
    try {
      return await ApiCallLog
        .find({ apiKey: apiKeyId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate('apiKey', 'name description')
        .exec();
    } catch (error) {
      console.error('Error fetching API logs by API key:', error);
      throw error;
    }
  }

  /**
   * Get API logs for a specific endpoint
   */
  static async getLogsByEndpoint(
    endpoint: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<IApiCallLog[]> {
    try {
      return await ApiCallLog
        .find({ endpoint })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate('apiKey', 'name description')
        .exec();
    } catch (error) {
      console.error('Error fetching API logs by endpoint:', error);
      throw error;
    }
  }

  /**
   * Get API logs by response status
   */
  static async getLogsByStatus(
    status: number, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<IApiCallLog[]> {
    try {
      return await ApiCallLog
        .find({ responseStatus: status })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate('apiKey', 'name description')
        .exec();
    } catch (error) {
      console.error('Error fetching API logs by status:', error);
      throw error;
    }
  }

  /**
   * Get all API logs with pagination
   */
  static async getAllLogs(
    limit: number = 50, 
    offset: number = 0,
    filters?: {
      apiKey?: string;
      endpoint?: string;
      method?: string;
      responseStatus?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<IApiCallLog[]> {
    try {
      const query: any = {};

      if (filters?.apiKey) {
        query.apiKey = filters.apiKey;
      }
      if (filters?.endpoint) {
        query.endpoint = { $regex: filters.endpoint, $options: 'i' };
      }
      if (filters?.method) {
        query.method = filters.method;
      }
      if (filters?.responseStatus) {
        query.responseStatus = filters.responseStatus;
      }
      if (filters?.startDate || filters?.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
          query.createdAt.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.createdAt.$lte = filters.endDate;
        }
      }

      return await ApiCallLog
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate('apiKey', 'name description')
        .exec();
    } catch (error) {
      console.error('Error fetching all API logs:', error);
      throw error;
    }
  }

  /**
   * Get API logs statistics
   */
  static async getLogsStatistics(apiKeyId?: string): Promise<{
    totalLogs: number;
    successCount: number;
    errorCount: number;
    averageResponseTime: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
    statusDistribution: Array<{ status: number; count: number }>;
  }> {
    try {
      const matchQuery = apiKeyId ? { apiKey: apiKeyId } : {};

      const [
        totalLogs,
        successCount,
        errorCount,
        avgResponseTime,
        topEndpoints,
        statusDistribution
      ] = await Promise.all([
        ApiCallLog.countDocuments(matchQuery),
        ApiCallLog.countDocuments({ ...matchQuery, responseStatus: { $gte: 200, $lt: 300 } }),
        ApiCallLog.countDocuments({ ...matchQuery, responseStatus: { $gte: 400 } }),
        ApiCallLog.aggregate([
          { $match: { ...matchQuery, responseTime: { $exists: true } } },
          { $group: { _id: null, avgTime: { $avg: '$responseTime' } } }
        ]),
        ApiCallLog.aggregate([
          { $match: matchQuery },
          { $group: { _id: '$endpoint', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { endpoint: '$_id', count: 1, _id: 0 } }
        ]),
        ApiCallLog.aggregate([
          { $match: matchQuery },
          { $group: { _id: '$responseStatus', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { status: '$_id', count: 1, _id: 0 } }
        ])
      ]);

      return {
        totalLogs,
        successCount,
        errorCount,
        averageResponseTime: avgResponseTime[0]?.avgTime || 0,
        topEndpoints,
        statusDistribution
      };
    } catch (error) {
      console.error('Error fetching API logs statistics:', error);
      throw error;
    }
  }

  /**
   * Delete old API logs (cleanup)
   */
  static async deleteOldLogs(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await ApiCallLog.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      return result.deletedCount || 0;
    } catch (error) {
      console.error('Error deleting old API logs:', error);
      throw error;
    }
  }
}
