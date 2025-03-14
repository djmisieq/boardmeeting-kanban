import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';

import KanbanColumn from './kanban-column';
import KanbanCard from './kanban-card';
import { useKanbanStore } from '@/store/use-kanban-store';
import { ColumnType, CardType } from '@/lib/types';

type KanbanBoardProps = {
  boardId: string;
  title: string;
  initialColumns: ColumnType[];
  departmentId?: string;
  searchFilter?: string;
  assigneeFilter?: string;
  priorityFilter?: string;
};

const KanbanBoard = ({ 
  boardId, 
  title, 
  initialColumns, 
  departmentId,
  searchFilter,
  assigneeFilter,
  priorityFilter
}: KanbanBoardProps) => {
  const { 
    moveCard, 
    addCard: storeAddCard,
    updateCard,
    deleteCard,
    getBoard
  } = useKanbanStore();
  
  // Get columns from the store if available
  const board = getBoard(boardId);
  const storeColumns = board?.columns || initialColumns;
  
  // Apply filters if provided
  const [filteredColumns, setFilteredColumns] = useState<ColumnType[]>(storeColumns);
  
  // Filter columns when filters change
  useEffect(() => {
    if (!storeColumns) return;
    
    // If no filters are applied, show all columns with all cards
    if (!searchFilter && !assigneeFilter && !priorityFilter) {
      setFilteredColumns(storeColumns);
      return;
    }
    
    // Apply filters to each column
    const filtered = storeColumns.map(column => {
      const filteredCards = column.cards.filter(card => {
        // Search filter
        if (searchFilter && !card.title.toLowerCase().includes(searchFilter.toLowerCase()) &&
            !card.description?.toLowerCase().includes(searchFilter.toLowerCase())) {
          return false;
        }
        
        // Assignee filter
        if (assigneeFilter && card.assignee !== assigneeFilter) {
          return false;
        }
        
        // Priority filter
        if (priorityFilter && card.priority !== priorityFilter) {
          return false;
        }
        
        return true;
      });
      
      return {
        ...column,
        cards: filteredCards
      };
    });
    
    setFilteredColumns(filtered);
  }, [storeColumns, searchFilter, assigneeFilter, priorityFilter]);

  // Update filtered columns when store columns change
  useEffect(() => {
    setFilteredColumns(storeColumns);
  }, [storeColumns]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeCardId = active.id as string;
    const overColumnId = over.id as string;
    
    // Find the source column
    const sourceColumn = storeColumns.find(column => 
      column.cards.some(card => card.id === activeCardId)
    );
    
    if (!sourceColumn) return;
    
    // Find the destination column
    const destColumn = storeColumns.find(column => column.id === overColumnId);
    
    if (!destColumn) return;
    
    // If the card is dropped in a different column
    if (sourceColumn.id !== destColumn.id) {
      moveCard(boardId, activeCardId, sourceColumn.id, destColumn.id);
    }
  };

  const handleAddCard = (columnId: string, card: Omit<CardType, 'id'>) => {
    storeAddCard(boardId, columnId, {
      ...card,
      departmentId: departmentId // Add department ID to the card
    });
  };
  
  const handleUpdateCard = (columnId: string, cardId: string, updates: Partial<CardType>) => {
    updateCard(boardId, columnId, cardId, updates);
  };
  
  const handleDeleteCard = (columnId: string, cardId: string) => {
    deleteCard(boardId, columnId, cardId);
  };
  
  const handleAddColumn = () => {
    // This would be implemented in a real application
    alert('Adding new columns is not available in the demo');
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        {title && <h1 className="text-2xl font-bold">{title}</h1>}
        
        <button 
          onClick={handleAddColumn}
          className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Column
        </button>
      </div>
      
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredColumns.map(column => (
            <KanbanColumn 
              key={column.id} 
              id={column.id} 
              title={column.title}
              onAddCard={(card) => handleAddCard(column.id, card)}
            >
              {column.cards.map(card => (
                <KanbanCard 
                  key={card.id} 
                  id={card.id}
                  title={card.title} 
                  description={card.description}
                  assignee={card.assignee}
                  dueDate={card.dueDate}
                  priority={card.priority}
                  boardId={boardId}
                  columnId={column.id}
                  onUpdate={(updates) => handleUpdateCard(column.id, card.id, updates)}
                  onDelete={() => handleDeleteCard(column.id, card.id)}
                />
              ))}
            </KanbanColumn>
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;