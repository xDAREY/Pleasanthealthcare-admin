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

  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    // themeColor: '#B8E6DB',
  },

  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
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
