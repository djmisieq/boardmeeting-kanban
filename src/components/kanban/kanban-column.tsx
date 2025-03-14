import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, MoreVertical, Edit, Trash } from 'lucide-react';
import { CardType } from '@/lib/types';
import CardDialog from './card-dialog';
import { useDepartmentsStore } from '@/store/use-departments-store';

interface KanbanColumnProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onAddCard: (card: CardType) => void;
  onDeleteColumn?: () => void;
  onEditColumn?: (newTitle: string) => void;
  allowEditingColumn?: boolean;
}

const KanbanColumn = ({ 
  id, 
  title, 
  children, 
  onAddCard,
  onDeleteColumn,
  onEditColumn,
  allowEditingColumn = false 
}: KanbanColumnProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(title);
  
  const { selectedDepartmentId } = useDepartmentsStore();
  
  // Enhanced with active/inactive visual state
  const { setNodeRef, isOver } = useDroppable({ 
    id,
    data: {
      type: 'column',
      accepts: ['card']
    }
  });

  const handleSaveCard = (card: Omit<CardType, 'id'>) => {
    onAddCard({
      ...card,
      id: `card-${Date.now()}`, // Simple ID generation
      departmentId: selectedDepartmentId || undefined,
      createdAt: new Date().toISOString(),
    });
    setShowDialog(false);
  };
  
  const handleEditColumnTitle = () => {
    setShowColumnMenu(false);
    setEditingTitle(true);
  };
  
  const handleDeleteColumn = () => {
    setShowColumnMenu(false);
    if (window.confirm('Are you sure you want to delete this column? All cards in this column will be deleted.')) {
      onDeleteColumn?.();
    }
  };
  
  const handleTitleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (columnTitle.trim() && onEditColumn) {
      onEditColumn(columnTitle);
    }
    setEditingTitle(false);
  };
  
  // Count cards by priority for column header stats
  const cardCount = React.Children.count(children);

  return (
    <>
      <div
        ref={setNodeRef}
        className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col min-h-[60vh] max-h-[80vh] overflow-hidden 
          ${isOver ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : ''}`}
      >
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-750 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center space-x-2 flex-1">
            {editingTitle ? (
              <form onSubmit={handleTitleChange} className="flex-1">
                <input
                  type="text"
                  value={columnTitle}
                  onChange={(e) => setColumnTitle(e.target.value)}
                  className="w-full p-1 text-sm border rounded"
                  autoFocus
                  onBlur={handleTitleChange}
                />
              </form>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="font-semibold truncate flex items-center">
                  {title}
                  <span className="ml-2 text-xs bg-gray-300 dark:bg-gray-600 rounded-full px-2 py-0.5">
                    {cardCount}
                  </span>
                </div>
                
                {allowEditingColumn && (
                  <div className="relative">
                    <button 
                      onClick={() => setShowColumnMenu(!showColumnMenu)}
                      className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {showColumnMenu && (
                      <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 z-10">
                        <button 
                          onClick={handleEditColumnTitle}
                          className="flex items-center w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit title
                        </button>
                        <button 
                          onClick={handleDeleteColumn}
                          className="flex items-center w-full px-3 py-1.5 text-sm text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete column
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className={`flex-1 overflow-y-auto p-2 space-y-3 ${isOver ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 transition-colors duration-200' : ''}`}>
          {children}
          
          <button 
            onClick={() => setShowDialog(true)}
            className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-650 text-gray-500 dark:text-gray-400 flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add card
          </button>
        </div>
      </div>
      
      <CardDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSave={handleSaveCard}
        title={`Add Card to ${title}`}
        currentUser="Admin"
        departmentId={selectedDepartmentId || "default"}
      />
    </>
  );
};

export default KanbanColumn;