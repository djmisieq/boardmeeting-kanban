import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { CardType } from './kanban-board';
import { v4 as uuidv4 } from 'uuid';

interface KanbanColumnProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onAddCard: (card: CardType) => void;
}

const KanbanColumn = ({ id, title, children, onAddCard }: KanbanColumnProps) => {
  const [showForm, setShowForm] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  
  const { setNodeRef } = useDroppable({
    id,
  });

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCardTitle.trim()) return;
    
    const newCard: CardType = {
      id: uuidv4(),
      title: newCardTitle,
      description: newCardDescription || undefined,
    };
    
    onAddCard(newCard);
    setNewCardTitle('');
    setNewCardDescription('');
    setShowForm(false);
  };

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-full min-h-[60vh] flex flex-col"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">{title}</h3>
        <button 
          onClick={() => setShowForm(true)}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-3 flex-grow">
        {children}
      </div>
      
      {showForm && (
        <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-md shadow">
          <form onSubmit={handleAddCard}>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Card title"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                required
              />
            </div>
            <div className="mb-3">
              <textarea
                placeholder="Description (optional)"
                value={newCardDescription}
                onChange={(e) => setNewCardDescription(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default KanbanColumn;