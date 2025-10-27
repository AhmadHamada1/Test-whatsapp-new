"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, AlertCircle, RefreshCw } from "lucide-react"

interface EmptyStateProps {
  type: "empty" | "error"
  message: string
  onRetry?: () => void
  isLoading?: boolean
}

export function EmptyState({ type, message, onRetry, isLoading = false }: EmptyStateProps) {
  const Icon = type === "error" ? AlertCircle : Smartphone
  const iconSize = type === "error" ? "h-8 w-8" : "h-12 w-12"
  const iconColor = type === "error" ? "text-destructive" : "text-muted-foreground"

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Icon className={`${iconSize} ${iconColor} mb-4`} />
        <p className={`text-center mb-4 ${type === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          {message}
        </p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

