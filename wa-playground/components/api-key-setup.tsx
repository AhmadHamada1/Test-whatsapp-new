"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApi } from "@/contexts/api-context"
import { Key, Loader2, CheckCircle, XCircle } from "lucide-react"
import { verifyApiKey } from "@/services/verify-api-key"

export function ApiKeySetup() {
  const { setApiKey } = useApi()
  const [inputKey, setInputKey] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputKey.trim()) return

    setIsVerifying(true)
    setVerificationStatus('idle')
    setErrorMessage("")

    try {
      await verifyApiKey(inputKey.trim())
      setVerificationStatus('success')
      setApiKey(inputKey.trim())
    } catch (error) {
      setVerificationStatus('error')
      setErrorMessage('Failed to verify API key')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-2xl">API Playground</CardTitle>
          </div>
          <CardDescription>Enter your API key to get started with testing your connections</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  required
                  disabled={isVerifying}
                  className={verificationStatus === 'error' ? 'border-red-500' : verificationStatus === 'success' ? 'border-green-500' : ''}
                />
                {isVerifying && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {verificationStatus === 'success' && !isVerifying && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {verificationStatus === 'error' && !isVerifying && (
                  <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {verificationStatus === 'error' && errorMessage && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errorMessage}
                </p>
              )}
              {verificationStatus === 'success' && (
                <p className="text-sm text-green-500 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  API key verified successfully!
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
