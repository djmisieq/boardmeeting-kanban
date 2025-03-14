'use client';

import React, { ReactNode } from 'react';
import { StoreProvider } from '@/providers/store-provider';
import { AppProvider } from '@/providers/app-provider';
import { NotificationProvider } from '@/providers/notification-provider';
import { ThemeProvider } from '@/providers/theme-provider';

/**
 * Komponent zawierający wszystkie providery klienckie
 * Wydzielamy go oddzielnie, aby główny layout mógł być komponentem serwerowym
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AppProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AppProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}
