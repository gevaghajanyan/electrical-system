import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 text-sm text-zinc-600 rounded-md hover:bg-zinc-100 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      {children}
    </Link>
  )
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
        <nav className="sticky top-0 z-40 flex h-14 items-center border-b border-zinc-200 bg-white/95 px-4 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
          <Link
            href="/"
            className="mr-6 flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100"
          >
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Panel Designer
          </Link>
          <div className="flex items-center gap-1">
            <NavLink href="/panels">Panels</NavLink>
            <NavLink href="/calculators">Calculators</NavLink>
            <NavLink href="/settings">Settings</NavLink>
            <NavLink href="/about">About</NavLink>
          </div>
        </nav>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  )
}
