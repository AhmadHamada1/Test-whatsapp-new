import axios, { AxiosInstance } from 'axios'

export const baseURL = 'http://localhost:4001'
const waPrefix = `v1/wa`

// Create axios instance with default configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${baseURL}/${waPrefix}`,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  },
})

// Request interceptor for logging and error handling
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url}`)
    
    return config
  },
  (error) => {
    console.error('[Axios] Request error:', error)
    console.log(error.response.data)
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
      console.log("error.response:", error.response)
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
