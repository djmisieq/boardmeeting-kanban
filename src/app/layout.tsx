import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { StoreProvider } from '@/providers/store-provider'
import { AppProvider } from '@/providers/app-provider'
import { NotificationProvider } from '@/providers/notification-provider'
import { ThemeProvider } from '@/providers/theme-provider'

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
        <StoreProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AppProvider>
              <NotificationProvider>
                <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
                  {children}
                </main>
              </NotificationProvider>
            </AppProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
