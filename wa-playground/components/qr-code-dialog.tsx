"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { QrCode, Loader2 } from "lucide-react"

interface QRCodeDialogProps {
  connectionId: string
  connectionName?: string
  qrCodeUrl?: string
  isOpen: boolean
  onClose: () => void
}

export function QRCodeDialog({ 
  connectionId, 
  connectionName, 
  qrCodeUrl, 
  isOpen, 
  onClose 
}: QRCodeDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClose = () => {
    setIsLoading(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect WhatsApp</DialogTitle>
          <DialogDescription>
            {connectionName ? `Scan this QR code to connect ${connectionName}` : "Scan this QR code with your WhatsApp mobile app to connect your device."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-center p-6 bg-muted/30 rounded-lg">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="WhatsApp QR Code" 
                className="w-64 h-64 object-contain"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-muted rounded-lg">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading QR code...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <QrCode className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">QR code not available</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
            <QrCode className="h-5 w-5 text-primary" />
            <p className="text-sm text-foreground">
              Open WhatsApp on your phone and scan this QR code to connect your device.
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
