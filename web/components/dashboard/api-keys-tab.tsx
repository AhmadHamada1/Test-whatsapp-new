"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateApiKeyDialog } from "./create-api-key-dialog"
import { ApiKeysList } from "./api-keys-list"

export interface ApiKey {
  id: string
  name: string
  key: string
  status: "active" | "revoked"
  createdAt: string
  lastUsed: string | null
}

export function ApiKeysTab() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Production API Key",
      key: "sk_live_51Hx...",
      status: "active",
      createdAt: "2025-01-15",
      lastUsed: "2025-03-10",
    },
    {
      id: "2",
      name: "Development Key",
      key: "sk_test_51Hx...",
      status: "active",
      createdAt: "2025-02-20",
      lastUsed: "2025-03-09",
    },
    {
      id: "3",
      name: "Old Testing Key",
      key: "sk_test_41Gw...",
      status: "revoked",
      createdAt: "2024-12-01",
      lastUsed: "2025-01-05",
    },
  ])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleCreateKey = (name: string) => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name,
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}...`,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: null,
    }
    setApiKeys([newKey, ...apiKeys])
  }

  const handleRevokeKey = (id: string) => {
    setApiKeys(apiKeys.map((key) => (key.id === id ? { ...key, status: "revoked" as const } : key)))
  }

  const handleActivateKey = (id: string) => {
    setApiKeys(apiKeys.map((key) => (key.id === id ? { ...key, status: "active" as const } : key)))
  }

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id))
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription className="mt-1.5">Manage your API keys for authentication</CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Key
          </Button>
        </CardHeader>
        <CardContent>
          <ApiKeysList
            apiKeys={apiKeys}
            onRevoke={handleRevokeKey}
            onActivate={handleActivateKey}
            onDelete={handleDeleteKey}
          />
        </CardContent>
      </Card>

      <CreateApiKeyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateKey={handleCreateKey}
      />
    </div>
  )
}
