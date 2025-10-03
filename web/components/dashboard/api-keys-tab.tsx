"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateApiKeyDialog } from "./create-api-key-dialog"
import { ApiKeysList } from "./api-keys-list"
import { createApiKey, revokeApiKey, activateApiKey, deleteApiKey, type ServerApiKey } from "@/lib/services/api-keys"

export interface ApiKey {
  id: string
  name: string
  key: string
  status: "active" | "revoked"
  createdAt: string
  lastUsed: string | null
}

function obfuscate(prefix?: string) {
  if (!prefix) return '••••••••••••••••'
  return `${prefix}••••••••••••••••`
}

function mapServerKeyToUi(k: ServerApiKey): ApiKey {
  return {
    id: k._id,
    name: k.label || "Untitled",
    key: obfuscate(k.tokenPrefix),
    status: k.status,
    createdAt: new Date(k.createdAt).toISOString().split("T")[0],
    lastUsed: null,
  }
}

export function ApiKeysTab({ initialKeys = [] as ServerApiKey[] }) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialKeys.map(mapServerKeyToUi))
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newKeyToken, setNewKeyToken] = useState<string | null>(null)

  const handleCreateKey = async (name: string) => {
    const { token, key } = await createApiKey(name)
    setNewKeyToken(token)
    setApiKeys((prev) => [mapServerKeyToUi(key), ...prev])
  }

  const handleRevokeKey = async (id: string) => {
    const key = await revokeApiKey(id)
    setApiKeys((prev) => prev.map((k) => (k.id === key._id ? { ...k, status: key.status } : k)))
  }

  const handleActivateKey = async (id: string) => {
    const key = await activateApiKey(id)
    setApiKeys((prev) => prev.map((k) => (k.id === key._id ? { ...k, status: key.status } : k)))
  }

  const handleDeleteKey = async (id: string) => {
    await deleteApiKey(id)
    setApiKeys((prev) => prev.filter((key) => key.id !== id))
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
          {newKeyToken ? (
            <div className="mb-4 p-3 rounded-lg bg-muted">
              <p className="text-sm mb-2">Here is your new API key token. Store it securely; you won’t be able to see it again.</p>
              <code className="block w-full truncate px-2 py-1 rounded bg-background font-mono text-xs">{newKeyToken}</code>
            </div>
          ) : null}
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
