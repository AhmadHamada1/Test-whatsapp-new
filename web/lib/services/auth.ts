"use server"

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServerHttp } from './http'

const SERVER_API_URL = process.env.SERVER_API_URL

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type LoginInput = z.infer<typeof loginSchema>

export async function login(formData: FormData): Promise<{ success?: true; error?: string }> {
  try {
    const raw = {
      email: String(formData.get('email') || ''),
      password: String(formData.get('password') || ''),
    }
    const parsed = loginSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Invalid input' }
    }

    const http = await createServerHttp()
    try {
      const { data } = await http.post<{ token: string }>(`/auth/login`, parsed.data)
      const token = data?.token
      if (!token) return { error: 'Token not returned by server' }
      const cookieStore = await cookies()
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
      return { success: true }
    } catch (e: any) {
      let message = 'Invalid credentials'
      if (e?.response?.data?.message) message = e.response.data.message
      return { error: message }
    }
  } catch (e: any) {
    return { error: 'Unexpected error' }
  }
}

export async function getMe(): Promise<{ admin: { id: string; email: string } } | null> {
  if (!SERVER_API_URL) return null
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return null

  const http = await createServerHttp()
  try {
    const { data } = await http.get<{ admin: { id: string; email: string } }>(`/auth/me`)
    return data
  } catch {
    return null
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
