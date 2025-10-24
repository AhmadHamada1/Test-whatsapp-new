"use client"

import { useApi } from "@/contexts/api-context"
import { QRCodeDialog } from "./qr-code-dialog"
import { ConnectionCard } from "./connection-card"
import { EmptyState } from "./empty-state"
import { useState } from "react"

interface ConnectionsListProps {
  onSendMessage: (connectionId: string) => void
  onViewMessages: (connectionId: string) => void
}

export function ConnectionsList({ onSendMessage, onViewMessages }: ConnectionsListProps) {
  const {
    connections,
    disconnectConnection,
    restoreConnection,
    loadConnections,
    isLoadingConnections,
    connectionsError,
    getLoadingState
  } = useApi()

  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<{ id: string; name?: string; qrCode?: string } | null>(null)

  const handleShowQR = (connection: { connectionId: string; name?: string; qrCode?: string }) => {
    setSelectedConnection({
      id: connection.connectionId,
      name: connection.name,
      qrCode: connection.qrCode
    })
    setQrDialogOpen(true)
  }

  const handleCloseQR = () => {
    setQrDialogOpen(false)
    setSelectedConnection(null)
  }

  const handleRestoreConnection = async (connectionId: string) => {
    try {
      await restoreConnection(connectionId)
    } catch (error) {
      console.error('Failed to restore connection:', error)
    }
  }

  const handleDisconnect = async (connectionId: string) => {
    try {
      await disconnectConnection(connectionId)
    } catch (error) {
      console.error('Failed to disconnect connection:', error)
    }
  }

  // Show loading state
  if (isLoadingConnections) {
    return (
      <EmptyState
        type="empty"
        message="Loading connections..."
        isLoading={true}
      />
    )
  }

  // Show error state
  if (connectionsError) {
    return (
      <EmptyState
        type="error"
        message={connectionsError}
        onRetry={loadConnections}
        isLoading={isLoadingConnections}
      />
    )
  }

  // Show empty state
  if (connections.length === 0) {
    return (
      <EmptyState
        type="empty"
        message="No connections yet. Add your first connection to get started."
      />
    )
  }

  return (
    <div className="space-y-4">
      {connections.map((connection) => (
        <ConnectionCard
          key={connection.connectionId}
          connection={connection}
          onSendMessage={onSendMessage}
          onViewMessages={onViewMessages}
          onDisconnect={handleDisconnect}
          onRestore={handleRestoreConnection}
          onShowQR={handleShowQR}
          isDisconnecting={getLoadingState(connection.connectionId, 'isDisconnecting')}
          isSendingMessage={getLoadingState(connection.connectionId, 'isSendingMessage')}
          isViewingMessages={getLoadingState(connection.connectionId, 'isViewingMessages')}
          isRestoring={getLoadingState(connection.connectionId, 'isRestoring')}
          isShowingQR={getLoadingState(connection.connectionId, 'isShowingQR')}
        />
      ))}

      {/* QR Code Dialog */}
      <QRCodeDialog
        connectionId={selectedConnection?.id || ""}
        connectionName={selectedConnection?.name}
        qrCodeUrl={selectedConnection?.qrCode}
        isOpen={qrDialogOpen}
        onClose={handleCloseQR}
      />
    </div>
  )
}