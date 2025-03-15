import React from 'react';
import Link from 'next/link';
import { Briefcase, ArrowUpRight } from 'lucide-react';
import { Project } from '@/lib/types';

interface ProjectBadgeProps {
  project: Project;
  size?: 'sm' | 'md' | 'lg';
  isCard?: boolean;
  className?: string;
}

/**
 * Komponent wyświetlający oznaczenie projektu do prezentacji na kartach Kanban i w innych miejscach
 */
const ProjectBadge: React.FC<ProjectBadgeProps> = ({
  project,
  size = 'md',
  isCard = false,
  className = '',
}) => {
  // Określ wymiary ikony na podstawie rozmiaru
  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  // Określ styl dla różnych rozmiarów
  const badgeSize = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5',
  };
  
  // Status projektu określa kolor
  const getStatusColor = () => {
    switch (project.status) {
      case 'not-started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'planning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-progress':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'on-hold':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };
  
  // Uproszczony tekst statusu projektu
  const getStatusText = () => {
    switch (project.status) {
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
        return '';
    }
  };
  
  // Jeśli komponent jest używany na karcie, pokazujemy tylko ikonę z tooltip
  if (isCard) {
    return (
      <div className={`group relative ${className}`}>
        <div className={`${getStatusColor()} rounded-full p-1 shadow-sm`}>
          <Briefcase className={iconSize[size]} />
        </div>
        
        {/* Tooltip z informacją o projekcie */}
        <div className="absolute z-50 top-full mt-1 right-0 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 text-xs invisible group-hover:visible transform origin-top-right scale-95 group-hover:scale-100 transition-all">
          <div className="font-medium mb-1 truncate">{project.name}</div>
          <div className={`${getStatusColor()} inline-block rounded-full px-1.5 py-0.5 text-xs mb-1`}>
            {getStatusText()}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-xs mb-1.5 line-clamp-2">
            {project.description || 'Brak opisu'}
          </div>
          <Link
            href={`/projects/${project.id}`}
            className="flex items-center justify-between text-blue-600 dark:text-blue-400 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-xs"
          >
            <span>Przejdź do projektu</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }
  
  // Standardowy wygląd odznaki projektu
  return (
    <Link
      href={`/projects/${project.id}`}
      className={`
        inline-flex items-center rounded-md ${badgeSize[size]} ${getStatusColor()}
        hover:opacity-90 transition-opacity ${className}
      `}
    >
      <Briefcase className={`${iconSize[size]} mr-1`} />
      <span className="truncate">{project.name}</span>
      <ArrowUpRight className={`${iconSize[size]} ml-1 opacity-70`} />
    </Link>
  );
};

export default ProjectBadge;
