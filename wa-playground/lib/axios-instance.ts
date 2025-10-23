import axios, { AxiosInstance } from 'axios'

// Create axios instance with default configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:4001/v1/wa',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  },
})

// Function to get API key from localStorage (client-side)
const getApiKeyFromStorage = (): string | null => {
  if (typeof window !== 'undefined') {
    // Client-side: get from localStorage
    const storedKey = localStorage.getItem('api_key')
    if (storedKey) {
      return storedKey
    }
    // Fallback to test API key for development
    return 'test-api-key-12345'
  }
  return 'test-api-key-12345'
}

// Request interceptor for logging, error handling, and automatic API key injection
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url}`)
    
    // Automatically add API key if not already present
    if (!config.headers['x-api-key']) {
      const apiKey = getApiKeyFromStorage()
      if (apiKey) {
        config.headers['x-api-key'] = apiKey
      }
    }
    
    return config
  },
  (error) => {
    console.error('[Axios] Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[Axios] Response ${response.status} for ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('[Axios] Response error:', error)
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.error || `HTTP ${error.response.status}`
      throw new Error(errorMessage)
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - no response received')
    } else {
      // Something else happened
      throw new Error(error.message || 'Unknown error occurred')
    }
  }
)

// Export the configured axios instance
export default axiosInstance
