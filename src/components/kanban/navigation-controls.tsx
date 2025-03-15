import React from 'react';
import { ChevronLeft, ChevronRight, Menu, List, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CardType } from '@/lib/types';

interface NavigationControlsProps {
  boardId: string;
  cards: CardType[];
  currentCardId?: string;
  onCardSelect: (cardId: string) => void;
  onOpenCardList: () => void;
  onOpenSearch: () => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  boardId,
  cards,
  currentCardId,
  onCardSelect,
  onOpenCardList,
  onOpenSearch
}) => {
  const router = useRouter();
  
  // Determine index of current card
  const currentIndex = currentCardId ? cards.findIndex(card => card.id === currentCardId) : -1;
  
  // Go to previous card
  const goToPreviousCard = () => {
    if (currentIndex > 0) {
      onCardSelect(cards[currentIndex - 1].id);
    }
  };
  
  // Go to next card
  const goToNextCard = () => {
    if (currentIndex >= 0 && currentIndex < cards.length - 1) {
      onCardSelect(cards[currentIndex + 1].id);
    }
  };
  
  // Go back to board
  const goBackToBoard = () => {
    router.push(`/board?boardId=${boardId}`);
  };

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm border dark:border-gray-700">
      <div className="flex space-x-2">
        <button
          onClick={goBackToBoard}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Powrót do tablicy"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <div className="h-6 border-r border-gray-300 dark:border-gray-600 mx-1"></div>
        
        <button
          onClick={goToPreviousCard}
          disabled={currentIndex <= 0}
          className={`p-1.5 rounded-md ${
            currentIndex > 0
              ? 'hover:bg-gray-100 dark:hover:bg-gray-700'
              : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
          title="Poprzednia karta"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <div className="flex items-center px-2 text-sm text-gray-500 dark:text-gray-400">
          {currentIndex >= 0 ? currentIndex + 1 : 0} / {cards.length}
        </div>
        
        <button
          onClick={goToNextCard}
          disabled={currentIndex < 0 || currentIndex >= cards.length - 1}
          className={`p-1.5 rounded-md ${
            currentIndex >= 0 && currentIndex < cards.length - 1
              ? 'hover:bg-gray-100 dark:hover:bg-gray-700'
              : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
          title="Następna karta"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex space-x-1">
        <button
          onClick={onOpenSearch}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Wyszukaj kartę"
        >
          <Search className="h-5 w-5" />
        </button>
        
        <button
          onClick={onOpenCardList}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Lista kart"
        >
          <List className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default NavigationControls;
