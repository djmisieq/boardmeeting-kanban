import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { StoreProvider } from '@/providers/store-provider'

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
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </StoreProvider>
      </body>
    </html>
  )
}