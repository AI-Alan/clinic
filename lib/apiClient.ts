/**
 * Client-side fetch wrapper. On 401 (e.g. session expired), clears auth cookie
 * and redirects to /login?from=currentPath so the user can sign in again.
 * Do not use for /api/auth/login or /api/auth/me (handled separately).
 */
function isLoginUrl(input: RequestInfo | URL): boolean {
  let path: string
  if (typeof input === 'string') {
    path = input.startsWith('http') ? new URL(input).pathname : input
  } else if (input instanceof URL) {
    path = input.pathname
  } else {
    path = new URL(input.url).pathname
  }
  return path.includes('/api/auth/login')
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, {
    ...init,
    credentials: init?.credentials ?? 'include',
  })

  if (res.status === 401 && typeof window !== 'undefined' && !isLoginUrl(input)) {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } finally {
      const from = window.location.pathname || '/dashboard'
      window.location.href = `/login?from=${encodeURIComponent(from)}`
    }
  }

  return res
}
