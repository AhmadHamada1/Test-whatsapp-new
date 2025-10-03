"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ActivityLog } from "@/components/dashboard/activity-log"

export default function ActivityPage() {
  const params = useParams()
  const router = useRouter()
  const apiKeyId = params.id as string

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
            <h1 className="text-xl font-semibold">API Key Activity</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <ActivityLog apiKeyId={apiKeyId} />
      </div>
    </div>
  )
}
