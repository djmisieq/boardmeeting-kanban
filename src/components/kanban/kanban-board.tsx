import { useState } from 'react';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import KanbanColumn from './kanban-column';
import KanbanCard from './kanban-card';

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
  title: string;
  initialColumns: ColumnType[];
};

const KanbanBoard = ({ title, initialColumns }: KanbanBoardProps) => {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);

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
      // Find the card in the source column
      const cardIndex = sourceColumn.cards.findIndex(card => card.id === activeCardId);
      const [movedCard] = sourceColumn.cards.splice(cardIndex, 1);
      
      // Add the card to the destination column
      destColumn.cards.push(movedCard);
      
      // Update the columns
      setColumns([...columns]);
    }
  };

  const addCard = (columnId: string, card: CardType) => {
    const newColumns = columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          cards: [...column.cards, card]
        };
      }
      return column;
    });
    
    setColumns(newColumns);
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(column => (
            <KanbanColumn 
              key={column.id} 
              id={column.id} 
              title={column.title}
              onAddCard={(card) => addCard(column.id, card)}
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