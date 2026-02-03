'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-slate-600 text-sm mb-6">
          We couldn’t load this page. Please try again or go back to the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded bg-slate-800 text-white px-4 py-3 text-sm font-medium hover:bg-slate-700 touch-manipulation"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 touch-manipulation inline-block"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
