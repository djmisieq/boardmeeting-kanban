import { useState, useEffect } from 'react';
import { X, Calendar, User, Flag, MessageSquare, History, Check, Paperclip } from 'lucide-react';
import { CardType } from '@/lib/types';
import CommentSection from '@/components/collaboration/comment-section';
import CardHistory from '@/components/collaboration/card-history';
import { useCollaborationStore } from '@/store/use-collaboration-store';

interface CardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<CardType, 'id'>) => void;
  card?: CardType;
  title: string;
  currentUser: string;
  departmentId: string;
}

const CardDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  card, 
  title,
  currentUser,
  departmentId
}: CardDialogProps) => {
  const [cardTitle, setCardTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [assignee, setAssignee] = useState(card?.assignee || '');
  const [dueDate, setDueDate] = useState(card?.dueDate || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | ''>(card?.priority || '');
  
  // Obsługa zakładek dla różnych sekcji dialogu
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');
  
  // Zapisz referencję do store'a
  const collaborationStore = useCollaborationStore();
  
  useEffect(() => {
    if (isOpen && card) {
      setCardTitle(card.title);
      setDescription(card.description || '');
      setAssignee(card.assignee || '');
      setDueDate(card.dueDate || '');
      setPriority(card.priority || '');
      setActiveTab('details');
    } else if (isOpen) {
      // Wyczyść formularz przy tworzeniu nowej karty
      setCardTitle('');
      setDescription('');
      setAssignee('');
      setDueDate('');
      setPriority('');
      setActiveTab('details');
    }
  }, [isOpen, card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Przygotuj zaktualizowaną kartę
    const updatedCard: Omit<CardType, 'id'> = {
      title: cardTitle,
      description: description || undefined,
      assignee: assignee || undefined,
      dueDate: dueDate || undefined,
      priority: priority || undefined,
    };
    
    // Jeśli karta istnieje, dodaj wpis do historii zmian
    if (card) {
      // Utwórz historię zmian za pomocą własnego kodu
      if (card.title !== cardTitle) {
        collaborationStore.addHistoryEntry(
          card.id,
          'updated',
          currentUser,
          departmentId,
          {
            field: 'title',
            oldValue: card.title,
            newValue: cardTitle
          }
        );
      }
      
      if (card.description !== description) {
        collaborationStore.addHistoryEntry(
          card.id,
          'updated',
          currentUser,
          departmentId,
          {
            field: 'description',
            oldValue: card.description,
            newValue: description
          }
        );
      }
      
      if (card.assignee !== assignee) {
        collaborationStore.addHistoryEntry(
          card.id,
          'assigned',
          currentUser,
          departmentId,
          {
            oldValue: card.assignee,
            newValue: assignee
          }
        );
      }
      
      if (card.priority !== priority) {
        collaborationStore.addHistoryEntry(
          card.id,
          'changed_priority',
          currentUser,
          departmentId,
          {
            oldValue: card.priority,
            newValue: priority
          }
        );
      }
      
      if (card.dueDate !== dueDate) {
        collaborationStore.addHistoryEntry(
          card.id,
          'updated',
          currentUser,
          departmentId,
          {
            field: 'dueDate',
            oldValue: card.dueDate,
            newValue: dueDate
          }
        );
      }
    }
    
    onSave(updatedCard);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Zakładki */}
        <div className="flex border-b dark:border-gray-700">
          <button
            className={`px-4 py-2 flex items-center ${
              activeTab === 'details' 
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('details')}
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Szczegóły
          </button>
          <button
            className={`px-4 py-2 flex items-center ${
              activeTab === 'comments' 
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('comments')}
            disabled={!card}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Komentarze
          </button>
          <button
            className={`px-4 py-2 flex items-center ${
              activeTab === 'history' 
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('history')}
            disabled={!card}
          >
            <History className="h-4 w-4 mr-2" />
            Historia
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 flex-grow">
          {activeTab === 'details' && (
            <form onSubmit={handleSubmit} id="card-form" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tytuł</label>
                <input
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Opis</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-md h-24 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Opis (opcjonalnie)"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Przypisana osoba</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      className="w-full p-2 pl-8 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Przypisz osobę (opcjonalnie)"
                    />
                    <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Termin</label>
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
                <label className="block text-sm font-medium mb-1">Priorytet</label>
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
                      Niski
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
                      Średni
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
                      Wysoki
                    </span>
                  </label>
                </div>
              </div>
            </form>
          )}
          
          {/* Sekcja komentarzy */}
          {activeTab === 'comments' && card && (
            <CommentSection
              cardId={card.id}
              currentUser={currentUser}
              currentDepartmentId={departmentId}
            />
          )}
          
          {/* Historia zmian */}
          {activeTab === 'history' && card && (
            <CardHistory cardId={card.id} />
          )}
        </div>
        
        {/* Przyciski akcji na dole */}
        <div className="flex justify-end space-x-3 p-4 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Anuluj
          </button>
          
          {activeTab === 'details' && (
            <button
              type="submit"
              form="card-form"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Zapisz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDialog;