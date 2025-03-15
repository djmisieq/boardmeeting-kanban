import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ArrowRight, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { CardType } from '@/lib/types';

interface CardSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardType[];
  onCardSelect: (cardId: string) => void;
  categoryIcons?: Record<string, React.ReactNode>;
}

const CardSearchModal: React.FC<CardSearchModalProps> = ({
  isOpen,
  onClose,
  cards,
  onCardSelect,
  categoryIcons = {
    task: <CheckCircle className="h-4 w-4 text-blue-500" />,
    problem: <AlertCircle className="h-4 w-4 text-amber-500" />,
    idea: <Lightbulb className="h-4 w-4 text-yellow-500" />,
  }
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCards, setFilteredCards] = useState<CardType[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  
  // Resetuj stan po otwarciu modalu
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setFilteredCards([]);
      setSelectedIndex(0);
      // Ustaw fokus na polu wyszukiwania
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Filtruj karty na podstawie wyszukiwanego tekstu
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCards([]);
      setSelectedIndex(0);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const results = cards.filter(card => 
      card.title.toLowerCase().includes(query) || 
      (card.description || '').toLowerCase().includes(query) ||
      (card.assignee || '').toLowerCase().includes(query)
    );
    
    setFilteredCards(results);
    setSelectedIndex(0);
  }, [searchQuery, cards]);
  
  // Przewiń do zaznaczonego elementu
  useEffect(() => {
    const selectedElement = document.getElementById(`search-result-${selectedIndex}`);
    if (selectedElement && resultsContainerRef.current) {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);
  
  // Obsługa nawigacji klawiaturą
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!filteredCards.length) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCards.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedCard = filteredCards[selectedIndex];
      if (selectedCard) {
        onCardSelect(selectedCard.id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-4 relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Wyszukaj tytuł, opis lub osobę przypisaną..."
              className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg dark:bg-gray-700 dark:border-gray-600"
              autoFocus
            />
            <button
              onClick={onClose}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          </div>
        </div>
        
        {filteredCards.length > 0 && (
          <div 
            ref={resultsContainerRef}
            className="border-t dark:border-gray-700 max-h-80 overflow-y-auto"
          >
            <ul>
              {filteredCards.map((card, index) => (
                <li 
                  id={`search-result-${index}`}
                  key={card.id}
                  className={`border-b dark:border-gray-700 last:border-b-0 ${
                    index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <button
                    onClick={() => {
                      onCardSelect(card.id);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        <span className="mt-0.5">
                          {categoryIcons[card.category as keyof typeof categoryIcons] || null}
                        </span>
                        <div>
                          <div className="font-medium">{card.title}</div>
                          {card.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {card.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <ArrowRight className={`h-4 w-4 mt-1 ${
                        index === selectedIndex ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {searchQuery && filteredCards.length === 0 && (
          <div className="border-t dark:border-gray-700 p-4 text-center text-gray-500 dark:text-gray-400">
            Nie znaleziono pasujących kart
          </div>
        )}
        
        <div className="p-3 border-t dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between">
            <div>
              <span className="font-medium">Enter</span> aby wybrać  •  
              <span className="font-medium ml-2">↑↓</span> do nawigacji  •  
              <span className="font-medium ml-2">Esc</span> aby zamknąć
            </div>
            <div>
              {filteredCards.length} wyników
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardSearchModal;
