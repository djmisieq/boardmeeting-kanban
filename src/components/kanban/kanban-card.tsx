import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  MoreVertical, 
  User, 
  Calendar, 
  Trash, 
  Edit,
  Copy,
  ArrowUpRight,
  CheckSquare,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';
import { CardType } from '@/lib/types';
import CardToProjectDialog from './card-to-project-dialog';
import MeetingBadge from '@/components/meetings/meeting-badge';
import { useMeetingsStore } from '@/store/use-meetings-store';

interface KanbanCardProps {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  boardId?: string;
  columnId?: string;
  isDragging?: boolean;
  categoryIcon?: React.ReactNode;
  meetingId?: string;
  onUpdate?: (updates: Partial<CardType>) => void;
  onDelete?: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ 
  id, 
  title, 
  description, 
  assignee, 
  dueDate, 
  priority,
  boardId,
  columnId,
  isDragging = false,
  categoryIcon,
  meetingId,
  onUpdate,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const { meetings } = useMeetingsStore();
  
  // Find meetingId if it's not provided directly
  const findMeetingId = (): string | undefined => {
    if (meetingId) return meetingId;
    
    // Find card in meeting outcomes
    for (const meeting of meetings) {
      // Check tasks
      const taskFound = meeting.outcomes?.tasks?.find(task => task.id === id);
      if (taskFound) return meeting.id;
      
      // Check problems
      const problemFound = meeting.outcomes?.problems?.find(problem => problem.id === id);
      if (problemFound) return meeting.id;
      
      // Check ideas
      const ideaFound = meeting.outcomes?.ideas?.find(idea => idea.id === id);
      if (ideaFound) return meeting.id;
    }
    
    return undefined;
  };
  
  const cardMeetingId = findMeetingId();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    data: {
      type: 'card',
      boardId,
      columnId
    }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  // Funkcja do formatowania daty
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    if (dateOnly.getTime() === today.getTime()) {
      return 'Dziś';
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
      return 'Jutro';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Kolor obramowania w zależności od priorytetu
  const getBorderColor = (): string => {
    if (priority === 'high') {
      return 'border-l-4 border-l-red-500';
    } else if (priority === 'medium') {
      return 'border-l-4 border-l-amber-500';
    } else if (priority === 'low') {
      return 'border-l-4 border-l-green-500';
    }
    return '';
  };
  
  // Sprawdź, czy data jest przekroczona
  const isOverdue = (): boolean => {
    if (!dueDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDateTime = new Date(dueDate);
    dueDateTime.setHours(0, 0, 0, 0);
    
    return dueDateTime < today;
  };
  
  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`bg-white dark:bg-gray-800 rounded-md shadow-sm ${getBorderColor()} p-3 select-none
          ${isDragging ? 'opacity-50' : ''}
          hover:shadow-md transition-shadow duration-200`}
      >
        <div className="flex justify-between items-start">
          <Link 
            href={boardId ? `/card?id=${id}&boardId=${boardId}` : '#'}
            className="flex-1 cursor-pointer"
            onClick={(e) => {
              if (!boardId) {
                e.preventDefault();
              }
            }}
          >
            <div className="flex items-start">
              {categoryIcon && (
                <div className="mr-2 mt-1">{categoryIcon}</div>
              )}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
                
                {description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </Link>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 z-10 border dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    window.location.href = `/card?id=${id}&boardId=${boardId}`;
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Otwórz w pełnym widoku
                </button>
                
                {onUpdate && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      // Tu będzie otwieranie modalu edycji
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edytuj kartę
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowProjectDialog(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Przekształć w projekt
                </button>
                
                {cardMeetingId && (
                  <Link
                    href={`/meetings/${cardMeetingId}`}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-purple-600 dark:text-purple-400"
                    onClick={() => setShowMenu(false)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Przejdź do spotkania
                  </Link>
                )}
                
                {onDelete && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (window.confirm('Czy na pewno chcesz usunąć tę kartę?')) {
                        onDelete();
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Usuń kartę
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Badges Section */}
        <div className="mt-2 flex flex-wrap gap-1">
          {/* Meeting Badge */}
          {cardMeetingId && (
            <MeetingBadge meetingId={cardMeetingId} size="sm" isCard={true} />
          )}
          
          {/* Priority Badge */}
          {priority && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              priority === 'high' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                : priority === 'medium'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            }`}>
              {priority === 'high' ? 'Wysoki' : priority === 'medium' ? 'Średni' : 'Niski'} priorytet
            </span>
          )}
        </div>
        
        {/* Stopka karty - osoba przypisana i data */}
        <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
          {assignee && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <User className="h-3 w-3 mr-1" />
              {assignee}
            </div>
          )}
          
          {dueDate && (
            <div className={`flex items-center text-xs ${
              isOverdue() ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(dueDate)}
            </div>
          )}
        </div>
      </div>
      
      {/* Dialog przekształcania karty w projekt */}
      {showProjectDialog && (
        <CardToProjectDialog
          isOpen={showProjectDialog}
          onClose={() => setShowProjectDialog(false)}
          cardId={id}
          boardId={boardId || ''}
          columnId={columnId || ''}
        />
      )}
    </>
  );
};

export default KanbanCard;