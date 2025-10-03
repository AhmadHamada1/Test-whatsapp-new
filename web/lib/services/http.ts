"use server"

import axios from 'axios'
import { cookies } from 'next/headers'

const SERVER_API_URL = process.env.SERVER_API_URL

export async function createServerHttp() {
  const instance = axios.create({
    baseURL: SERVER_API_URL,
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  instance.interceptors.request.use(async (config) => {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  })

  return instance
}


