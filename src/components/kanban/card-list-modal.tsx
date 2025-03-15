import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Lightbulb, Clock, Search } from 'lucide-react';
import { CardType } from '@/lib/types';

interface CardListModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardType[];
  columns: { id: string; title: string; }[];
  onCardSelect: (cardId: string) => void;
  categoryIcons?: Record<string, React.ReactNode>;
}

const CardListModal: React.FC<CardListModalProps> = ({
  isOpen,
  onClose,
  cards,
  columns,
  onCardSelect,
  categoryIcons = {
    task: <CheckCircle className="h-4 w-4 text-blue-500" />,
    problem: <AlertCircle className="h-4 w-4 text-amber-500" />,
    idea: <Lightbulb className="h-4 w-4 text-yellow-500" />,
  }
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<string | 'all'>('all');
  
  if (!isOpen) return null;
  
  // Get column title by id
  const getColumnTitle = (columnId: string): string => {
    const column = columns.find(col => col.id === columnId);
    return column ? column.title : 'Nieznana kolumna';
  };
  
  // Filter cards based on search and column filter
  const filteredCards = cards.filter(card => {
    const matchesSearch = searchQuery === '' || 
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesColumn = selectedColumn === 'all' || card.columnId === selectedColumn;
    
    return matchesSearch && matchesColumn;
  });
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium">Lista kart</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Szukaj karty..."
                className="w-full pl-10 pr-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value as string | 'all')}
              className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 min-w-[180px]"
            >
              <option value="all">Wszystkie kolumny</option>
              {columns.map(column => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {filteredCards.length > 0 ? (
            <ul className="space-y-2">
              {filteredCards.map(card => (
                <li key={card.id}>
                  <button
                    onClick={() => {
                      onCardSelect(card.id);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between">
                      <div className="flex items-start space-x-2">
                        <span className="mt-0.5">
                          {categoryIcons[card.category as keyof typeof categoryIcons] || null}
                        </span>
                        <div>
                          <div className="font-medium">{card.title}</div>
                          {card.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                              {card.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {getColumnTitle(card.columnId)}
                      </div>
                    </div>
                    <div className="flex mt-2 text-xs">
                      {card.assignee && (
                        <div className="text-gray-600 dark:text-gray-300 mr-4">
                          Przypisana: {card.assignee}
                        </div>
                      )}
                      {card.dueDate && (
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(card.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="text-gray-500 dark:text-gray-400 mb-2">
                Nie znaleziono pasujących kart
              </div>
              <div className="text-sm text-gray-400 dark:text-gray-500">
                Spróbuj zmienić kryteria wyszukiwania
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 border-t dark:border-gray-700 text-sm text-right text-gray-500 dark:text-gray-400">
          Łącznie {filteredCards.length} z {cards.length} kart
        </div>
      </div>
    </div>
  );
};

export default CardListModal;
