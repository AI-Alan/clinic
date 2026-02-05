import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Rezru Electrohomeopathy',
  description: 'Rezru Electrohomeopathy - Clinic management',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;try{var v=localStorage.getItem('clinic-accent');d.setAttribute('data-accent',v==='emerald'?'emerald':'blue');}catch(e){d.setAttribute('data-accent','blue');}})();`,
          }}
        />
      </head>
      <body className="min-h-screen text-gray-900 font-medium antialiased overflow-x-hidden font-sans leading-relaxed" style={{ backgroundColor: 'var(--page-bg, #F4F8FB)' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
