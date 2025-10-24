"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone } from "lucide-react"
import type { Connection } from "@/lib/types"
import { ClientInfo } from "./client-info"
import { ConnectionActions } from "./connection-actions"
import { ConnectionStatus } from "./connection-status"

interface ConnectionCardProps {
  connection: Connection
  onSendMessage: (connectionId: string) => void
  onViewMessages: (connectionId: string) => void
  onDisconnect: (connectionId: string) => void
  onRestore: (connectionId: string) => void
  onShowQR: (connection: { connectionId: string; name?: string; qrCode?: string }) => void
  isDisconnecting: boolean
  isSendingMessage?: boolean
  isViewingMessages?: boolean
  isRestoring?: boolean
  isShowingQR?: boolean
}

export function ConnectionCard({
  connection,
  onSendMessage,
  onViewMessages,
  onDisconnect,
  onRestore,
  onShowQR,
  isDisconnecting,
  isSendingMessage = false,
  isViewingMessages = false,
  isRestoring = false,
  isShowingQR = false
}: ConnectionCardProps) {

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{connection.name || "Unnamed Connection"}</CardTitle>
              <CardDescription>
                {connection.lastActivity 
                  ? `Last active: ${new Date(connection.lastActivity).toLocaleString()}` 
                  : "Waiting for device to scan QR code..."
                }
              </CardDescription>
              <ClientInfo clientInfo={connection.clientInfo} />
            </div>
          </div>
          <ConnectionStatus status={connection.status} />
        </div>
      </CardHeader>
      <CardContent>
        <ConnectionActions
          connection={connection}
          onSendMessage={onSendMessage}
          onViewMessages={onViewMessages}
          onDisconnect={onDisconnect}
          onRestore={onRestore}
          onShowQR={onShowQR}
          isDisconnecting={isDisconnecting}
          isSendingMessage={isSendingMessage}
          isViewingMessages={isViewingMessages}
          isRestoring={isRestoring}
          isShowingQR={isShowingQR}
        />
      </CardContent>
    </Card>
  )
}

