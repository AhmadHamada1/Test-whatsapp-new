"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiCallLogs, type ApiCallLog } from "@/lib/services/api-call-logs"
import { formatDistanceToNow } from "date-fns"

// Remove the old Activity interface - we'll use ApiCallLog from the service

interface ActivityLogProps {
  apiKeyId: string
}

const ITEMS_PER_PAGE = 10

export function ActivityLog({ apiKeyId }: ActivityLogProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [activities, setActivities] = useState<ApiCallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  const fetchActivities = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getApiCallLogs(apiKeyId, {
        limit: ITEMS_PER_PAGE,
        offset
      })
      setActivities(result.logs)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities')
      console.error('Failed to fetch activities:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [apiKeyId, currentPage])

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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-destructive/10 mb-4">
            <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Failed to load activities</h3>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <Button onClick={fetchActivities} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Activity Log</h2>
          <p className="text-muted-foreground text-sm mt-1">View all API calls made with this API key</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Total Activities: <span className="font-medium text-foreground">{total}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchActivities} disabled={loading}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-medium">Timestamp</TableHead>
              <TableHead className="font-medium">Method</TableHead>
              <TableHead className="font-medium">Endpoint</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Response Time</TableHead>
              <TableHead className="font-medium">IP Address</TableHead>
              <TableHead className="font-medium">User Agent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                </TableRow>
              ))
            ) : activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-4">
                    <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No activities yet</h3>
                  <p className="text-muted-foreground text-sm">This API key hasn't made any calls yet</p>
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity._id} className="border-border">
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getMethodColor(activity.method)}>
                      {activity.method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="px-2 py-1 rounded bg-muted font-mono text-xs">{activity.endpoint}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(activity.responseStatus)}>
                      {activity.responseStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {activity.responseTime ? `${activity.responseTime}ms` : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">{activity.ipAddress || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {activity.userAgent || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {offset + 1} to {Math.min(offset + ITEMS_PER_PAGE, total)} of {total} activities
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
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
                    disabled={loading}
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
              disabled={currentPage === totalPages || loading}
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
