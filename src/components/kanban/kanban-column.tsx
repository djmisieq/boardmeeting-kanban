import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { CardType } from './kanban-board';
import CardDialog from './card-dialog';

interface KanbanColumnProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onAddCard: (card: CardType) => void;
}

const KanbanColumn = ({ id, title, children, onAddCard }: KanbanColumnProps) => {
  const [showDialog, setShowDialog] = useState(false);
  
  const { setNodeRef } = useDroppable({
    id,
  });

  const handleSaveCard = (card: Omit<CardType, 'id'>) => {
    onAddCard({
      ...card,
      id: `card-${Date.now()}`, // Simple ID generation
    });
    setShowDialog(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-full min-h-[60vh] flex flex-col"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">{title}</h3>
          <button 
            onClick={() => setShowDialog(true)}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={`Add a card to ${title}`}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-3 flex-grow">
          {children}
        </div>
      </div>
      
      <CardDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSave={handleSaveCard}
        title={`Add Card to ${title}`}
      />
    </>
  );
};

export default KanbanColumn;