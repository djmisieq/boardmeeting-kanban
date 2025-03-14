import { create } from 'zustand';
import { ColumnType, CardType } from '@/components/kanban/kanban-board';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

interface KanbanState {
  boards: {
    [key: string]: {
      columns: ColumnType[];
    };
  };
  
  // Actions
  initializeBoard: (boardId: string, initialColumns: ColumnType[]) => void;
  moveCard: (boardId: string, cardId: string, sourceColumnId: string, destinationColumnId: string) => void;
  addCard: (boardId: string, columnId: string, card: Omit<CardType, 'id'>) => void;
  updateCard: (boardId: string, columnId: string, cardId: string, updates: Partial<CardType>) => void;
  deleteCard: (boardId: string, columnId: string, cardId: string) => void;
  addColumn: (boardId: string, column: Omit<ColumnType, 'id' | 'cards'>) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  updateColumnOrder: (boardId: string, columnIds: string[]) => void;
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      boards: {},
      
      initializeBoard: (boardId, initialColumns) => {
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: {
              columns: initialColumns,
            },
          },
        }));
      },
      
      moveCard: (boardId, cardId, sourceColumnId, destinationColumnId) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return { boards: state.boards };
          
          const newColumns = [...board.columns];
          
          // Find source column
          const sourceColumnIndex = newColumns.findIndex(col => col.id === sourceColumnId);
          if (sourceColumnIndex === -1) return { boards: state.boards };
          
          // Find destination column
          const destColumnIndex = newColumns.findIndex(col => col.id === destinationColumnId);
          if (destColumnIndex === -1) return { boards: state.boards };
          
          // Find card in source column
          const cardIndex = newColumns[sourceColumnIndex].cards.findIndex(card => card.id === cardId);
          if (cardIndex === -1) return { boards: state.boards };
          
          // Remove card from source column
          const [movedCard] = newColumns[sourceColumnIndex].cards.splice(cardIndex, 1);
          
          // Add card to destination column
          newColumns[destColumnIndex].cards.push(movedCard);
          
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns: newColumns,
              },
            },
          };
        });
      },
      
      addCard: (boardId, columnId, card) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return { boards: state.boards };
          
          const newColumns = [...board.columns];
          const columnIndex = newColumns.findIndex(col => col.id === columnId);
          if (columnIndex === -1) return { boards: state.boards };
          
          const newCard: CardType = {
            id: uuidv4(),
            ...card,
          };
          
          newColumns[columnIndex].cards.push(newCard);
          
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns: newColumns,
              },
            },
          };
        });
      },
      
      updateCard: (boardId, columnId, cardId, updates) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return { boards: state.boards };
          
          const newColumns = [...board.columns];
          const columnIndex = newColumns.findIndex(col => col.id === columnId);
          if (columnIndex === -1) return { boards: state.boards };
          
          const cardIndex = newColumns[columnIndex].cards.findIndex(card => card.id === cardId);
          if (cardIndex === -1) return { boards: state.boards };
          
          newColumns[columnIndex].cards[cardIndex] = {
            ...newColumns[columnIndex].cards[cardIndex],
            ...updates,
          };
          
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns: newColumns,
              },
            },
          };
        });
      },
      
      deleteCard: (boardId, columnId, cardId) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return { boards: state.boards };
          
          const newColumns = [...board.columns];
          const columnIndex = newColumns.findIndex(col => col.id === columnId);
          if (columnIndex === -1) return { boards: state.boards };
          
          newColumns[columnIndex].cards = newColumns[columnIndex].cards.filter(card => card.id !== cardId);
          
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns: newColumns,
              },
            },
          };
        });
      },
      
      addColumn: (boardId, column) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return { boards: state.boards };
          
          const newColumn: ColumnType = {
            id: uuidv4(),
            ...column,
            cards: [],
          };
          
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns: [...board.columns, newColumn],
              },
            },
          };
        });
      },
      
      deleteColumn: (boardId, columnId) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return { boards: state.boards };
          
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns: board.columns.filter(col => col.id !== columnId),
              },
            },
          };
        });
      },
      
      updateColumnOrder: (boardId, columnIds) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return { boards: state.boards };
          
          const newColumns = [...board.columns];
          // Reorder columns based on the provided order
          const reorderedColumns = columnIds.map(
            columnId => newColumns.find(col => col.id === columnId)
          ).filter(Boolean) as ColumnType[];
          
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns: reorderedColumns,
              },
            },
          };
        });
      },
    }),
    {
      name: 'kanban-storage',
    }
  )
);