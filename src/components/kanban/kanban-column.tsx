import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './kanban-card';
import { ColumnType, CardType } from '@/lib/types';
import { useKanbanStore } from '@/store/use-kanban-store';
import { Plus } from 'lucide-react';
import EnhanceProjectConnections from './enhance-project-connections';

interface KanbanColumnProps {
  id: string; // Column ID
  title: string; // Column title
  boardId?: string; // Optional board ID
  column?: ColumnType; // Optional full column object
  children?: React.ReactNode; // Child components (cards)
  onAddCard: (columnId: string) => void;
  showProjectConnections?: boolean;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  id,
  title,
  boardId = '', 
  column,
  children,
  onAddCard,
  showProjectConnections = false
}) => {
  const { updateCard, deleteCard } = useKanbanStore();
  
  const { setNodeRef } = useDroppable({
    id: id,
    data: {
      type: 'column',
      boardId,
      columnId: id
    }
  });
  
  // Determine a background color based on column type/position
  const getColumnColor = () => {
    const colId = id.toLowerCase();
    if (colId.includes('to-do') || colId.includes('new') || colId.includes('idea')) {
      return 'bg-gray-50 dark:bg-gray-700/50';
    } else if (colId.includes('progress') || colId.includes('analysis') || colId.includes('approved')) {
      return 'bg-blue-50 dark:bg-blue-900/20';
    } else if (colId.includes('done') || colId.includes('resolved') || colId.includes('completed')) {
      return 'bg-green-50 dark:bg-green-900/20';
    }
    return 'bg-gray-50 dark:bg-gray-700/50';
  };
  
  return (
    <div 
      className={`flex flex-col rounded-lg border dark:border-gray-700 h-full min-h-[500px] max-h-[70vh] ${getColumnColor()}`}
    >
      {/* Column Header */}
      <div className="p-3 border-b dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h3 className="font-medium flex items-center">
            <span className="mr-2">{title}</span>
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {column?.cards?.length || React.Children.count(children) || 0}
            </span>
          </h3>
          <button
            onClick={() => onAddCard(id)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            title="Dodaj kartę"
          >
            <Plus className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 overflow-y-auto space-y-2"
      >
        {column?.cards ? (
          <SortableContext
            items={column.cards.map(card => card.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.cards.map(card => (
              <div key={card.id}>
                {showProjectConnections ? (
                  <EnhanceProjectConnections card={card} columnId={id}>
                    <KanbanCard
                      id={card.id}
                      title={card.title}
                      description={card.description}
                      assignee={card.assignee}
                      dueDate={card.dueDate}
                      priority={card.priority}
                      boardId={boardId}
                      columnId={id}
                      onUpdate={(updates) => updateCard(boardId, id, card.id, updates)}
                      onDelete={() => deleteCard(boardId, id, card.id)}
                    />
                  </EnhanceProjectConnections>
                ) : (
                  <KanbanCard
                    id={card.id}
                    title={card.title}
                    description={card.description}
                    assignee={card.assignee}
                    dueDate={card.dueDate}
                    priority={card.priority}
                    boardId={boardId}
                    columnId={id}
                    onUpdate={(updates) => updateCard(boardId, id, card.id, updates)}
                    onDelete={() => deleteCard(boardId, id, card.id)}
                  />
                )}
              </div>
            ))}
          </SortableContext>
        ) : (
          // If no column object is provided, render children directly
          children
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
