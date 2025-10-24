"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, Clock, FileText, MessageSquare, Settings, Zap } from "lucide-react"

interface InformationSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InformationSidebar({ open, onOpenChange }: InformationSidebarProps) {
  const testingSteps = [
    {
      step: 1,
      title: "Setup API Key",
      description: "Configure your API key to access the WhatsApp Web Bot services"
    },
    {
      step: 2,
      title: "Add Connection",
      description: "Scan the QR code to connect your WhatsApp device"
    },
    {
      step: 3,
      title: "Check Status",
      description: "Verify connection status shows as 'Ready' after scanning"
    },
    {
      step: 4,
      title: "Test Messaging",
      description: "Send a test message to verify the connection works"
    },
    {
      step: 5,
      title: "View History",
      description: "Check message history for sent and received messages"
    },
    {
      step: 6,
      title: "Restart Test",
      description: "Stop and restart server, then test messaging again"
    },
    {
      step: 7,
      title: "Multiple Connections",
      description: "Add additional numbers to test multiple connections"
    }
  ]

  const todoFeatures = [
    {
      title: "Rate Limiters",
      icon: Clock,
      items: [
        "1st week: 1 message per minute",
        "2nd week: 2 messages per minute", 
        "3rd week onwards: 3 messages per minute"
      ]
    },
    {
      title: "Message Types",
      icon: FileText,
      items: [
        "Send PDF files",
        "Send Images"
      ]
    },
    {
      title: "Typing Indicator",
      icon: MessageSquare,
      items: [
        "Show typing indicator based on message length"
      ]
    }
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-96 max-w-[90vw] p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Testing Guide
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Testing Steps */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  Testing Steps
                </CardTitle>
                <CardDescription>
                  Follow these steps to test the WhatsApp Web Bot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {testingSteps.map((step) => (
                  <div key={step.step} className="flex gap-3">
                    <Badge variant="outline" className="flex-shrink-0 w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {step.step}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* TODO Features */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Planned Features
              </h3>
              
              {todoFeatures.map((feature, index) => (
                <Card key={index} className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <feature.icon className="h-4 w-4 text-orange-500" />
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-orange-500 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
