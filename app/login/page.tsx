'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CLINIC_NAME } from '@/lib/constants'
import { useAccent } from '@/context/AccentContext'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/dashboard'
  const { accent, toggleAccent } = useAccent()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }
      router.push(from)
      router.refresh()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-md border-2 border-slate-300 border-t-4 border-t-[var(--color-primary)] p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">
        {CLINIC_NAME}
      </h1>
      <p className="text-base font-semibold text-gray-600 mb-6 text-center">Login</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-base font-semibold text-red-700 bg-red-50 border-2 border-red-300 rounded px-3 py-2">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="email" className="block text-base font-bold text-gray-800 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="input-accent w-full min-h-[48px]"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-base font-bold text-gray-800 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="input-accent w-full min-h-[48px]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-center pt-2">
          <Link
            href="/login/forgot"
            className="text-base font-semibold text-slate-600 hover:text-slate-800 underline"
          >
            Forgot password?
          </Link>
        </p>
        <p className="text-center pt-1">
          <button
            type="button"
            onClick={toggleAccent}
            className="text-base font-semibold text-slate-600 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--color-ring)] rounded px-1"
          >
            {accent === 'blue' ? 'Green accent' : 'Blue accent'} (click to switch)
          </button>
        </p>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-6 sm:py-8">
      <Suspense fallback={<div className="w-full max-w-sm bg-white rounded-lg border border-slate-200 p-8 animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
