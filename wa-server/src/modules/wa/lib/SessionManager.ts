import { SessionStore } from "./SessionStore";
import { WorkerPool } from "./WorkerPool";

export class SessionManager {
  private static instance: SessionManager;
  private sessionStore: SessionStore;
  private workerPool: WorkerPool;

  private constructor() {
    this.sessionStore = new SessionStore();
    this.workerPool = new WorkerPool();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async handleConnection(userId: string) {
    const connection = await this.sessionStore.createSession(userId);
    return connection;
  }

  async handleMessageSend(connectionId: string, message: string) {
    const session = await this.sessionStore.getSession(connectionId);
    if (!session) throw new Error('Connection not found');
    const worker = this.workerPool.getWorkerForSession(connectionId);
    const result = await worker.processRequest(connectionId, { message });
    await this.sessionStore.updateSession(connectionId, result.updatedState);
    return result.response;
  }
}