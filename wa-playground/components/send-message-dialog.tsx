"use client"

import type React from "react"

import { useState } from "react"
import { useApi } from "@/contexts/api-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SendMessageDialogProps {
  connectionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SendMessageDialog({ connectionId, open, onOpenChange }: SendMessageDialogProps) {
  const { sendMessage, connections } = useApi()
  const { toast } = useToast()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")

  const connection = connections.find((c) => c.id === connectionId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (connectionId) {
      sendMessage(connectionId, phoneNumber, message)
      toast({
        title: "Message Sent",
        description: "Your message is being processed",
      })
      setPhoneNumber("")
      setMessage("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>Send a message via {connection?.deviceName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
