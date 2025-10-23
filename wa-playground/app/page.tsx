"use client"

import { useState, useEffect } from "react"
import { useApi } from "@/contexts/api-context"
import { ApiKeySetup } from "@/components/api-key-setup"
import { ConnectionsList } from "@/components/connections-list"
import { AddConnectionDialog } from "@/components/add-connection-dialog"
import { SendMessageDialog } from "@/components/send-message-dialog"
import { MessageHistoryDialog } from "@/components/message-history-dialog"
import { Button } from "@/components/ui/button"
import { Key, LogOut } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const { apiKey, setApiKey, loadConnections } = useApi()
  const [sendMessageConnectionId, setSendMessageConnectionId] = useState<string | null>(null)
  const [viewMessagesConnectionId, setViewMessagesConnectionId] = useState<string | null>(null)

  // Load connections when component mounts and API key is available
  useEffect(() => {
    if (apiKey) {
      loadConnections()
    }
  }, [apiKey, loadConnections])

  if (!apiKey) {
    return <ApiKeySetup />
  }

  const handleLogout = () => {
    localStorage.removeItem("api_key")
    setApiKey("")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">API Playground</h1>
                <p className="text-sm text-muted-foreground">Manage connections and test messaging</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Connections</h2>
              <p className="text-sm text-muted-foreground">Manage your device connections</p>
            </div>
            <AddConnectionDialog />
          </div>

          <ConnectionsList
            onSendMessage={(id) => setSendMessageConnectionId(id)}
            onViewMessages={(id) => setViewMessagesConnectionId(id)}
          />
        </div>
      </main>

      <SendMessageDialog
        connectionId={sendMessageConnectionId}
        open={!!sendMessageConnectionId}
        onOpenChange={(open) => !open && setSendMessageConnectionId(null)}
      />

      <MessageHistoryDialog
        connectionId={viewMessagesConnectionId}
        open={!!viewMessagesConnectionId}
        onOpenChange={(open) => !open && setViewMessagesConnectionId(null)}
      />

      <Toaster />
    </div>
  )
}
