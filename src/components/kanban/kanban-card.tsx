import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Calendar, User, Flag, MoreVertical, Edit, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { useKanbanStore } from '@/store/use-kanban-store';
import CardDialog from './card-dialog';
import { CardType } from './kanban-board';

interface KanbanCardProps {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  boardId?: string;
  columnId?: string;
}

const KanbanCard = ({ 
  id, 
  title, 
  description, 
  assignee, 
  dueDate, 
  priority,
  boardId,
  columnId
}: KanbanCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const updateCard = useKanbanStore(state => state.updateCard);
  const deleteCard = useKanbanStore(state => state.deleteCard);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
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
    if (boardId && columnId) {
      deleteCard(boardId, columnId, id);
    }
    setShowMenu(false);
  };

  const handleSaveCard = (updatedCard: Omit<CardType, 'id'>) => {
    if (boardId && columnId) {
      updateCard(boardId, columnId, id, updatedCard);
    }
  };

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
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3 mr-1" />
              {dueDate}
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
      
      <CardDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSave={handleSaveCard}
        card={{ id, title, description, assignee, dueDate, priority }}
        title="Edit Card"
      />
    </>
  );
};

export default KanbanCard;