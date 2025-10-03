"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { changePassword } from "@/lib/services/account"

const schema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((values) => values.newPassword === values.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type FormValues = z.infer<typeof schema>

export function PasswordChangeForm() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
  })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    setSuccess(false)
    const fd = new FormData()
    fd.set('currentPassword', values.currentPassword)
    fd.set('newPassword', values.newPassword)
    const res = await changePassword(fd)
    if (res?.error) {
      setError(res.error)
      return
    }
    setSuccess(true)
    reset()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <Card className="border-border max-w-2xl">
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your password to keep your account secure</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" placeholder="••••••••" {...register("currentPassword")} className="bg-secondary border-border" />
            {errors.currentPassword ? (
              <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" placeholder="••••••••" {...register("newPassword")} className="bg-secondary border-border" />
            <p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
            {errors.newPassword ? (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" placeholder="••••••••" {...register("confirmPassword")} className="bg-secondary border-border" />
            {errors.confirmPassword ? (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          {error ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
          ) : null}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Password updated successfully
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
            {isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
