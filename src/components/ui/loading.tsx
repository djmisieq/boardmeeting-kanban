import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
  minHeight?: string;
  withCard?: boolean;
}

/**
 * Komponent ładowania do wyświetlania podczas asynchronicznych operacji
 * 
 * @param text - Tekst wyświetlany pod ikoną ładowania
 * @param fullScreen - Czy komponent ma zajmować cały ekran
 * @param minHeight - Minimalna wysokość komponentu
 * @param withCard - Czy wyświetlić ładowanie w karcie
 */
export function Loading({ 
  text = 'Ładowanie...', 
  fullScreen = false,
  minHeight = '16rem',
  withCard = false
}: LoadingProps) {
  const loadingContent = (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      {text && <p className="mt-2 text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        {loadingContent}
      </div>
    );
  }
  
  if (withCard) {
    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-center"
        style={{ minHeight }}
      >
        {loadingContent}
      </div>
    );
  }
  
  return (
    <div 
      className="flex items-center justify-center w-full"
      style={{ minHeight }}
    >
      {loadingContent}
    </div>
  );
}

/**
 * Komponent szkieletu do użycia podczas ładowania treści
 * 
 * @param lines - Liczba linii w szkielecie
 * @param className - Dodatkowe klasy CSS
 */
export function Skeleton({ lines = 3, className = '' }: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 ${
            i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Komponent szkieletu karty
 */
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"/>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"/>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"/>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"/>
      <div className="flex gap-2 mt-4">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"/>
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"/>
      </div>
    </div>
  );
}

/**
 * Komponent szkieletu tabeli
 * 
 * @param rows - Liczba wierszy
 * @param cols - Liczba kolumn
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"/>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={`th-${i}`} className="px-6 py-3 bg-gray-50 dark:bg-gray-800">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"/>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 animate-pulse">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <td key={`cell-${rowIndex}-${colIndex}`} className="px-6 py-4">
                    <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
                      colIndex === 0 ? 'w-3/4' : colIndex === cols - 1 ? 'w-1/2' : 'w-full'
                    }`}/>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
