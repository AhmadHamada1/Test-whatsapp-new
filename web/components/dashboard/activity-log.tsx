"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Activity {
  id: string
  timestamp: string
  action: string
  endpoint: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  statusCode: number
  ipAddress: string
  userAgent: string
}

interface ActivityLogProps {
  apiKeyId: string
}

const ITEMS_PER_PAGE = 10

// Mock data - in a real app, this would come from an API
const generateMockActivities = (apiKeyId: string): Activity[] => {
  const actions = ["API Request", "Authentication", "Data Fetch", "Resource Update", "Query Execution"]
  const endpoints = ["/api/users", "/api/products", "/api/orders", "/api/analytics", "/api/webhooks"]
  const methods: Array<"GET" | "POST" | "PUT" | "DELETE"> = ["GET", "POST", "PUT", "DELETE"]
  const statusCodes = [200, 201, 400, 401, 404, 500]
  const ips = ["192.168.1.1", "10.0.0.5", "172.16.0.10", "203.0.113.42"]
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "curl/7.68.0",
    "PostmanRuntime/7.29.0",
    "Python/3.9 requests/2.26.0",
  ]

  return Array.from({ length: 47 }, (_, i) => ({
    id: `${apiKeyId}-activity-${i + 1}`,
    timestamp: new Date(Date.now() - i * 3600000).toLocaleString(),
    action: actions[Math.floor(Math.random() * actions.length)],
    endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
    method: methods[Math.floor(Math.random() * methods.length)],
    statusCode: statusCodes[Math.floor(Math.random() * statusCodes.length)],
    ipAddress: ips[Math.floor(Math.random() * ips.length)],
    userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
  }))
}

export function ActivityLog({ apiKeyId }: ActivityLogProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const activities = generateMockActivities(apiKeyId)

  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentActivities = activities.slice(startIndex, endIndex)

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return "bg-success/10 text-success hover:bg-success/20"
    if (statusCode >= 400 && statusCode < 500) return "bg-warning/10 text-warning hover:bg-warning/20"
    if (statusCode >= 500) return "bg-destructive/10 text-destructive hover:bg-destructive/20"
    return "bg-muted text-muted-foreground"
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "POST":
        return "bg-success/10 text-success hover:bg-success/20"
      case "PUT":
        return "bg-warning/10 text-warning hover:bg-warning/20"
      case "DELETE":
        return "bg-destructive/10 text-destructive hover:bg-destructive/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Activity Log</h2>
          <p className="text-muted-foreground text-sm mt-1">View all activities and requests made with this API key</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Total Activities: <span className="font-medium text-foreground">{activities.length}</span>
        </div>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-medium">Timestamp</TableHead>
              <TableHead className="font-medium">Action</TableHead>
              <TableHead className="font-medium">Method</TableHead>
              <TableHead className="font-medium">Endpoint</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">IP Address</TableHead>
              <TableHead className="font-medium">User Agent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentActivities.map((activity) => (
              <TableRow key={activity.id} className="border-border">
                <TableCell className="text-sm text-muted-foreground">{activity.timestamp}</TableCell>
                <TableCell className="font-medium">{activity.action}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getMethodColor(activity.method)}>
                    {activity.method}
                  </Badge>
                </TableCell>
                <TableCell>
                  <code className="px-2 py-1 rounded bg-muted font-mono text-xs">{activity.endpoint}</code>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(activity.statusCode)}>
                    {activity.statusCode}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">{activity.ipAddress}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{activity.userAgent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, activities.length)} of {activities.length} activities
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number
                if (totalPages <= 5) {
                  page = i + 1
                } else if (currentPage <= 3) {
                  page = i + 1
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i
                } else {
                  page = currentPage - 2 + i
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-9"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
