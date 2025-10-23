"use client"

import type React from "react"

import { useState } from "react"
import { useApi } from "@/contexts/api-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, QrCode, Loader2 } from "lucide-react"
import { addNewConnection } from "@/services/add-new-connection"

export function AddConnectionDialog() {
  const { addConnectionFromApi } = useApi()
  const [open, setOpen] = useState(false)
  const [connectionName, setConnectionName] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Call the API to create a new connection
      const connection = await addNewConnection(connectionName)
      
      // Set the QR code from the API response
      if (connection.qrCode) {
        setQrCodeUrl(connection.qrCode)
      }

      // Add the connection to the context using the API response
      addConnectionFromApi(connection)

      setShowQr(true)
    } catch (err) {
      console.error('Failed to create connection:', err)
      setError(err instanceof Error ? err.message : 'Failed to create connection')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setConnectionName("")
    setQrCodeUrl(null)
    setShowQr(false)
    setError(null)
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Connection
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Connection</DialogTitle>
          <DialogDescription>
            {showQr ? "Scan this QR code to connect your device" : "Enter a connection name to generate QR code"}
          </DialogDescription>
        </DialogHeader>
        {!showQr ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="connectionName">Connection Name</Label>
              <Input
                id="connectionName"
                placeholder="e.g., My WhatsApp Business"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Connection...
                </>
              ) : (
                'Create Connection'
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-muted/30 rounded-lg">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-64 h-64" />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">QR Code not available</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <QrCode className="h-5 w-5 text-primary" />
              <p className="text-sm text-foreground">
                Scan this QR code with your WhatsApp mobile app to connect your device.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
