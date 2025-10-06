"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { getConnections, type Connection } from "@/lib/services/connections"
import { formatDistanceToNow } from "date-fns"

interface ConnectionsTableProps {
  apiKeyId: string
  apiKeyName: string
}

export function ConnectionsTable({ apiKeyId, apiKeyName }: ConnectionsTableProps) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConnections = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getConnections(apiKeyId)
      setConnections(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch connections')
      console.error('Failed to fetch connections:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [apiKeyId])

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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-destructive/10 mb-4">
            <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Failed to load connections</h3>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <Button onClick={fetchConnections} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">WhatsApp Connections</h2>
          <p className="text-muted-foreground text-sm mt-1">View all WhatsApp connections for this API key</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Total Connections: <span className="font-medium text-foreground">{connections.length}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchConnections} disabled={loading}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Created</TableHead>
                <TableHead className="font-medium">Last QR</TableHead>
                <TableHead className="font-medium">Ready At</TableHead>
                <TableHead className="font-medium">Disconnected At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : connections.length === 0 ? (
        <div className="text-center py-12">
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
  )
}
