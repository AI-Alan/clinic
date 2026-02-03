import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

const PUBLIC_PATHS = ['/login']
const PUBLIC_API = ['/api/auth/login', '/api/auth/logout']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicApi = PUBLIC_API.some((p) => path === p || path.startsWith(p + '/'))
  if (path.startsWith('/api/') && isPublicApi) return NextResponse.next()
  if (path.startsWith('/api/')) {
    const token = request.cookies.get(COOKIE_NAME)?.value ?? null
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }
  if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    const token = request.cookies.get(COOKIE_NAME)?.value ?? null
    if (token && (await verifyToken(token))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value ?? null
  if (!token) {
    const login = new URL('/login', request.url)
    login.searchParams.set('from', path)
    return NextResponse.redirect(login)
  }

  const payload = await verifyToken(token)
  if (!payload) {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.cookies.delete(COOKIE_NAME)
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
