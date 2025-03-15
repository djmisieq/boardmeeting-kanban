import React from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  User, 
  ArrowUpRight, 
  CheckSquare, 
  Briefcase,
  Flag,
  Clock,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { Project } from '@/lib/types';
import { useKanbanStore } from '@/store/use-kanban-store';
import { useDepartmentsStore } from '@/store/use-departments-store';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { findCardById } = useKanbanStore();
  const { departments } = useDepartmentsStore();
  
  // Get the main department
  const mainDepartment = project.departments.length > 0
    ? departments.find(d => d.id === project.departments[0])
    : null;
  
  // Calculate days left
  const today = new Date();
  const endDate = new Date(project.endDate);
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determine status color and text
  const getStatusColor = () => {
    switch (project.status) {
      case 'not-started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
      case 'planning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'in-progress':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      case 'on-hold':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };
  
  const getStatusText = () => {
    switch (project.status) {
      case 'not-started': return 'Nie rozpoczęty';
      case 'planning': return 'Planowanie';
      case 'in-progress': return 'W trakcie';
      case 'on-hold': return 'Wstrzymany';
      case 'completed': return 'Zakończony';
      default: return 'Nieznany';
    }
  };
  
  // Get tasks from multiple departments
  const associatedCards = project.tasks.map(task => {
    const cardInfo = findCardById(task.cardId);
    return {
      taskId: task.id,
      cardId: task.cardId,
      boardInfo: cardInfo
    };
  }).filter(card => card.boardInfo !== null);
  
  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Progress bar at the top */}
      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700">
        <div 
          className="h-full bg-blue-500 dark:bg-blue-600"
          style={{ width: `${project.progress}%` }}
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor()} mb-2`}>
              {getStatusText()}
            </span>
            <h3 className="font-medium text-lg">{project.name}</h3>
          </div>
          <Link 
            href={`/projects/${project.id}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
        
        {project.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3 text-xs">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(project.startDate).toLocaleDateString('pl-PL')} - {new Date(project.endDate).toLocaleDateString('pl-PL')}
          </div>
          
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <User className="h-3 w-3 mr-1" />
            {project.owner}
          </div>
          
          {daysLeft > 0 && (
            <div className={`flex items-center ${daysLeft < 5 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
              <Clock className="h-3 w-3 mr-1" />
              {daysLeft} {daysLeft === 1 ? 'dzień' : 'dni'} do terminu
            </div>
          )}
        </div>
        
        {/* Departments and tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {project.departments.map(deptId => {
            const dept = departments.find(d => d.id === deptId);
            return dept ? (
              <span 
                key={deptId}
                className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 rounded"
              >
                {dept.name}
              </span>
            ) : null;
          })}
          
          {project.tags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Project tasks with source indicators */}
        <div className="border-t dark:border-gray-700 pt-3 mt-3">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Powiązane karty ({project.tasks.length}):
          </div>
          
          {project.tasks.length === 0 ? (
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
              Brak powiązanych kart Kanban
            </div>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {associatedCards.slice(0, 3).map(card => {
                if (!card.boardInfo) return null;
                
                const { boardId, columnId } = card.boardInfo;
                
                // Determine card type based on board ID
                const cardType = boardId.includes('tasks') 
                  ? 'task' 
                  : boardId.includes('problems')
                    ? 'problem'
                    : 'idea';
                
                const cardTypeIcon = cardType === 'task' 
                  ? <CheckSquare className="h-3 w-3 mr-1 text-blue-500" />
                  : cardType === 'problem'
                    ? <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                    : <Lightbulb className="h-3 w-3 mr-1 text-yellow-500" />;
                
                return (
                  <div 
                    key={card.taskId}
                    className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded"
                  >
                    <div className="flex items-center overflow-hidden">
                      {cardTypeIcon}
                      <span className="truncate">
                        {card.boardInfo?.title || 'Karta Kanban'}
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      <Link
                        href={`/board?boardId=${boardId}&cardId=${card.cardId}`}
                        className="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
              
              {project.tasks.length > 3 && (
                <Link
                  href={`/projects/${project.id}`}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                >
                  Zobacz wszystkie ({project.tasks.length}) karty
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Link>
              )}
            </div>
          )}
        </div>
        
        {/* Next milestone if available */}
        {project.milestones.length > 0 && (
          <div className="border-t dark:border-gray-700 pt-3 mt-3">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Najbliższy kamień milowy:
            </div>
            
            {(() => {
              // Find the next uncompleted milestone
              const now = new Date();
              const upcomingMilestones = project.milestones
                .filter(m => !m.completed && new Date(m.date) >= now)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
              
              const nextMilestone = upcomingMilestones[0] || project.milestones[0];
              
              if (nextMilestone) {
                return (
                  <div className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    <div className="font-medium">{nextMilestone.name}</div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-600 dark:text-gray-300">
                        {nextMilestone.description && nextMilestone.description.substring(0, 50)}
                        {nextMilestone.description && nextMilestone.description.length > 50 ? '...' : ''}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {new Date(nextMilestone.date).toLocaleDateString('pl-PL')}
                      </span>
                    </div>
                  </div>
                );
              }
              
              return (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  Brak zdefiniowanych kamieni milowych
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
