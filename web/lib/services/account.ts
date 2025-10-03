"use server"

import { z } from 'zod'
import { createServerHttp } from './http'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
})

export async function changePassword(formData: FormData): Promise<{ success?: true; error?: string }> {
  try {
    const raw = {
      currentPassword: String(formData.get('currentPassword') || ''),
      newPassword: String(formData.get('newPassword') || ''),
    }
    const parsed = changePasswordSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Invalid input' }
    }

    const http = await createServerHttp()
    try {
      await http.post('/admin/change-password', parsed.data)
      return { success: true }
    } catch (e: any) {
      let message = 'Unable to change password'
      if (e?.response?.data?.message) message = e.response.data.message
      return { error: message }
    }
  } catch {
    return { error: 'Unexpected error' }
  }
}


