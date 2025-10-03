import { useEffect, useState } from "react"
import { getMe } from "@/lib/services/auth"

type UseAuthResult = {
  isAuthenticated: boolean
  isLoading: boolean
  user: { id: string; email: string } | null
}

export function useAuth(): UseAuthResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UseAuthResult["user"]>(null)

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const res = await getMe()
        console.log("---- res -----", res)
        if (!canceled) {
          setUser(res.admin)
          setIsAuthenticated(true)
        }
      } catch {
        if (!canceled) {
          setUser(null)
          setIsAuthenticated(false)
        }
      } finally {
        if (!canceled) setIsLoading(false)
      }
    })()
    return () => {
      canceled = true
    }
  }, [])

  return { isAuthenticated, isLoading, user }
}


