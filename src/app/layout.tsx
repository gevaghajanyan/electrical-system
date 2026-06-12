import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { I18nProvider } from '@/components/I18nProvider'
import { NavBar } from '@/components/NavBar'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Electrical Panel Designer',
  description: 'Design and document DIN rail electrical distribution boards',
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
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <I18nProvider>
          <NavBar />
          <main className="flex flex-1 flex-col">{children}</main>
        </I18nProvider>
      </body>
    </html>
  )
}
