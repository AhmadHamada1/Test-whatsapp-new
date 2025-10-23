"use client"

import { useApi } from "@/contexts/api-context"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Clock } from "lucide-react"
import type { MessageStatus } from "@/lib/types"

interface MessageHistoryDialogProps {
  connectionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MessageHistoryDialog({ connectionId, open, onOpenChange }: MessageHistoryDialogProps) {
  const { getMessagesByConnection, connections } = useApi()

  const connection = connections.find((c) => c.connectionId === connectionId)
  const messages = connectionId ? getMessagesByConnection(connectionId) : []

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Message History</DialogTitle>
          <DialogDescription>Messages sent via {connection?.name || "Unnamed Connection"}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No messages sent yet from this connection</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.messageId} className="p-4 border rounded-lg bg-card space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">To: {msg.to}</p>
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
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
