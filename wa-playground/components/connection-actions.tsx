"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare, History, Power, Loader2, QrCode, Zap } from "lucide-react"
import type { Connection } from "@/lib/types"

interface ConnectionActionsProps {
  connection: Connection
  onSendMessage: (connectionId: string) => void
  onViewMessages: (connectionId: string) => void
  onDisconnect: (connectionId: string) => void
  onRestore: (connectionId: string) => void
  onShowQR: (connection: { connectionId: string; name?: string; qrCode?: string }) => void
  isDisconnecting: boolean
}

export function ConnectionActions({
  connection,
  onSendMessage,
  onViewMessages,
  onDisconnect,
  onRestore,
  onShowQR,
  isDisconnecting
}: ConnectionActionsProps) {
  const handleShowQR = () => {
    onShowQR({
      connectionId: connection.connectionId,
      name: connection.name,
      qrCode: connection.qrCode
    })
  }

  const handleDisconnect = () => {
    onDisconnect(connection.connectionId)
  }

  const handleRestore = () => {
    onRestore(connection.connectionId)
  }

  const handleSendMessage = () => {
    onSendMessage(connection.connectionId)
  }

  const handleViewMessages = () => {
    onViewMessages(connection.connectionId)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {connection.status === "ready" && (
        <>
          <Button size="sm" variant="outline" onClick={handleSendMessage}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          <Button size="sm" variant="outline" onClick={handleViewMessages}>
            <History className="h-4 w-4 mr-2" />
            View Messages
          </Button>
        </>
      )}

      {(connection.status === "requesting_qr" || connection.status === "waiting_connection") && (
        <>
          <p className="text-sm text-muted-foreground">Scan QR code to activate this connection</p>
          <Button size="sm" variant="outline" onClick={handleShowQR}>
            <QrCode className="h-4 w-4 mr-2" />
            Scan QR Code
          </Button>
        </>
      )}

      {connection.status === "needs_restore" && (
        <Button size="sm" variant="outline" onClick={handleRestore}>
          <Zap className="h-4 w-4 mr-2" />
          Restore Connection
        </Button>
      )}

      {connection.status === "disconnected" && (
        <p className="text-sm text-muted-foreground">Connection inactive</p>
      )}

      {connection.status === "error" && (
        <p className="text-sm text-muted-foreground">Connection error - please try reconnecting</p>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={handleDisconnect}
        disabled={isDisconnecting}
      >
        {isDisconnecting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Power className="h-4 w-4 mr-2" />
        )}
        Disconnect
      </Button>
    </div>
  )
}

