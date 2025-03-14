import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Calendar, User, Flag, MoreVertical, Edit, Trash, Share2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { CardType } from '@/lib/types';
import { useKanbanStore } from '@/store/use-kanban-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import CardDialog from './card-dialog';

interface KanbanCardProps {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  boardId?: string;
  columnId?: string;
  onUpdate?: (updates: Partial<CardType>) => void;
  onDelete?: () => void;
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
  onUpdate,
  onDelete
}: KanbanCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  const { departments, selectedDepartmentId } = useDepartmentsStore();
  const { transferCardToDepartment } = useKanbanStore();

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

  const handleEdit = () => {
    setShowMenu(false);
    setShowEditDialog(true);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      onDelete?.();
    }
    setShowMenu(false);
  };
  
  const handleShare = () => {
    setShowMenu(false);
    setShowShareDialog(true);
  };

  const handleSaveCard = (updatedCard: Omit<CardType, 'id'>) => {
    onUpdate?.({
      title: updatedCard.title,
      description: updatedCard.description,
      assignee: updatedCard.assignee,
      dueDate: updatedCard.dueDate,
      priority: updatedCard.priority,
    });
  };
  
  const handleShareWithDepartment = (targetDepartmentId: string) => {
    if (boardId && columnId && targetDepartmentId) {
      // Determine the target board based on the current board type
      const currentBoardType = boardId.includes('tasks') ? 'tasks' : 
                              boardId.includes('problems') ? 'problems' : 'ideas';
                              
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
  
  // Check if the due date is overdue
  const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm cursor-grab relative"
      >
        <div className="flex justify-between items-start">
          <h4 className="font-medium mb-2 pr-6">{title}</h4>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {showMenu && (
            <div className="absolute top-8 right-2 bg-white dark:bg-gray-800 shadow-md rounded-md py-1 z-10 w-32">
              <button 
                onClick={handleEdit}
                className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              
              <button 
                onClick={handleShare}
                className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              
              <button 
                onClick={handleDelete}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
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
              {isOverdue && ' (Overdue)'}
            </div>
          )}
          
          {priority && (
            <div className={`flex items-center text-xs px-2 py-0.5 rounded ${priorityColors[priority]}`}>
              <Flag className="h-3 w-3 mr-1" />
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Edit Card Dialog */}
      <CardDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSave={handleSaveCard}
        card={{ id, title, description, assignee, dueDate, priority }}
        title="Edit Card"
      />
      
      {/* Share Card Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4">Share with Department</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Select a department to share this card with:
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
                <p className="text-gray-500 italic">No other departments available.</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowShareDialog(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KanbanCard;