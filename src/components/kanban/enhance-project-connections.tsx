import { CardType } from '@/lib/types';
import { useProjectsStore } from '@/store/use-projects-store';
import ProjectBadge from '@/components/ui/project-badge';
import React from 'react';
import { extractColumnType, isCompletionColumn } from '@/lib/status-mapping';

interface EnhanceProjectConnectionsProps {
  card: CardType;
  columnId: string;
  children: React.ReactNode;
}

/**
 * Komponent opakowujący kartę Kanban, dodający wizualizację połączeń z projektami
 */
const EnhanceProjectConnections: React.FC<EnhanceProjectConnectionsProps> = ({
  card,
  columnId,
  children
}) => {
  const { projects } = useProjectsStore();
  
  // Znajdź projekty powiązane z tą kartą
  const linkedProjects = projects.filter(project => 
    project.tasks.some(task => task.cardId === card.id)
  );
  
  if (linkedProjects.length === 0) {
    // Jeśli nie ma powiązanych projektów, zwracamy oryginalny komponent bez zmian
    return <>{children}</>;
  }
  
  // Sprawdź czy karta jest w kolumnie oznaczającej zakończenie
  const columnType = extractColumnType(columnId);
  const isCompleted = isCompletionColumn(columnType);
  
  return (
    <div className="relative">
      {/* Wskaźnik projektu w prawym górnym rogu */}
      <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 flex gap-1 z-10">
        {linkedProjects.map(project => (
          <ProjectBadge 
            key={project.id} 
            project={project}
            size="sm"
            isCard={true}
          />
        ))}
      </div>
      
      {/* Dodaj obramowanie wskazujące na powiązanie z projektem */}
      <div 
        className={`
          absolute inset-0 rounded-md border-2 pointer-events-none
          ${isCompleted 
            ? 'border-green-300 dark:border-green-700' 
            : 'border-blue-300 dark:border-blue-700'
          }
          ${linkedProjects.length > 0 ? 'opacity-100' : 'opacity-0'}
        `}
      />
      
      {/* Oryginalny komponent karty */}
      {children}
    </div>
  );
};

export default EnhanceProjectConnections;
