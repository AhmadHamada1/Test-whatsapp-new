"use client"

import { useState, useEffect } from "react"
import { useApi } from "@/contexts/api-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Clock, RefreshCw, Filter, Loader2 } from "lucide-react"
import type { MessageStatus } from "@/lib/types"

interface MessageHistoryDialogProps {
  connectionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MessageHistoryDialog({ connectionId, open, onOpenChange }: MessageHistoryDialogProps) {
  const { 
    getMessagesByConnection, 
    loadMessages, 
    connections, 
    isLoadingMessages, 
    messagesError, 
    messagesStats 
  } = useApi()
  
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [filterDirection, setFilterDirection] = useState<'sent' | 'received' | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | MessageStatus>('all')

  const connection = connections.find((c) => c.connectionId === connectionId)
  const messages = connectionId ? getMessagesByConnection(connectionId) : []
  const stats = connectionId ? messagesStats[connectionId] : null

  // Load messages when dialog opens or filters change
  useEffect(() => {
    if (open && connectionId) {
      loadMessagesForConnection()
    }
  }, [open, connectionId, filterDirection, filterStatus])

  const loadMessagesForConnection = async (page = 0) => {
    if (!connectionId) return

    try {
      const params = {
        limit: 20,
        offset: page * 20,
        ...(filterDirection !== 'all' && { direction: filterDirection }),
        ...(filterStatus !== 'all' && { status: filterStatus })
      }

      const response = await loadMessages(connectionId, params)
      if (response) {
        setHasMore(response.pagination.hasMore)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleLoadMore = () => {
    loadMessagesForConnection(currentPage + 1)
  }

  const handleRefresh = () => {
    setCurrentPage(0)
    loadMessagesForConnection(0)
  }

  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case "sent":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
      case "delivered":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
      case "read":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
      case "failed":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Message History</DialogTitle>
              <DialogDescription>Messages via {connection?.name || "Unnamed Connection"}</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoadingMessages}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Stats and Filters */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
              <div className="text-sm text-muted-foreground">Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.received}</div>
              <div className="text-sm text-muted-foreground">Received</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.byStatus.delivered || 0}</div>
              <div className="text-sm text-muted-foreground">Delivered</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value as 'sent' | 'received' | 'all')}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">All Messages</option>
            <option value="sent">Sent Only</option>
            <option value="received">Received Only</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | MessageStatus)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="read">Read</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Error Display */}
        {messagesError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {messagesError}
          </div>
        )}

        <ScrollArea className="h-[500px] pr-4">
          {isLoadingMessages && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No messages found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.messageId} className="p-4 border rounded-lg bg-card space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {msg.direction === 'sent' ? 'To' : 'From'}: {msg.to || msg.from}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {msg.direction}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{msg.content}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(msg.status)}>
                      {msg.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(msg.sentAt)}
                  </div>
                </div>
              ))}
              
              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isLoadingMessages}
                  >
                    {isLoadingMessages ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
