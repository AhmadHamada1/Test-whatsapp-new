"use client"

import { Badge } from "@/components/ui/badge"
import type { ConnectionStatus } from "@/lib/types"

interface ConnectionStatusProps {
  status: ConnectionStatus
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "text-green-600 border-green-200 bg-green-50"
      case "requesting_qr":
      case "waiting_connection":
        return "text-yellow-600 border-yellow-200 bg-yellow-50"
      case "needs_restore":
        return "text-orange-600 border-orange-200 bg-orange-50"
      case "disconnected":
        return "text-gray-600 border-gray-200 bg-gray-50"
      case "error":
        return "text-red-600 border-red-200 bg-red-50"
      default:
        return "text-gray-600 border-gray-200 bg-gray-50"
    }
  }

  const getStatusText = (status: string) => {
    return status.replace('_', ' ')
  }

  return (
    <Badge variant="outline" className={`${getStatusColor(status)} capitalize`}>
      {getStatusText(status)}
    </Badge>
  )
}

