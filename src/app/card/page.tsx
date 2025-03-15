'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useKanbanStore } from '@/store/use-kanban-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import NavigationControls from '@/components/kanban/navigation-controls';
import CardListModal from '@/components/kanban/card-list-modal';
import CardSearchModal from '@/components/kanban/card-search-modal';
import Navbar from '@/components/layout/navbar';
import { CardType } from '@/lib/types';
import { AlertCircle, CheckCircle, Lightbulb, Clock, User, AlertTriangle, Edit, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CardPage() {
  const searchParams = useSearchParams();
  const cardId = searchParams.get('id');
  const boardId = searchParams.get('boardId');
  
  const [showCardListModal, setShowCardListModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { getBoard, findCardById, getCardsInBoard, getColumnById, updateCard } = useKanbanStore();
  const { departments } = useDepartmentsStore();
  
  // Pobierz dane karty i tablicy
  const board = boardId ? getBoard(boardId) : null;
  const card = cardId ? findCardById(cardId) : null;
  const column = card && card.columnId ? getColumnById(boardId, card.columnId) : null;
  
  // Pobierz wszystkie karty na tablicy dla nawigacji
  const allCardsInBoard = boardId ? getCardsInBoard(boardId) : [];
  
  // Znajdź dział dla karty
  const department = card?.departmentId 
    ? departments.find(dept => dept.id === card.departmentId)
    : null;
    
  // Funkcja do przejścia do innej karty
  const navigateToCard = (selectedCardId: string) => {
    window.location.href = `/card?id=${selectedCardId}&boardId=${boardId}`;
  };
  
  // Określ typ karty na podstawie tablicy
  const getCardCategory = (): 'task' | 'problem' | 'idea' | undefined => {
    if (!boardId) return undefined;
    
    if (boardId.includes('tasks')) return 'task';
    if (boardId.includes('problems')) return 'problem';
    if (boardId.includes('ideas')) return 'idea';
    
    return undefined;
  };
  
  // Pobierz ikonę dla typu karty
  const getCategoryIcon = () => {
    const category = getCardCategory();
    
    switch (category) {
      case 'task':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'problem':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'idea':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };
  
  // Jeśli karta lub tablica nie zostały znalezione
  if (!card || !board) {
    return (
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Karta nie została znaleziona</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Nie mogliśmy znaleźć karty o podanym identyfikatorze. Może została usunięta lub użyto nieprawidłowego łącza.
          </p>
          <Link 
            href={boardId ? `/board?boardId=${boardId}` : '/'}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {boardId ? 'Powrót do tablicy' : 'Powrót do strony głównej'}
          </Link>
        </div>
      </div>
    );
  }
  
  // Wszystkie kolumny na tablicy dla modalu listy kart
  const allColumns = board.columns.map(col => ({
    id: col.id,
    title: col.title
  }));
  
  return (
    <div>
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-4">
        {/* Kontrolki nawigacji */}
        <div className="mb-4">
          <NavigationControls 
            boardId={boardId}
            cards={allCardsInBoard}
            currentCardId={cardId}
            onCardSelect={navigateToCard}
            onOpenCardList={() => setShowCardListModal(true)}
            onOpenSearch={() => setShowSearchModal(true)}
          />
        </div>
        
        {/* Widok karty */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Nagłówek karty */}
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div className="flex items-start">
                <div className="mr-3">
                  {getCategoryIcon()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">{card.title}</h1>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-x-4 gap-y-2">
                    {column && (
                      <div className="flex items-center">
                        Status: <span className="font-medium ml-1">{column.title}</span>
                      </div>
                    )}
                    
                    {department && (
                      <div className="flex items-center">
                        Dział: <span className="font-medium ml-1">{department.name}</span>
                      </div>
                    )}
                    
                    {card.assignee && (
                      <div className="flex items-center">
                        <User className="h-3.5 w-3.5 mr-1" /> {card.assignee}
                      </div>
                    )}
                    
                    {card.dueDate && (
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" /> {new Date(card.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    
                    {card.priority && (
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        card.priority === 'high' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : card.priority === 'medium'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {card.priority === 'high' ? 'Wysoki' : card.priority === 'medium' ? 'Średni' : 'Niski'} priorytet
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Edytuj kartę"
              >
                <Edit className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Treść karty */}
          <div className="p-6">
            {card.description ? (
              <div className="prose dark:prose-invert max-w-none">
                {card.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 italic">
                Brak opisu
              </div>
            )}
          </div>
          
          {/* Dolna sekcja - komentarze, załączniki itp. */}
          <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              ID karty: {card.id} | Ostatnia aktualizacja: {card.updatedAt ? new Date(card.updatedAt).toLocaleString() : 'Brak danych'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal listy kart */}
      <CardListModal
        isOpen={showCardListModal}
        onClose={() => setShowCardListModal(false)}
        cards={allCardsInBoard}
        columns={allColumns}
        onCardSelect={navigateToCard}
      />
      
      {/* Modal wyszukiwania */}
      <CardSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        cards={allCardsInBoard.map(cardItem => ({
          ...cardItem,
          category: getCardCategory()
        }))}
        onCardSelect={navigateToCard}
      />
    </div>
  );
}
