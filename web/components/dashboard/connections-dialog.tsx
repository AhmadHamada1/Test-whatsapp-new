"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getConnections, type Connection } from "@/lib/services/connections"
import { formatDistanceToNow } from "date-fns"

interface ConnectionsDialogProps {
  apiKeyId: string
  apiKeyName: string
  children: React.ReactNode
}

export function ConnectionsDialog({ apiKeyId, apiKeyName, children }: ConnectionsDialogProps) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const fetchConnections = async () => {
    setLoading(true)
    try {
      const data = await getConnections(apiKeyId)
      setConnections(data)
    } catch (error) {
      console.error('Failed to fetch connections:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchConnections()
    }
  }, [open, apiKeyId])

  const getStatusBadge = (status: Connection['status']) => {
    const variants = {
      ready: "bg-green-100 text-green-800 hover:bg-green-200",
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      disconnected: "bg-red-100 text-red-800 hover:bg-red-200"
    }
    
    return (
      <Badge variant="secondary" className={variants[status]}>
        {status}
      </Badge>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never"
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  const renderAccountInfo = (connection: Connection) => {
    if (!connection.accountInfo || connection.status !== 'ready') {
      return (
        <div className="text-sm text-muted-foreground">
          {connection.status === 'pending' ? 'Scanning QR code...' : 
           connection.status === 'disconnected' ? 'Not connected' : 'No account info'}
        </div>
      )
    }

    const { phoneNumber, profileName, platform, profilePictureUrl, statusMessage, lastSeen } = connection.accountInfo

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profilePictureUrl} alt={profileName || phoneNumber} />
            <AvatarFallback className="text-xs">
              {(profileName || phoneNumber || 'WA').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">
              {profileName || phoneNumber || 'Unknown'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {phoneNumber && `+${phoneNumber}`}
            </div>
          </div>
        </div>
        
        {platform && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {platform}
            </Badge>
            {lastSeen && (
              <span className="text-xs text-muted-foreground">
                Last seen {formatDate(lastSeen)}
              </span>
            )}
          </div>
        )}
        
        {statusMessage && (
          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
            "{statusMessage}"
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>WhatsApp Connections - {apiKeyName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading connections..." : `${connections.length} connection${connections.length !== 1 ? 's' : ''} found`}
            </p>
            <Button variant="outline" size="sm" onClick={fetchConnections} disabled={loading}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-4">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No connections yet</h3>
              <p className="text-muted-foreground text-sm">This API key doesn't have any WhatsApp connections</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="font-medium">Account Info</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium">Created</TableHead>
                    <TableHead className="font-medium">Last QR</TableHead>
                    <TableHead className="font-medium">Ready At</TableHead>
                    <TableHead className="font-medium">Disconnected At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connections.map((connection) => (
                    <TableRow key={connection.id} className="border-border">
                      <TableCell className="py-4">
                        {renderAccountInfo(connection)}
                      </TableCell>
                      <TableCell>{getStatusBadge(connection.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(connection.createdAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(connection.lastQrAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(connection.readyAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(connection.disconnectedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
