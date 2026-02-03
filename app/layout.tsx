import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clinic Management',
  description: 'Personal clinic management for a single doctor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
