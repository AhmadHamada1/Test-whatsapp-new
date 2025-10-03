import { useEffect, useState } from "react"

type UseAuthResult = {
  isAuthenticated: boolean
  isLoading: boolean
}

export function useAuth(): UseAuthResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      setIsAuthenticated(Boolean(token))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isAuthenticated, isLoading }
}


