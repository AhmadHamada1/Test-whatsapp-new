"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, FileText, MessageSquare, Settings, Zap, ChevronDown, ChevronUp, LayoutDashboardIcon } from "lucide-react"
import { useState } from "react"

interface InformationSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InformationSidebar({ open, onOpenChange }: InformationSidebarProps) {
  const [isTestingStepsOpen, setIsTestingStepsOpen] = useState(true)
  const [isPlannedFeaturesOpen, setIsPlannedFeaturesOpen] = useState(true)
  const testingSteps = [
    {
      step: 1,
      title: "Setup API Key",
      description: "Configure your API key to access the WhatsApp Web Bot services",
      tips: "Verify API key is valid and has proper permissions"
    },
    {
      step: 2,
      title: "Add Connection",
      description: "Scan the QR code to connect your WhatsApp device",
      tips: "Use a different phone number than your personal WhatsApp"
    },
    {
      step: 3,
      title: "Verify Connection Status",
      description: "Check that connection status shows as 'Ready' after scanning",
      tips: "Wait for 'Ready' status before proceeding to next step"
    },
    {
      step: 4,
      title: "Test Basic Messaging",
      description: "Send a simple text message to verify basic functionality",
      tips: "Send to a known number and verify delivery"
    },
    {
      step: 5,
      title: "Test Message Types",
      description: "Test different message types (text, emoji, special characters)",
      tips: "Try messages with emojis, long text, and special characters"
    },
    {
      step: 6,
      title: "Test Message History",
      description: "Verify sent and received messages appear in history",
      tips: "Check both sent and received messages are properly logged"
    },
    {
      step: 7,
      title: "Test Connection Persistence",
      description: "Restart server and verify connection remains active",
      tips: "Stop server, start again, send message without re-scanning QR"
    },
    {
      step: 8,
      title: "Test Multiple Connections",
      description: "Add 2-3 additional connections and test independently",
      tips: "Each connection should work independently without interference"
    },
    {
      step: 9,
      title: "Test Error Handling",
      description: "Test with invalid numbers, network issues, and edge cases",
      tips: "Try sending to invalid numbers, test with poor network"
    },
    {
      step: 10,
      title: "Test Rate Limiting",
      description: "Send multiple messages quickly to test rate limiting",
      tips: "Send 5-10 messages rapidly to verify rate limiting works"
    },
    {
      step: 11,
      title: "Test Connection Recovery",
      description: "Disconnect and reconnect to test session recovery",
      tips: "Disconnect connection, then restore it and verify it works"
    },
    {
      step: 12,
      title: "Test Concurrent Operations",
      description: "Test multiple operations happening simultaneously",
      tips: "Send messages from multiple connections at the same time"
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
      title: "Playground improvements",
      icon: LayoutDashboardIcon,
      items: [
        "Long polling on the QR code generation",
        "Ability to establish connection where status is WaitingConnection"
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
      <SheetContent side="right" className="w-96 max-w-[90vw] p-0 flex flex-col h-full">
        <SheetHeader className="p-6 pb-4 border-b flex-shrink-0">
          <SheetTitle className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Testing Guide
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 h-0">
          <div className="p-6 space-y-6">

            {/* TODO Features */}
            <div className="space-y-4 mb-12">
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground focus:ring-0 focus:ring-offset-0 active:bg-transparent focus:bg-transparent"
                onClick={() => setIsPlannedFeaturesOpen(!isPlannedFeaturesOpen)}
              >
                <span>Planned Features</span>
                {isPlannedFeaturesOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {isPlannedFeaturesOpen && (
                <div className="space-y-4">
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
              )}
            </div>


            {/* Testing Steps */}
            <div className="space-y-4">
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground focus:ring-0 focus:ring-offset-0 active:bg-transparent focus:bg-transparent"
                onClick={() => setIsTestingStepsOpen(!isTestingStepsOpen)}
              >
                <span>Testing Guide</span>
                {isTestingStepsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {isTestingStepsOpen && (
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
                  <CardContent className="space-y-4">
                    {testingSteps.map((step) => (
                      <div key={step.step} className="flex gap-3">
                        <Badge variant="outline" className="flex-shrink-0 w-6 h-6 p-0 flex items-center justify-center text-xs">
                          {step.step}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                          {step.tips && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md border-l-2 border-blue-200 dark:border-blue-800">
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                💡 <strong>Tip:</strong> {step.tips}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
