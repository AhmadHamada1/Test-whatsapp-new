"use client"

import { useEffect, useState } from "react"
import { Phone, Monitor, User, Clock, MapPin, ChevronDown, ChevronRight } from "lucide-react"
import type { ClientInfo as ClientInfoType } from "@/lib/types"
import { Badge } from "./ui/badge"

interface ClientInfoProps {
  clientInfo?: ClientInfoType
}

export function ClientInfo({ clientInfo }: ClientInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    console.log("clientInfo", clientInfo)
  }, [clientInfo])

  if (!clientInfo) {
    return (
      <Badge variant="outline">
        <span className="text-xs">No client information available</span>
      </Badge>
    )
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="mt-3">
      <button
        onClick={toggleExpanded}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <span>Client Information</span>
      </button>

      {isExpanded && (
        <div className="mt-2 ml-5 space-y-2 text-sm">
          {/* Basic Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span className="font-medium">Phone:</span>
              <span>{clientInfo.phoneNumber || 'Unknown'}</span>
            </div>
            {clientInfo.whatsappInfo?.profileName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="font-medium">Name:</span>
                <span>{clientInfo.whatsappInfo.profileName}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Monitor className="h-3 w-3" />
              <span className="font-medium">Platform:</span>
              <span>{clientInfo.platform || 'Unknown'}</span>
            </div>
          </div>

          {/* Connection Details */}
          {clientInfo.connectionDetails && (
            <div className="space-y-1 pt-2 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Connection Details</div>
              {clientInfo.connectionDetails.connectedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">Connected:</span>
                  <span>{new Date(clientInfo.connectionDetails.connectedAt).toLocaleString()}</span>
                </div>
              )}
              {clientInfo.connectionDetails.lastSeen && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">Last Seen:</span>
                  <span>{new Date(clientInfo.connectionDetails.lastSeen).toLocaleString()}</span>
                </div>
              )}
              {clientInfo.connectionDetails.ipAddress && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="font-medium">IP:</span>
                  <span className="font-mono text-xs">{clientInfo.connectionDetails.ipAddress}</span>
                </div>
              )}
            </div>
          )}

          {/* WhatsApp Info */}
          {clientInfo.whatsappInfo && (
            <div className="space-y-1 pt-2 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">WhatsApp Profile</div>
              {clientInfo.whatsappInfo.isBusiness && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Business</span>
                </div>
              )}
              {clientInfo.whatsappInfo.isVerified && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Verified</span>
                </div>
              )}
            </div>
          )}

          {/* Device Info */}
          {clientInfo.phoneDetails && (
            <div className="space-y-1 pt-2 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Device Info</div>
              {clientInfo.phoneDetails.manufacturer && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium">Manufacturer:</span>
                  <span>{clientInfo.phoneDetails.manufacturer}</span>
                </div>
              )}
              {clientInfo.phoneDetails.model && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium">Model:</span>
                  <span>{clientInfo.phoneDetails.model}</span>
                </div>
              )}
              {clientInfo.phoneDetails.osVersion && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium">OS:</span>
                  <span>{clientInfo.phoneDetails.osVersion}</span>
                </div>
              )}
              {clientInfo.phoneDetails.appVersion && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium">App Version:</span>
                  <span>{clientInfo.phoneDetails.appVersion}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

