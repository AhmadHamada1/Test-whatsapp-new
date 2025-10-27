"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  const { sendMessage, connections, isSendingMessage, sendMessageError } = useApi()
  const { toast } = useToast()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")

  const connection = connections.find((c) => c.connectionId === connectionId)

  // Clear form and errors when dialog opens
  useEffect(() => {
    if (open) {
      setPhoneNumber("")
      setMessage("")
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connectionId) return

    try {
      await sendMessage(connectionId, phoneNumber, message)
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
      })
      setPhoneNumber("")
      setMessage("")
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Failed to Send Message",
        description: sendMessageError || "An error occurred while sending the message",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>Send a message via {connection?.name || "Unnamed Connection"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {sendMessageError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {sendMessageError}
            </div>
          )}
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
          <Button type="submit" className="w-full" disabled={isSendingMessage}>
            <Send className="h-4 w-4 mr-2" />
            {isSendingMessage ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
