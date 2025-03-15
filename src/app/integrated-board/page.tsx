'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Filter, Kanban, Briefcase } from 'lucide-react';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useProjectsStore } from '@/store/use-projects-store';
import { useKanbanStore } from '@/store/use-kanban-store';
import IntegratedBoard from '@/components/integrated/integrated-board';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function IntegratedBoardPage() {
  const { departments, selectedDepartmentId, selectDepartment } = useDepartmentsStore();
  const { projects } = useProjectsStore();
  
  const [viewMode, setViewMode] = useState<'combined' | 'kanban' | 'projects'>('combined');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get projects for the selected department
  const departmentProjects = selectedDepartmentId 
    ? projects.filter(p => p.departments.includes(selectedDepartmentId))
    : [];
  
  return (
    <ErrorBoundary>
      <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-screen-2xl mx-auto">
          {/* Breadcrumb navigation */}
          <nav className="mb-6">
            <Link 
              href="/"
              className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Powrót do strony głównej
            </Link>
          </nav>
          
          {/* Header with controls */}
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Zintegrowana tablica Kanban z projektami</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Wizualizacja zadań, problemów i usprawnień z połączeniem do projektów
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="flex bg-white dark:bg-gray-800 rounded-md border dark:border-gray-700 p-0.5">
                <button
                  onClick={() => setViewMode('combined')}
                  className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
                    viewMode === 'combined' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Kanban className="h-4 w-4 mr-1" />
                  Połączony
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
                    viewMode === 'kanban' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Kanban className="h-4 w-4 mr-1" />
                  Kanban
                </button>
                <button
                  onClick={() => setViewMode('projects')}
                  className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
                    viewMode === 'projects' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Briefcase className="h-4 w-4 mr-1" />
                  Projekty
                </button>
              </div>
              
              {/* Filter button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-1.5 text-sm rounded-md border dark:border-gray-700 ${
                  showFilters
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                    : 'bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtry
              </button>
            </div>
          </div>
          
          {/* Department selector */}
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <label className="block text-sm font-medium mb-2">Wybierz dział:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {departments.map(dept => (
                <button
                  key={dept.id}
                  onClick={() => selectDepartment(dept.id)}
                  className={`p-3 text-left rounded-md ${
                    selectedDepartmentId === dept.id
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 text-blue-700 dark:text-blue-400 border'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="font-medium">{dept.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {dept.members.length} członków • {departmentProjects.filter(p => p.departments.includes(dept.id)).length} projektów
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Filter panel (conditionally rendered) */}
          {showFilters && (
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
              <h3 className="font-medium mb-3">Filtry:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status karty:</label>
                  <select className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                    <option value="all">Wszystkie statusy</option>
                    <option value="to-do">Do zrobienia</option>
                    <option value="in-progress">W trakcie</option>
                    <option value="done">Zakończone</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Status projektu:</label>
                  <select className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                    <option value="all">Wszystkie statusy</option>
                    <option value="not-started">Nie rozpoczęty</option>
                    <option value="planning">Planowanie</option>
                    <option value="in-progress">W trakcie</option>
                    <option value="on-hold">Wstrzymany</option>
                    <option value="completed">Zakończony</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Połączenia:</label>
                  <select className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                    <option value="all">Wszystkie</option>
                    <option value="connected">Tylko połączone</option>
                    <option value="not-connected">Bez połączeń</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Integrated board component */}
          <IntegratedBoard viewMode={viewMode} departmentId={selectedDepartmentId || ''} />
        </div>
      </div>
    </ErrorBoundary>
  );
}
