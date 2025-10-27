// API client for making requests to backend

export class ApiClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl = "/api") {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Connections
  async getConnections() {
    return this.request<{ connections: any[] }>("/ connections")
  }

  async createConnection(deviceName: string, deviceDetail: string) {
    return this.request<{ connection: any }>("/connections", {
      method: "POST",
      body: JSON.stringify({ deviceName, deviceDetail }),
    })
  }

  async getConnection(id: string) {
    return this.request<{ connection: any }>(`/connections/${id}`)
  }

  async updateConnectionStatus(id: string, status: string) {
    return this.request<{ connection: any }>(`/connections/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  }

  async deleteConnection(id: string) {
    return this.request<{ message: string; id: string }>(`/connections/${id}`, {
      method: "DELETE",
    })
  }

  async getQRCode(id: string) {
    return this.request<{ qrCode: string; connectionId: string }>(`/connections/${id}/qr`)
  }

  // Messages
  async getMessages(connectionId: string) {
    return this.request<{ messages: any[]; connectionId: string }>(`/messages?connectionId=${connectionId}`)
  }

  async sendMessage(connectionId: string, phoneNumber: string, message: string) {
    return this.request<{ message: any; success: boolean }>("/messages", {
      method: "POST",
      body: JSON.stringify({ connectionId, phoneNumber, message }),
    })
  }

  async getMessageStatus(id: string) {
    return this.request<{ message: any }>(`/messages/${id}`)
  }
}
