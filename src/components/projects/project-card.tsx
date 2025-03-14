'use client';

import { Project } from '@/lib/types';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useProjectsStore } from '@/store/use-projects-store';
import { 
  CalendarRange, 
  User, 
  Tag, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PauseCircle, 
  PlusCircle 
} from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  showDetails?: boolean;
}

export default function ProjectCard({ project, showDetails = false }: ProjectCardProps) {
  const { departments } = useDepartmentsStore();
  
  // Znajdź nazwy działów uczestniczących w projekcie
  const departmentNames = project.departments
    .map(deptId => {
      const dept = departments.find(d => d.id === deptId);
      return dept ? dept.name : null;
    })
    .filter(Boolean);
  
  // Status projektu
  const getStatusInfo = (status: Project['status']) => {
    switch (status) {
      case 'not-started':
        return {
          label: 'Nie rozpoczęty',
          icon: <PlusCircle size={16} className="text-gray-600" />,
          color: 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700'
        };
      case 'planning':
        return {
          label: 'Planowanie',
          icon: <CalendarRange size={16} className="text-blue-600" />,
          color: 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900'
        };
      case 'in-progress':
        return {
          label: 'W trakcie',
          icon: <Clock size={16} className="text-amber-600" />,
          color: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900'
        };
      case 'on-hold':
        return {
          label: 'Wstrzymany',
          icon: <PauseCircle size={16} className="text-red-600" />,
          color: 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900'
        };
      case 'completed':
        return {
          label: 'Zakończony',
          icon: <CheckCircle2 size={16} className="text-green-600" />,
          color: 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900'
        };
      default:
        return {
          label: 'Nieznany',
          icon: <AlertTriangle size={16} className="text-gray-600" />,
          color: 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700'
        };
    }
  };
  
  const statusInfo = getStatusInfo(project.status);
  
  // Formatowanie daty
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Kalkulacja ile dni zostało do końca projektu
  const getDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(project.endDate);
    
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const daysRemaining = getDaysRemaining();
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold truncate">{project.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusInfo.color}`}>
            {statusInfo.icon}
            {statusInfo.label}
          </span>
        </div>
        
        {project.description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <User size={14} className="mr-1" />
            {project.owner}
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <CalendarRange size={14} className="mr-1" />
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </div>
        </div>
        
        {showDetails && (
          <>
            <div className="mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Postęp: {project.progress}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Działy:
              </div>
              <div className="flex flex-wrap gap-1">
                {departmentNames.map((name, i) => (
                  <span 
                    key={i}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
            
            {project.tags && project.tags.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag, i) => (
                    <span 
                      key={i}
                      className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded flex items-center"
                    >
                      <Tag size={10} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">{project.tasks.length}</span> zadań
              </div>
              
              <div className="text-sm">
                <span className={`
                  ${daysRemaining < 0 ? 'text-red-600 dark:text-red-400' : 
                    daysRemaining < 7 ? 'text-amber-600 dark:text-amber-400' : 
                    'text-gray-600 dark:text-gray-400'}
                `}>
                  {daysRemaining < 0 
                    ? `Przekroczono termin o ${Math.abs(daysRemaining)} dni` 
                    : daysRemaining === 0 
                      ? 'Termin dziś!' 
                      : `Pozostało ${daysRemaining} dni`}
                </span>
              </div>
            </div>
          </>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <Link 
            href={`/projects/${project.id}`}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showDetails ? 'Przejdź do projektu' : 'Zobacz szczegóły'}
          </Link>
        </div>
      </div>
    </div>
  );
}
