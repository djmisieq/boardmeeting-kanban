import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { ClientProviders } from '@/providers/client-providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Boardmeeting Kanban',
  description: 'Application for managing team meetings using visual Kanban boards',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  )
}
