import { useDraggable } from '@dnd-kit/core';
import { Calendar, User, Flag } from 'lucide-react';
import { motion } from 'framer-motion';

interface KanbanCardProps {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

const KanbanCard = ({ 
  id, 
  title, 
  description, 
  assignee, 
  dueDate, 
  priority 
}: KanbanCardProps) => {
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

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm cursor-grab"
    >
      <h4 className="font-medium mb-2">{title}</h4>
      
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
  );
};

export default KanbanCard;