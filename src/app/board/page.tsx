'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import IntegratedBoard from '@/components/kanban/integrated-board';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useKanbanStore } from '@/store/use-kanban-store';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Loading } from '@/components/ui/loading';

export default function BoardPage() {
  const searchParams = useSearchParams();
  const departmentId = searchParams.get('departmentId');
  
  const { setSelectedDepartment } = useDepartmentsStore();
  const { getBoard, initializeBoard } = useKanbanStore();
  
  // Efekt do ustawienia wybranego działu z parametrów URL
  useEffect(() => {
    if (departmentId) {
      setSelectedDepartment(departmentId);
    }
  }, [departmentId, setSelectedDepartment]);
  
  // Efekt do inicjalizacji tablic, jeśli nie istnieją
  useEffect(() => {
    const deptId = departmentId || 'default';
    
    // Inicjalizacja tablic dla wybranego działu, jeśli nie istnieją
    if (!getBoard(`${deptId}-tasks`)) {
      initializeBoard(`${deptId}-tasks`, 'tasks', deptId, []);
    }
    
    if (!getBoard(`${deptId}-problems`)) {
      initializeBoard(`${deptId}-problems`, 'problems', deptId, []);
    }
    
    if (!getBoard(`${deptId}-ideas`)) {
      initializeBoard(`${deptId}-ideas`, 'ideas', deptId, []);
    }
  }, [departmentId, getBoard, initializeBoard]);
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-4">
          <IntegratedBoard />
        </div>
      </div>
    </ErrorBoundary>
  );
}
