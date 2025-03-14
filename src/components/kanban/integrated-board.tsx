import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  closestCorners, 
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { CheckSquare, AlertCircle, Lightbulb, Filter, X, Users } from 'lucide-react';
import KanbanColumn from './kanban-column';
import KanbanCard from './kanban-card';
import { useKanbanStore } from '@/store/use-kanban-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { ColumnType, CardType } from '@/lib/types';

// Typ karty z dodatkowym polem dla kategorii
interface EnhancedCardType extends CardType {
  category?: 'task' | 'problem' | 'idea';
}

// Typy filtrów
interface Filters {
  category?: 'task' | 'problem' | 'idea' | 'all';
  department?: string;
  search?: string;
  assignee?: string;
}

const IntegratedBoard = () => {
  // Stan dla filtrów
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    department: 'all'
  });
  
  // Pobieranie magazynów
  const { 
    getBoard,
    moveCard, 
    addCard,
    updateCard,
    deleteCard
  } = useKanbanStore();
  
  const { departments, selectedDepartmentId, setSelectedDepartment } = useDepartmentsStore();
  
  // Pobieranie tablic dla wszystkich kategorii
  const tasksBoard = getBoard(`${selectedDepartmentId || 'default'}-tasks`);
  const problemsBoard = getBoard(`${selectedDepartmentId || 'default'}-problems`);
  const ideasBoard = getBoard(`${selectedDepartmentId || 'default'}-ideas`);
  
  // Scalone kolumny ze wszystkich tablic
  const [mergedColumns, setMergedColumns] = useState<ColumnType[]>([]);
  
  // Konfiguracja czujników dla drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Zapobiega przypadkowym przeciągnięciom
      },
    })
  );
  
  // Merge columns from all boards and add category identifiers to cards
  useEffect(() => {
    const allColumns: ColumnType[] = [];
    
    // Dodaj kolumny z tablicy zadań
    if (tasksBoard) {
      const enhancedColumns = tasksBoard.columns.map(column => ({
        ...column,
        cards: column.cards.map(card => ({
          ...card,
          category: 'task' as 'task'
        }))
      }));
      allColumns.push(...enhancedColumns);
    }
    
    // Dodaj kolumny z tablicy problemów
    if (problemsBoard) {
      const enhancedColumns = problemsBoard.columns.map(column => ({
        ...column,
        cards: column.cards.map(card => ({
          ...card,
          category: 'problem' as 'problem'
        }))
      }));
      allColumns.push(...enhancedColumns);
    }
    
    // Dodaj kolumny z tablicy pomysłów
    if (ideasBoard) {
      const enhancedColumns = ideasBoard.columns.map(column => ({
        ...column,
        cards: column.cards.map(card => ({
          ...card,
          category: 'idea' as 'idea'
        }))
      }));
      allColumns.push(...enhancedColumns);
    }
    
    setMergedColumns(allColumns);
  }, [tasksBoard, problemsBoard, ideasBoard]);
  
  // Filtrowanie kart
  const filteredColumns = mergedColumns.map(column => {
    let filteredCards = [...column.cards];
    
    // Filtruj według kategorii
    if (filters.category && filters.category !== 'all') {
      filteredCards = filteredCards.filter(card => 
        (card as EnhancedCardType).category === filters.category
      );
    }
    
    // Filtruj według działu
    if (filters.department && filters.department !== 'all') {
      filteredCards = filteredCards.filter(card => 
        card.departmentId === filters.department
      );
    }
    
    // Filtruj według wyszukiwania
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCards = filteredCards.filter(card => 
        card.title.toLowerCase().includes(searchLower) ||
        card.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtruj według przypisanej osoby
    if (filters.assignee) {
      filteredCards = filteredCards.filter(card => 
        card.assignee === filters.assignee
      );
    }
    
    return {
      ...column,
      cards: filteredCards
    };
  });
  
  // Obsługa zakończenia przeciągania
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeCardId = active.id as string;
    const overColumnId = over.id as string;
    
    // Znajdź kolumnę źródłową
    const sourceColumn = mergedColumns.find(column => 
      column.cards.some(card => card.id === activeCardId)
    );
    
    if (!sourceColumn) return;
    
    // Znajdź kolumnę docelową
    const destColumn = mergedColumns.find(column => column.id === overColumnId);
    
    if (!destColumn) return;
    
    // Znajdź kartę
    const card = sourceColumn.cards.find(card => card.id === activeCardId) as EnhancedCardType;
    if (!card) return;
    
    // Określ, do której tablicy należy karta na podstawie kategorii
    let boardId;
    switch (card.category) {
      case 'task':
        boardId = `${selectedDepartmentId || 'default'}-tasks`;
        break;
      case 'problem':
        boardId = `${selectedDepartmentId || 'default'}-problems`;
        break;
      case 'idea':
        boardId = `${selectedDepartmentId || 'default'}-ideas`;
        break;
      default:
        return;
    }
    
    // Przenieś kartę
    moveCard(boardId, activeCardId, sourceColumn.id, destColumn.id);
  };
  
  // Obsługa zmiany wybranego działu
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptId = e.target.value;
    setSelectedDepartment(deptId === 'all' ? null : deptId);
    setFilters({ ...filters, department: deptId });
  };
  
  // Obsługa dodawania karty
  const handleAddCard = (columnId: string, card: Omit<CardType, 'id'>, category: 'task' | 'problem' | 'idea') => {
    const boardId = `${selectedDepartmentId || 'default'}-${category}s`;
    addCard(boardId, columnId, {
      ...card,
      departmentId: selectedDepartmentId || undefined
    });
  };
  
  // Obsługa aktualizacji karty
  const handleUpdateCard = (columnId: string, cardId: string, updates: Partial<CardType>, category: 'task' | 'problem' | 'idea') => {
    const boardId = `${selectedDepartmentId || 'default'}-${category}s`;
    updateCard(boardId, columnId, cardId, updates);
  };
  
  // Obsługa usuwania karty
  const handleDeleteCard = (columnId: string, cardId: string, category: 'task' | 'problem' | 'idea') => {
    const boardId = `${selectedDepartmentId || 'default'}-${category}s`;
    deleteCard(boardId, columnId, cardId);
  };
  
  // Uzyskaj ikonę kategorii
  const getCategoryIcon = (category?: 'task' | 'problem' | 'idea') => {
    switch (category) {
      case 'task':
        return <CheckSquare className="h-3 w-3 text-blue-500" />;
      case 'problem':
        return <AlertCircle className="h-3 w-3 text-amber-500" />;
      case 'idea':
        return <Lightbulb className="h-3 w-3 text-yellow-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="p-4">
      {/* Filtry i kontrolki */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
        <h1 className="text-xl font-bold mb-4">Tablica Kanban</h1>
        
        <div className="flex flex-wrap gap-4 items-center">
          {/* Wybór działu */}
          <div className="flex-grow min-w-[200px]">
            <label htmlFor="department" className="block text-sm font-medium mb-1">
              <Users className="h-4 w-4 inline mr-1" /> Dział
            </label>
            <select
              id="department"
              value={selectedDepartmentId || 'all'}
              onChange={handleDepartmentChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">Wszystkie działy</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          {/* Filtry kategorii */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <Filter className="h-4 w-4 inline mr-1" /> Kategorie
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilters({ ...filters, category: 'all' })}
                className={`px-3 py-1 rounded-md text-sm ${
                  filters.category === 'all' 
                    ? 'bg-gray-200 dark:bg-gray-700 font-medium' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Wszystkie
              </button>
              <button
                onClick={() => setFilters({ ...filters, category: 'task' })}
                className={`px-3 py-1 rounded-md text-sm flex items-center ${
                  filters.category === 'task' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 font-medium' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <CheckSquare className="h-3 w-3 mr-1" /> Zadania
              </button>
              <button
                onClick={() => setFilters({ ...filters, category: 'problem' })}
                className={`px-3 py-1 rounded-md text-sm flex items-center ${
                  filters.category === 'problem' 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 font-medium' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <AlertCircle className="h-3 w-3 mr-1" /> Problemy
              </button>
              <button
                onClick={() => setFilters({ ...filters, category: 'idea' })}
                className={`px-3 py-1 rounded-md text-sm flex items-center ${
                  filters.category === 'idea' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 font-medium' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Lightbulb className="h-3 w-3 mr-1" /> Usprawnienia
              </button>
            </div>
          </div>
          
          {/* Wyszukiwanie */}
          <div className="flex-grow min-w-[200px]">
            <label htmlFor="search" className="block text-sm font-medium mb-1">Szukaj</label>
            <div className="relative">
              <input
                id="search"
                type="text"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Szukaj..."
                className="w-full p-2 pr-8 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
              {filters.search && (
                <button 
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="absolute right-2 top-2.5"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tablica Kanban */}
      <DndContext 
        sensors={sensors}
        onDragEnd={handleDragEnd} 
        collisionDetection={closestCorners}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredColumns.map(column => (
            <KanbanColumn 
              key={column.id} 
              id={column.id} 
              title={column.title}
              onAddCard={(card) => {
                // Domyślnie dodaj jako zadanie, chyba że został wybrany inny filtr kategorii
                const category = filters.category === 'all' ? 'task' : filters.category || 'task';
                handleAddCard(column.id, card, category);
              }}
            >
              {column.cards.map(card => {
                const enhancedCard = card as EnhancedCardType;
                return (
                  <KanbanCard 
                    key={card.id} 
                    id={card.id}
                    title={card.title} 
                    description={card.description}
                    assignee={card.assignee}
                    dueDate={card.dueDate}
                    priority={card.priority}
                    boardId={`${selectedDepartmentId || 'default'}-${enhancedCard.category}s`}
                    columnId={column.id}
                    categoryIcon={getCategoryIcon(enhancedCard.category)}
                    onUpdate={(updates) => handleUpdateCard(
                      column.id, 
                      card.id, 
                      updates, 
                      enhancedCard.category || 'task'
                    )}
                    onDelete={() => handleDeleteCard(
                      column.id, 
                      card.id, 
                      enhancedCard.category || 'task'
                    )}
                  />
                );
              })}
            </KanbanColumn>
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default IntegratedBoard;