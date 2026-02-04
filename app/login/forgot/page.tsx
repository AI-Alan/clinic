'use client'

import Link from 'next/link'
import { CLINIC_NAME } from '@/lib/constants'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-6 sm:py-8">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md border-2 border-slate-300 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">
          {CLINIC_NAME}
        </h1>
        <p className="text-base font-semibold text-gray-600 mb-4 text-center">Forgot password?</p>
        <p className="text-base font-medium text-gray-700 mb-6">
          Contact your clinic administrator to reset your password. They can help you set a new one.
        </p>
        <Link
          href="/login"
          className="btn-primary block w-full py-3 text-center"
        >
          Back to login
        </Link>
      </div>
    </div>
  )
}
