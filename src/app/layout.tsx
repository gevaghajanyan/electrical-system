import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { I18nProvider } from '@/components/I18nProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import { NavBar } from '@/components/NavBar'
import { ServiceWorkerRegistrar } from '@/components/pwa/ServiceWorkerRegistrar'
import { InstallPromptProvider } from '@/components/pwa/InstallPromptProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const APP_NAME = 'Voltra — Electrical Panel Designer'
const APP_DESC =
  'Design and document DIN rail electrical distribution boards and wiring schemes. Works offline.'

// Next.js file-convention icons (app/icon.tsx, app/apple-icon.tsx, app/favicon.ico)
// build the PNGs correctly but emit <link> tags without basePath — so on
// GitHub Pages under /voltra/ the browser 404s them. Declare icons manually
// with the basePath baked in.
const base = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '')

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_DESC,
  icons: {
    icon: [
      { url: `${base}/favicon.ico`, sizes: 'any', type: 'image/x-icon' },
      { url: `${base}/icon`, type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: `${base}/apple-icon`, type: 'image/png', sizes: '180x180' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f7' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1013' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 overscroll-none"
        suppressHydrationWarning
      >
        <I18nProvider>
          <ThemeProvider>
            <InstallPromptProvider>
              <NavBar />
              <main className="flex flex-1 flex-col min-h-0">{children}</main>
              <ServiceWorkerRegistrar />
            </InstallPromptProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
