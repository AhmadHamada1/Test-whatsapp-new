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
import { Plus, QrCode } from "lucide-react"
import QRCode from "qrcode"

export function AddConnectionDialog() {
  const { addConnection } = useApi()
  const [open, setOpen] = useState(false)
  const [connectionName, setConnectionName] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const connectionData = {
      connectionName,
      timestamp: Date.now(),
    }

    const qrUrl = await QRCode.toDataURL(JSON.stringify(connectionData))
    setQrCodeUrl(qrUrl)

    addConnection({
      deviceName: connectionName,
      status: "pending",
      qrCode: qrUrl,
    })

    setShowQr(true)
  }

  const handleClose = () => {
    setOpen(false)
    setConnectionName("")
    setQrCodeUrl(null)
    setShowQr(false)
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
              />
            </div>
            <Button type="submit" className="w-full">
              Generate QR Code
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-muted/30 rounded-lg">
              {qrCodeUrl && (
                <img src={qrCodeUrl || "/placeholder.svg"} alt="Connection QR Code" className="w-64 h-64" />
              )}
            </div>
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <QrCode className="h-5 w-5 text-primary" />
              <p className="text-sm text-foreground">QR code generated! Device details will appear after scanning.</p>
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
