import { SignJWT, jwtVerify } from 'jose'

const COOKIE_NAME = 'clinic_token'
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production'
)
const EIGHT_HOURS = 8 * 60 * 60

export type TokenPayload = { sub: string; email: string }

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${EIGHT_HOURS}s`)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const sub = payload.sub as string
    const email = payload.email as string
    if (!sub || !email) return null
    return { sub, email }
  } catch {
    return null
  }
}

export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  return match ? match[1].trim() : null
}

export function getAuthCookieConfig(maxAge: number = EIGHT_HOURS) {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export { COOKIE_NAME }
