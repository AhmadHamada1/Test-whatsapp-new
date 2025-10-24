"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface InformationSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InformationSidebar({ open, onOpenChange }: InformationSidebarProps) {

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-96 max-w-[90vw]">
        <SheetHeader className="flex-shrink-0 pb-4 border-b mb-6">
          <SheetTitle className="text-lg font-semibold">Testing Guide</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1">
            <h3 className="text-sm font-medium mb-4">Follow these steps to test the app:</h3>
            <ul className="space-y-3 mb-4">
              <li>1. Setup API Key - Configure your API key to access the WhatsApp Web Bot services</li>
              <li>2. Add a new connection - It will show QR code, scan that to connect your WhatsApp device</li>
              <li>3. It will show the connection status, if the qr is scanned just now, it should be ready status</li>
              <li>4. Test Message Sending - Send a test message to verify the connection is working</li>
              <li>5. View Message History - Check the message history to see sent and received messages</li>
              <li>6. Stop the server, and start it again, try to send the message with that connection again.</li>
              <li>7. Connection a few additional numbers to see if multiple connections work independently</li>
            </ul>
          </div>

          <hr />
          <h4 className="text-sm font-medium mt-6 mb-3">Quick Tips:</h4>
          <ul className="space-y-2 text-sm">
            <li>• Make sure your WhatsApp is logged in on the device you want to connect</li>
            <li>• Keep the QR code visible until the connection is established</li>
            <li>• Test with a small message first before sending important messages</li>
            <li>• Check the message history to verify message delivery</li>
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  )
}
