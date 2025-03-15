import React, { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { 
  Calendar, 
  User, 
  Flag, 
  MoreVertical, 
  Edit, 
  Trash, 
  Share2, 
  ExternalLink, 
  Briefcase,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CardType } from '@/lib/types';
import { useKanbanStore } from '@/store/use-kanban-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useProjectsStore } from '@/store/use-projects-store';
import CardDialog from './card-dialog';
import CardToProjectDialog from './card-to-project-dialog';
import Link from 'next/link';

interface KanbanCardProps {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  boardId?: string;
  columnId?: string;
  categoryIcon?: React.ReactNode; // Dodana ikona kategorii
  onUpdate?: (updates: Partial<CardType>) => void;
  onDelete?: () => void;
  isDragging?: boolean;
}

const KanbanCard = ({ 
  id, 
  title, 
  description, 
  assignee, 
  dueDate, 
  priority,
  boardId,
  columnId,
  categoryIcon, // Nowy prop
  onUpdate,
  onDelete,
  isDragging = false
}: KanbanCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  
  const { departments, selectedDepartmentId } = useDepartmentsStore();
  const { transferCardToDepartment, updateCard } = useKanbanStore();
  const { projects } = useProjectsStore();

  // Apply enhanced configuration to the draggable hook
  const { attributes, listeners, setNodeRef, transform, isDragging: isCurrentlyDragging } = useDraggable({
    id,
    data: {
      type: 'card',
      boardId,
      columnId
    }
  });

  // Determine card category based on boardId
  const getCardCategory = (): 'task' | 'problem' | 'idea' => {
    if (!boardId) return 'task';
    if (boardId.includes('tasks')) return 'task';
    if (boardId.includes('problems')) return 'problem';
    if (boardId.includes('ideas')) return 'idea';
    return 'task';
  };

  const cardCategory = getCardCategory();

  // Check if the card is already connected to a project
  const connectedProjects = projects.filter(project => 
    project.tasks.some(task => task.cardId === id)
  );

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  };

  // Apply transforms with correct GPU acceleration
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
    transition: 'none',
  } : undefined;

  // Close menu when dragging starts to prevent interference
  useEffect(() => {
    if (isDragging && showMenu) {
      setShowMenu(false);
    }
  }, [isDragging, showMenu]);

  const handleEdit = () => {
    setShowMenu(false);
    setShowEditDialog(true);
  };

  const handleDelete = () => {
    if (window.confirm('Czy na pewno chcesz usunąć tę kartę? Tej operacji nie można cofnąć.')) {
      onDelete?.();
    }
    setShowMenu(false);
  };
  
  const handleShare = () => {
    setShowMenu(false);
    setShowShareDialog(true);
  };

  const handleCreateProject = () => {
    setShowMenu(false);
    setShowProjectDialog(true);
  };

  const handleSaveCard = (updatedCard: Omit<CardType, 'id'>) => {
    onUpdate?.(updatedCard);
    setShowEditDialog(false);
  };
  
  const handleShareWithDepartment = (targetDepartmentId: string) => {
    if (boardId && columnId && targetDepartmentId) {
      // Determine the target board based on the current board type
      const currentBoardType = cardCategory + 's';
      
      const targetBoardId = `${targetDepartmentId}-${currentBoardType}`;
      const targetColumnId = `${targetBoardId}-${columnId.split('-').pop()}`;
      
      transferCardToDepartment(
        boardId,
        columnId,
        id,
        targetDepartmentId,
        targetBoardId,
        targetColumnId
      );
      
      setShowShareDialog(false);
    }
  };

  // Handle card update after project creation
  const handleProjectCreated = (projectId: string) => {
    if (boardId && columnId) {
      // Update the card to include the project ID
      const updates: Partial<CardType> = {
        projectIds: [projectId]
      };
      
      updateCard(boardId, columnId, id, updates);
      
      // Close the dialog
      setShowProjectDialog(false);
    }
  };
  
  // Check if the due date is overdue
  const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;

  // Combine drag state from local and parent component
  const finalIsDragging = isDragging || isCurrentlyDragging;

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        whileHover={{ scale: finalIsDragging ? 1.0 : 1.02 }}
        className={`bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm ${finalIsDragging ? 'cursor-grabbing opacity-75 shadow-md' : 'cursor-grab'} relative`}
      >
        {/* Dodanie paska kategorii na górze karty, jeśli ikona jest dostępna */}
        {categoryIcon && (
          <div className="absolute -top-1 -left-1 rounded-tl rounded-br bg-white dark:bg-gray-600 p-1 shadow-sm">
            {categoryIcon}
          </div>
        )}

        {/* Ulepszone oznaczenie, jeśli karta jest powiązana z projektem */}
        {connectedProjects.length > 0 && (
          <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 group">
            <div className="bg-purple-500 text-white rounded-full p-1 shadow-md">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            
            {/* Tooltip z informacją o projekcie */}
            <div className="absolute right-0 top-6 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 text-xs z-20 invisible group-hover:visible transform scale-95 group-hover:scale-100 transition-all">
              <div className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                Połączono z projektem:
              </div>
              {connectedProjects.map(project => (
                <Link 
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between text-blue-600 dark:text-blue-400 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded mb-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>{project.name}</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-start">
          <h4 className="font-medium mb-2 pr-6">{title}</h4>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {showMenu && !finalIsDragging && (
            <div className="absolute top-8 right-2 bg-white dark:bg-gray-800 shadow-md rounded-md py-1 z-10 w-44">
              <button 
                onClick={handleEdit}
                className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edytuj
              </button>
              
              <button 
                onClick={handleShare}
                className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Udostępnij
              </button>

              {/* Wyróżniona opcja przekształcania w projekt */}
              {connectedProjects.length === 0 ? (
                <button 
                  onClick={handleCreateProject}
                  className="flex items-center w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="font-medium">Przekształć w projekt</span>
                </button>
              ) : (
                <div className="px-3 py-2 border-t border-b dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Połączono z projektami:</div>
                  {connectedProjects.map(project => (
                    <Link 
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-between text-blue-600 dark:text-blue-400 py-1 text-sm hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                      }}
                    >
                      <span>{project.name}</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  ))}
                </div>
              )}
              
              <button 
                onClick={handleDelete}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Trash className="h-4 w-4 mr-2" />
                Usuń
              </button>
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mt-2">
          {assignee && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <User className="h-3 w-3 mr-1" />
              {assignee}
            </div>
          )}
          
          {dueDate && (
            <div className={`flex items-center text-xs ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
              <Calendar className="h-3 w-3 mr-1" />
              {dueDate}
              {isOverdue && ' (Zaległe)'}
            </div>
          )}
          
          {priority && (
            <div className={`flex items-center text-xs px-2 py-0.5 rounded ${priorityColors[priority]}`}>
              <Flag className="h-3 w-3 mr-1" />
              {priority === 'low' ? 'Niski' : 
               priority === 'medium' ? 'Średni' : 'Wysoki'}
            </div>
          )}

          {/* Ulepszone oznaczenie powiązania z projektem */}
          {connectedProjects.length > 0 && (
            <div className="flex items-center text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
              <Briefcase className="h-3 w-3 mr-1" />
              {connectedProjects.length > 1 ? `${connectedProjects.length} projekty` : 'Projekt'}
            </div>
          )}
        </div>

        {/* Dodanie przycisku szybkiego tworzenia projektu, jeśli karta nie jest jeszcze związana z projektem */}
        {connectedProjects.length === 0 && (
          <button
            onClick={handleCreateProject}
            className="absolute bottom-0 right-0 transform translate-x-2 translate-y-2 bg-purple-500 text-white rounded-full p-1 shadow-md hover:bg-purple-600 transition-colors"
            title="Przekształć w projekt"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </motion.div>
      
      {/* Edit Card Dialog */}
      <CardDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSave={handleSaveCard}
        card={{ id, title, description, assignee, dueDate, priority }}
        title="Edytuj kartę"
        currentUser={assignee || "Admin"}
        departmentId={selectedDepartmentId || "default"}
      />
      
      {/* Share Card Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4">Udostępnij działowi</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Wybierz dział, któremu chcesz udostępnić tę kartę:
            </p>
            
            <div className="max-h-60 overflow-y-auto space-y-2 mb-6">
              {departments.filter(dept => dept.id !== selectedDepartmentId).map(dept => (
                <button
                  key={dept.id}
                  onClick={() => handleShareWithDepartment(dept.id)}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-left"
                >
                  <span>{dept.name}</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </button>
              ))}
              
              {departments.filter(dept => dept.id !== selectedDepartmentId).length === 0 && (
                <p className="text-gray-500 italic">Brak innych dostępnych działów.</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowShareDialog(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card to Project Dialog */}
      {showProjectDialog && (
        <CardToProjectDialog
          isOpen={showProjectDialog}
          onClose={() => setShowProjectDialog(false)}
          card={{ id, title, description, assignee, dueDate, priority }}
          boardId={boardId || ''}
          columnId={columnId || ''}
          category={cardCategory}
          departmentId={selectedDepartmentId || 'default'}
        />
      )}
    </>
  );
};

export default KanbanCard;