import type { Metadata, Viewport } from 'next'
import { fontVariables } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'operation: secret cake',
  description: 'bake a tiny bento cake, hide a secret inside, and let them burn it open.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  ),
  openGraph: { title: 'operation: secret cake', description: 'bake a tiny cake. hide a secret inside. let them burn it open.' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f6efe4',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        {children}
        <div className="paper-grain" aria-hidden />
      </body>
    </html>
  )
}
