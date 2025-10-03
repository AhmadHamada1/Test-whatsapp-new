import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = [/^\/dashboard(\/.*)?$/, /^\/settings(\/.*)?$/]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value

  // If user is on /login (or auth area) and already authenticated, redirect to dashboard
  if (pathname === '/login' && token) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Protect dashboard/settings: unauthenticated users get redirected to login
  const isProtected = PROTECTED_PATHS.some((re) => re.test(pathname))
  if (isProtected && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/dashboard/:path*', '/settings/:path*'],
}


