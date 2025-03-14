'use client';

import { ReactNode, useRef } from 'react';
import { useKanbanStore } from '@/store/use-kanban-store';

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * This provider ensures that Zustand state is properly managed in Next.js
 * It helps prevent hydration mismatches between server and client
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const initialized = useRef(false);
  
  if (!initialized.current) {
    // Initialize the store on the client side
    useKanbanStore.getState().initializeBoard('tasks-board', 'tasks', 'default', []);
    useKanbanStore.getState().initializeBoard('problems-board', 'problems', 'default', []);
    useKanbanStore.getState().initializeBoard('ideas-board', 'ideas', 'default', []);
    initialized.current = true;
  }
  
  return <>{children}</>;
}