"use client"

import { useApi } from "@/contexts/api-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Smartphone, Power, MessageSquare, History, Loader2, AlertCircle, RefreshCw, QrCode } from "lucide-react"
import type { ConnectionStatus } from "@/lib/types"
import { QRCodeDialog } from "./qr-code-dialog"
import { useState } from "react"

interface ConnectionsListProps {
  onSendMessage: (connectionId: string) => void
  onViewMessages: (connectionId: string) => void
}

export function ConnectionsList({ onSendMessage, onViewMessages }: ConnectionsListProps) {
  const { 
    connections, 
    disconnectConnection, 
    loadConnections, 
    isLoadingConnections, 
    connectionsError 
  } = useApi()

  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<{ id: string; name?: string; qrCode?: string } | null>(null)
  const [disconnectingConnections, setDisconnectingConnections] = useState<Set<string>>(new Set())

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

  const handleDisconnect = async (connectionId: string) => {
    setDisconnectingConnections(prev => new Set(prev).add(connectionId))
    try {
      await disconnectConnection(connectionId)
    } catch (error) {
      console.error('Failed to disconnect connection:', error)
      // You could add a toast notification here to show the error
    } finally {
      setDisconnectingConnections(prev => {
        const newSet = new Set(prev)
        newSet.delete(connectionId)
        return newSet
      })
    }
  }

  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case "connected":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
      case "disconnected":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
      case "requesting_qr":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
      case "waiting_connection":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
      case "error":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
    }
  }

  // Show loading state
  if (isLoadingConnections) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-muted-foreground mb-4 animate-spin" />
          <p className="text-muted-foreground text-center">
            Loading connections...
          </p>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (connectionsError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-destructive mb-4" />
          <p className="text-destructive text-center mb-4">
            {connectionsError}
          </p>
          <Button variant="outline" onClick={loadConnections} disabled={isLoadingConnections}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Show empty state
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
        <Card key={connection.connectionId}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{connection.name || "Unnamed Connection"}</CardTitle>
                  <CardDescription>
                    {connection.lastActivity ? `Last active: ${new Date(connection.lastActivity).toLocaleString()}` : "Waiting for device to scan QR code..."}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className={getStatusColor(connection.status)}>
                {connection.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {connection.status === "connected" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => onSendMessage(connection.connectionId)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onViewMessages(connection.connectionId)}>
                    <History className="h-4 w-4 mr-2" />
                    View Messages
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDisconnect(connection.connectionId)}
                    disabled={disconnectingConnections.has(connection.connectionId)}
                  >
                    {disconnectingConnections.has(connection.connectionId) ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Power className="h-4 w-4 mr-2" />
                    )}
                    Disconnect
                  </Button>
                </>
              )}
              {(connection.status === "requesting_qr" || connection.status === "waiting_connection") && (
                <>
                  <p className="text-sm text-muted-foreground">Scan QR code to activate this connection</p>
                  <Button size="sm" variant="outline" onClick={() => handleShowQR(connection)}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Scan QR Code
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDisconnect(connection.connectionId)}
                    disabled={disconnectingConnections.has(connection.connectionId)}
                  >
                    {disconnectingConnections.has(connection.connectionId) ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Power className="h-4 w-4 mr-2" />
                    )}
                    Disconnect
                  </Button>
                </>
              )}
              {connection.status === "disconnected" && (
                <p className="text-sm text-muted-foreground">Connection inactive</p>
              )}
              {connection.status === "error" && (
                <>
                  <p className="text-sm text-muted-foreground">Connection error - please try reconnecting</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDisconnect(connection.connectionId)}
                    disabled={disconnectingConnections.has(connection.connectionId)}
                  >
                    {disconnectingConnections.has(connection.connectionId) ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Power className="h-4 w-4 mr-2" />
                    )}
                    Disconnect
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
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
