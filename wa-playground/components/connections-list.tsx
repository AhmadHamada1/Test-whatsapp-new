"use client"

import { useApi } from "@/contexts/api-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Smartphone, Power, MessageSquare, History } from "lucide-react"
import type { ConnectionStatus } from "@/lib/types"

interface ConnectionsListProps {
  onSendMessage: (connectionId: string) => void
  onViewMessages: (connectionId: string) => void
}

export function ConnectionsList({ onSendMessage, onViewMessages }: ConnectionsListProps) {
  const { connections, disconnectConnection } = useApi()

  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case "connected":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
      case "disconnected":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
    }
  }

  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No connections yet. Add your first connection to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {connections.map((connection) => (
        <Card key={connection.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{connection.deviceName}</CardTitle>
                  <CardDescription>
                    {connection.deviceDetail || "Waiting for device to scan QR code..."}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className={getStatusColor(connection.status)}>
                {connection.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {connection.status === "connected" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => onSendMessage(connection.id)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onViewMessages(connection.id)}>
                    <History className="h-4 w-4 mr-2" />
                    View Messages
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => disconnectConnection(connection.id)}>
                    <Power className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </>
              )}
              {connection.status === "pending" && (
                <p className="text-sm text-muted-foreground">Scan QR code to activate this connection</p>
              )}
              {connection.status === "disconnected" && (
                <p className="text-sm text-muted-foreground">Connection inactive</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
