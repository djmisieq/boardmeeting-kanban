'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Check, 
  X,
  Filter,
  Building
} from 'lucide-react';
import { useProjectsStore } from '@/store/use-projects-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { ProjectStatus } from '@/lib/types';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function ProjectsPage() {
  const { projects } = useProjectsStore();
  const { departments, selectedDepartmentId, setSelectedDepartment } = useDepartmentsStore();
  
  // Filtry
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string | 'all'>(selectedDepartmentId || 'all');
  
  // Efekt dla filtra działu
  useEffect(() => {
    if (selectedDepartmentId) {
      setDepartmentFilter(selectedDepartmentId);
    }
  }, [selectedDepartmentId]);
  
  // Zastosowanie filtrów
  const filteredProjects = projects.filter(project => {
    // Filtr wyszukiwania
    if (
      searchTerm && 
      !project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !project.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    
    // Filtr statusu
    if (statusFilter !== 'all' && project.status !== statusFilter) {
      return false;
    }
    
    // Filtr działu
    if (departmentFilter !== 'all' && !project.departments.includes(departmentFilter)) {
      return false;
    }
    
    return true;
  });
  
  // Obsługa zmiany filtra działu
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptId = e.target.value;
    setDepartmentFilter(deptId);
    setSelectedDepartment(deptId === 'all' ? null : deptId);
  };
  
  // Helper dla kolorów statusu
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'not-started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'planning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'on-hold':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };
  
  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case 'not-started':
        return 'Nie rozpoczęty';
      case 'planning':
        return 'Planowanie';
      case 'in-progress':
        return 'W trakcie';
      case 'on-hold':
        return 'Wstrzymany';
      case 'completed':
        return 'Zakończony';
      default:
        return status;
    }
  };
  
  return (
    <ErrorBoundary>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projekty</h1>
          
          <Link
            href="/projects/new"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nowy projekt
          </Link>
        </div>
        
        {/* Filtry */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Wyszukiwanie */}
            <div className="flex-grow min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Szukaj projektów..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-10 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Filtr statusu */}
            <div className="min-w-[200px]">
              <label htmlFor="status" className="block text-sm font-medium mb-1">
                <Filter className="h-4 w-4 inline mr-1" /> Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="all">Wszystkie statusy</option>
                <option value="not-started">Nie rozpoczęty</option>
                <option value="planning">Planowanie</option>
                <option value="in-progress">W trakcie</option>
                <option value="on-hold">Wstrzymany</option>
                <option value="completed">Zakończony</option>
              </select>
            </div>
            
            {/* Filtr działu */}
            <div className="min-w-[200px]">
              <label htmlFor="department" className="block text-sm font-medium mb-1">
                <Building className="h-4 w-4 inline mr-1" /> Dział
              </label>
              <select
                id="department"
                value={departmentFilter}
                onChange={handleDepartmentChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="all">Wszystkie działy</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Lista projektów */}
        {filteredProjects.length === 0 ? (
          <div className="text-center bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Nie znaleziono projektów pasujących do wybranych kryteriów.
            </p>
            <Link
              href="/projects/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
            >
              Utwórz nowy projekt
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-5 border-b dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {project.progress}% ukończone
                    </span>
                  </div>
                  <h3 className="font-medium text-lg mb-2">{project.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                    {project.description || 'Brak opisu projektu.'}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(project.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <User className="h-3 w-3 mr-1" />
                      {project.owner}
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}