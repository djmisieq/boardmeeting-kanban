import React, { createContext, useContext, ReactNode } from 'react';
import { useKanbanStore } from '@/store/use-kanban-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useProjectsStore } from '@/store/use-projects-store';
import { useCollaborationStore } from '@/store/use-collaboration-store';

// Centralizujemy dostęp do wszystkich store'ów
interface AppContextType {
  // Store'y
  kanbanStore: ReturnType<typeof useKanbanStore.getState>;
  departmentsStore: ReturnType<typeof useDepartmentsStore.getState>;
  projectsStore: ReturnType<typeof useProjectsStore.getState>;
  collaborationStore: ReturnType<typeof useCollaborationStore.getState>;
  
  // Stan aplikacji
  currentUser: string;
  isLoading: boolean;
  error: string | null;
  
  // Akcje globalne
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Domyślny użytkownik dla testów (do usunięcia w produkcji)
const DEFAULT_USER = 'Admin';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = React.useState(DEFAULT_USER);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Pobieramy referencje do store'ów
  const kanbanStore = useKanbanStore.getState();
  const departmentsStore = useDepartmentsStore.getState();
  const projectsStore = useProjectsStore.getState();
  const collaborationStore = useCollaborationStore.getState();
  
  // Ustawia subskrypcje na zmiany w store'ach
  React.useEffect(() => {
    const kanbanUnsubscribe = useKanbanStore.subscribe((state) => {
      // Tu można reagować na zmiany w kanbanStore
    });
    
    const departmentsUnsubscribe = useDepartmentsStore.subscribe((state) => {
      // Tu można reagować na zmiany w departmentsStore
    });
    
    return () => {
      kanbanUnsubscribe();
      departmentsUnsubscribe();
    };
  }, []);
  
  const clearError = () => setError(null);
  
  // Wartość kontekstu
  const value: AppContextType = {
    kanbanStore,
    departmentsStore,
    projectsStore,
    collaborationStore,
    currentUser,
    isLoading,
    error,
    setError,
    clearError,
    setLoading: setIsLoading
  };
  
  return (
    <AppContext.Provider value={value}>
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 z-50 flex justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="font-bold">×</button>
        </div>
      )}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-40">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <div className="mt-2 text-gray-700">Ładowanie...</div>
          </div>
        </div>
      )}
      {children}
    </AppContext.Provider>
  );
};

// Hook do używania kontekstu
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Hook pomocniczy do obsługi błędów
export const useErrorHandler = () => {
  const { setError, clearError } = useApp();
  
  const handleError = React.useCallback((error: any) => {
    console.error('Application error:', error);
    const message = error instanceof Error 
      ? error.message 
      : 'Wystąpił nieoczekiwany błąd';
    setError(message);
    
    // Automatyczne czyszczenie błędu po 5 sekundach
    setTimeout(clearError, 5000);
  }, [setError, clearError]);
  
  return { handleError };
};
