import { useState, useEffect } from 'react';
import { X, Calendar, User, Flag } from 'lucide-react';
import { CardType } from './kanban-board';

interface CardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<CardType, 'id'>) => void;
  card?: CardType;
  title: string;
}

const CardDialog = ({ isOpen, onClose, onSave, card, title }: CardDialogProps) => {
  const [cardTitle, setCardTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [assignee, setAssignee] = useState(card?.assignee || '');
  const [dueDate, setDueDate] = useState(card?.dueDate || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | ''>(card?.priority || '');

  useEffect(() => {
    if (isOpen && card) {
      setCardTitle(card.title);
      setDescription(card.description || '');
      setAssignee(card.assignee || '');
      setDueDate(card.dueDate || '');
      setPriority(card.priority || '');
    } else if (isOpen) {
      // Clear form when creating a new card
      setCardTitle('');
      setDescription('');
      setAssignee('');
      setDueDate('');
      setPriority('');
    }
  }, [isOpen, card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedCard: Omit<CardType, 'id'> = {
      title: cardTitle,
      description: description || undefined,
      assignee: assignee || undefined,
      dueDate: dueDate || undefined,
      priority: priority || undefined,
    };
    
    onSave(updatedCard);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md h-24 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Description (optional)"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Assignee</label>
                <div className="relative">
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full p-2 pl-8 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Assignee (optional)"
                  />
                  <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 pl-8 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value="low"
                    checked={priority === 'low'}
                    onChange={() => setPriority('low')}
                    className="mr-2"
                  />
                  <span className="flex items-center">
                    <Flag className="h-4 w-4 text-green-500 mr-1" />
                    Low
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value="medium"
                    checked={priority === 'medium'}
                    onChange={() => setPriority('medium')}
                    className="mr-2"
                  />
                  <span className="flex items-center">
                    <Flag className="h-4 w-4 text-yellow-500 mr-1" />
                    Medium
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value="high"
                    checked={priority === 'high'}
                    onChange={() => setPriority('high')}
                    className="mr-2"
                  />
                  <span className="flex items-center">
                    <Flag className="h-4 w-4 text-red-500 mr-1" />
                    High
                  </span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardDialog;