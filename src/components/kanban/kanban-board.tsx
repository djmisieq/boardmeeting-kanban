import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent, 
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './kanban-column';
import KanbanCard from './kanban-card';
import CardDialog from './card-dialog';
import { useKanbanStore } from '@/store/use-kanban-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useProjectsStore } from '@/store/use-projects-store';
import { CardType } from '@/lib/types';
import { createPortal } from 'react-dom';
import { AlertCircle } from 'lucide-react';
import { getProjectStatusFromColumn, extractColumnType } from '@/lib/status-mapping';

interface KanbanBoardProps {
  boardId: string;
  showProjectConnections?: boolean;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  boardId,
  showProjectConnections = false
}) => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogColumnId, setDialogColumnId] = useState<string | null>(null);
  const [editCardData, setEditCardData] = useState<CardType | null>(null);
  
  const { 
    boards, 
    getBoard, 
    createCard, 
    moveCardToColumn, 
    syncCardOrder,
    findCardById 
  } = useKanbanStore();
  
  const { selectedDepartmentId } = useDepartmentsStore();
  
  const { syncProjectWithCard } = useProjectsStore();
  
  // Board data
  const board = getBoard(boardId);
  
  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Find the active card for the drag overlay
  const activeCard = activeCardId 
    ? findCardById(activeCardId)
    : null;
  
  // Handler for adding a new card
  const handleAddCard = (columnId: string) => {
    setDialogColumnId(columnId);
    setEditCardData(null);
    setShowDialog(true);
  };
  
  // Handler for saving a card
  const handleSaveCard = (cardData: Omit<CardType, 'id'>) => {
    if (dialogColumnId) {
      createCard(boardId, dialogColumnId, cardData);
    }
    setShowDialog(false);
  };
  
  // DnD event handlers
  const handleDragStart = (event: any) => {
    const { id, data } = event.active;
    
    if (data.current?.type === 'card') {
      setActiveCardId(id);
    }
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    // Skip if nothing has changed
    if (activeId === overId) return;
    
    const activeData = active.data.current;
    const overData = over.data.current;
    
    // Only handle card over column
    if (
      activeData?.type === 'card' && 
      overData?.type === 'column' && 
      activeData?.boardId === overData?.boardId
    ) {
      // Move card to new column
      moveCardToColumn(
        activeData.boardId,
        activeData.columnId,
        activeId as string,
        overData.columnId
      );
      
      // Synchronize with projects if the card is connected to projects
      if (showProjectConnections) {
        syncProjectWithCard(activeId as string, overData.columnId);
      }
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCardId(null);
    
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    const activeData = active.data.current;
    const overData = over.data.current;
    
    // Handle card over card (reordering within same column)
    if (
      activeData?.type === 'card' && 
      overData?.type === 'card' && 
      activeData?.columnId === overData?.columnId
    ) {
      // Find the column
      const column = board?.columns.find(col => col.id === activeData.columnId);
      
      if (column) {
        // Get card indices
        const oldIndex = column.cards.findIndex(card => card.id === activeId);
        const newIndex = column.cards.findIndex(card => card.id === overId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          // Create new order of cards
          const newOrder = arrayMove(column.cards, oldIndex, newIndex);
          
          // Update the store
          syncCardOrder(
            activeData.boardId, 
            activeData.columnId, 
            newOrder.map(card => card.id)
          );
        }
      }
    }
  };
  
  // If board not found
  if (!board) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Tablica nie znaleziona</h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-md">
          Nie znaleziono tablicy o ID: {boardId}. Wybierz inną tablicę lub utwórz nową.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {board.columns.map(column => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              boardId={boardId}
              column={column}
              onAddCard={handleAddCard}
              showProjectConnections={showProjectConnections}
            />
          ))}
        </div>
        
        {/* Drag overlay */}
        {typeof window !== 'undefined' && activeCardId && activeCard && createPortal(
          <DragOverlay>
            <KanbanCard
              id={activeCardId}
              title={activeCard.title}
              description={activeCard.description}
              assignee={activeCard.assignee}
              dueDate={activeCard.dueDate}
              priority={activeCard.priority}
              isDragging={true}
            />
          </DragOverlay>,
          document.body
        )}
      </DndContext>
      
      {/* Card dialog */}
      <CardDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSave={handleSaveCard}
        card={editCardData}
        title={editCardData ? 'Edytuj kartę' : 'Dodaj nową kartę'}
        currentUser="Admin"
        departmentId={selectedDepartmentId || 'default'}
      />
    </>
  );
};

export default KanbanBoard;
