import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import KanbanColumn from './kanban-column';
import KanbanCard from './kanban-card';
import { useKanbanStore } from '@/store/use-kanban-store';

export type CardType = {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
};

export type ColumnType = {
  id: string;
  title: string;
  cards: CardType[];
};

type KanbanBoardProps = {
  boardId: string;
  title: string;
  initialColumns: ColumnType[];
};

const KanbanBoard = ({ boardId, title, initialColumns }: KanbanBoardProps) => {
  const { 
    initializeBoard, 
    moveCard, 
    addCard: storeAddCard 
  } = useKanbanStore();
  
  const columns = useKanbanStore(state => 
    state.boards[boardId]?.columns || initialColumns
  );

  useEffect(() => {
    initializeBoard(boardId, initialColumns);
  }, [boardId, initialColumns, initializeBoard]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeCardId = active.id as string;
    const overColumnId = over.id as string;
    
    // Find the source column
    const sourceColumn = columns.find(column => 
      column.cards.some(card => card.id === activeCardId)
    );
    
    if (!sourceColumn) return;
    
    // Find the destination column
    const destColumn = columns.find(column => column.id === overColumnId);
    
    if (!destColumn) return;
    
    // If the card is dropped in a different column
    if (sourceColumn.id !== destColumn.id) {
      moveCard(boardId, activeCardId, sourceColumn.id, destColumn.id);
    }
  };

  const handleAddCard = (columnId: string, card: CardType) => {
    storeAddCard(boardId, columnId, card);
  };
  
  return (
    <div className="p-4">
      {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
      
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {columns.map(column => (
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