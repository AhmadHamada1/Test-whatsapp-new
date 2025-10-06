"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityLog } from "@/components/dashboard/activity-log"
import { ConnectionsTable } from "@/components/dashboard/connections-table"

export default function ActivityPage() {
  const params = useParams()
  const router = useRouter()
  const apiKeyId = params.id as string
  const [activeTab, setActiveTab] = useState("activity")

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-semibold">API Key Details</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="space-y-6">
            <ActivityLog apiKeyId={apiKeyId} />
          </TabsContent>
          
          <TabsContent value="connections" className="space-y-6">
            <ConnectionsTable apiKeyId={apiKeyId} apiKeyName="API Key" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
