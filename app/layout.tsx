import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Fraunces, Public_Sans, IBM_Plex_Mono } from 'next/font/google'
import { AppProvider } from './context'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-serif' })
const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-sans' })
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Pleasant Health Care — Provider Admin',
  description: 'Healthcare provider administration dashboard',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: 'oklch(0.964 0.012 91.5)',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${fraunces.variable} ${publicSans.variable} ${ibmPlexMono.variable} antialiased`}>
        <AppProvider>
          {children}
        </AppProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
