'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Komponent granicy błędu (Error Boundary) do obsługi błędów komponentu
 * 
 * Używaj tego do owijania komponentów, które mogą generować błędy podczas renderowania
 * Możesz podać własny fallback (komponent zastępczy) lub funkcję reset
 * 
 * @example
 * <ErrorBoundary
 *   fallback={<div>Coś poszło nie tak</div>}
 *   onReset={() => fetchDataAgain()}
 * >
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Aktualizuj stan, aby następny render pokazał zastępczy UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Możesz zalogować błąd do serwisu raportowania błędów
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }
  
  resetError = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Pokaż własny fallback lub domyślny komponent błędu
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
            Wystąpił nieoczekiwany błąd
          </h3>
          <div className="text-red-700 dark:text-red-400 mb-4 text-sm overflow-auto max-h-40 p-2 bg-red-100 dark:bg-red-900/40 rounded">
            {this.state.error?.message || 'Nieznany błąd'}
          </div>
          <button
            onClick={this.resetError}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto transition-colors"
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> 
            Spróbuj ponownie
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook do pokazywania błędu i możliwości ponowienia próby
 */
export function useErrorWithRetry() {
  const [error, setError] = React.useState<Error | null>(null);
  
  const clearError = React.useCallback(() => {
    setError(null);
  }, []);
  
  if (error) {
    return {
      error,
      clearError,
      errorElement: (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
            Wystąpił błąd
          </h3>
          <div className="text-red-700 dark:text-red-400 mb-4 text-sm overflow-auto max-h-40 p-2 bg-red-100 dark:bg-red-900/40 rounded">
            {error.message}
          </div>
          <button
            onClick={clearError}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto transition-colors"
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> 
            Spróbuj ponownie
          </button>
        </div>
      ),
    };
  }
  
  return {
    error: null,
    setError,
    clearError,
    errorElement: null,
  };
}
