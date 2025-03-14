import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { BoardType, ColumnType, CardType } from '@/lib/types';
import { generateBoardStatistics } from '@/lib/board-utils';

interface KanbanState {
  boards: Record<string, BoardType>;
  
  // Actions
  initializeBoard: (boardId: string, boardType: 'tasks' | 'problems' | 'ideas', departmentId: string, initialColumns: ColumnType[]) => void;
  getBoard: (boardId: string) => BoardType | undefined;
  getBoardsForDepartment: (departmentId: string, boardType?: 'tasks' | 'problems' | 'ideas') => BoardType[];
  moveCard: (boardId: string, cardId: string, sourceColumnId: string, destinationColumnId: string) => void;
  addCard: (boardId: string, columnId: string, card: Omit<CardType, 'id'>) => void;
  updateCard: (boardId: string, columnId: string, cardId: string, updates: Partial<CardType>) => void;
  deleteCard: (boardId: string, columnId: string, cardId: string) => void;
  assignCardToDepartment: (boardId: string, columnId: string, cardId: string, departmentId: string) => void;
  transferCardToDepartment: (
    sourceBoardId: string, 
    sourceColumnId: string, 
    cardId: string, 
    targetDepartmentId: string,
    targetBoardId: string,
    targetColumnId: string
  ) => void;
  addColumn: (boardId: string, column: Omit<ColumnType, 'id' | 'cards'>) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  updateColumnOrder: (boardId: string, columnIds: string[]) => void;
}

// Generate a default board structure for different board types
const createDefaultBoard = (
  boardId: string, 
  boardType: 'tasks' | 'problems' | 'ideas', 
  departmentId: string
): BoardType => {
  let columns: ColumnType[] = [];
  
  switch (boardType) {
    case 'tasks':
      columns = [
        { id: `${boardId}-todo`, title: 'To Do', cards: [] },
        { id: `${boardId}-inprogress`, title: 'In Progress', cards: [] },
        { id: `${boardId}-done`, title: 'Done', cards: [] },
      ];
      break;
    case 'problems':
      columns = [
        { id: `${boardId}-new`, title: 'New', cards: [] },
        { id: `${boardId}-analysis`, title: 'Analysis', cards: [] },
        { id: `${boardId}-action`, title: 'Corrective Actions', cards: [] },
        { id: `${boardId}-resolved`, title: 'Resolved', cards: [] },
      ];
      break;
    case 'ideas':
      columns = [
        { id: `${boardId}-proposed`, title: 'Proposed Ideas', cards: [] },
        { id: `${boardId}-approved`, title: 'Approved', cards: [] },
        { id: `${boardId}-implementing`, title: 'In Implementation', cards: [] },
        { id: `${boardId}-completed`, title: 'Implemented', cards: [] },
      ];
      break;
  }
  
  return {
    id: boardId,
    type: boardType,
    departmentId: departmentId,
    name: `${boardType.charAt(0).toUpperCase()}${boardType.slice(1)} Board`,
    columns: columns,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      boards: {},
      
      initializeBoard: (boardId, boardType, departmentId, initialColumns) => {
        // If board already exists, just return
        if (get().boards[boardId]) return;
        
        // If initial columns provided, use them, otherwise use default columns
        const boardToCreate = initialColumns && initialColumns.length > 0
          ? {
              id: boardId,
              type: boardType,
              departmentId: departmentId,
              name: `${boardType.charAt(0).toUpperCase()}${boardType.slice(1)} Board`,
              columns: initialColumns,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : createDefaultBoard(boardId, boardType, departmentId);
        
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: boardToCreate,
          },
        }));
      },
      
      getBoard: (boardId) => {
        return get().boards[boardId];
      },
      
      getBoardsForDepartment: (departmentId, boardType) => {
        const allBoards = Object.values(get().boards);
        return allBoards.filter(board => 
          board.departmentId === departmentId && 
          (boardType ? board.type === boardType : true)
        );
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
          
          const updatedBoard = {
            ...board,
            columns: newColumns,
            updatedAt: new Date().toISOString(),
          };
          
          return {
            boards: {
              ...state.boards,
              [boardId]: updatedBoard,
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
            createdAt: new Date().toISOString(),
            departmentId: board.departmentId,
            ...card,
          };
          
          newColumns[columnIndex].cards.push(newCard);
          
          const updatedBoard = {
            ...board,
            columns: newColumns,
            updatedAt: new Date().toISOString(),
          };
          
          return {
            boards: {
              ...state.boards,
              [boardId]: updatedBoard,
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
          
          const updatedBoard = {
            ...board,
            columns: newColumns,
            updatedAt: new Date().toISOString(),
          };
          
          return {
            boards: {
              ...state.boards,
              [boardId]: updatedBoard,
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
          
          const updatedBoard = {
            ...board,
            columns: newColumns,
            updatedAt: new Date().toISOString(),
          };
          
          return {
            boards: {
              ...state.boards,
              [boardId]: updatedBoard,
            },
          };
        });
      },
      
      assignCardToDepartment: (boardId, columnId, cardId, departmentId) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return { boards: state.boards };
          
          const newColumns = [...board.columns];
          const columnIndex = newColumns.findIndex(col => col.id === columnId);
          if (columnIndex === -1) return { boards: state.boards };
          
          const cardIndex = newColumns[columnIndex].cards.findIndex(card => card.id === cardId);
          if (cardIndex === -1) return { boards: state.boards };
          
          newColumns[columnIndex].cards[cardIndex].departmentId = departmentId;
          
          const updatedBoard = {
            ...board,
            columns: newColumns,
            updatedAt: new Date().toISOString(),
          };
          
          return {
            boards: {
              ...state.boards,
              [boardId]: updatedBoard,
            },
          };
        });
      },
      
      transferCardToDepartment: (sourceBoardId, sourceColumnId, cardId, targetDepartmentId, targetBoardId, targetColumnId) => {
        set((state) => {
          // Get source board
          const sourceBoard = state.boards[sourceBoardId];
          if (!sourceBoard) return { boards: state.boards };
          
          // Get target board
          const targetBoard = state.boards[targetBoardId];
          if (!targetBoard) return { boards: state.boards };
          
          // Clone columns for both boards
          const sourceColumns = [...sourceBoard.columns];
          const targetColumns = [...targetBoard.columns];
          
          // Find source column
          const sourceColumnIndex = sourceColumns.findIndex(col => col.id === sourceColumnId);
          if (sourceColumnIndex === -1) return { boards: state.boards };
          
          // Find target column
          const targetColumnIndex = targetColumns.findIndex(col => col.id === targetColumnId);
          if (targetColumnIndex === -1) return { boards: state.boards };
          
          // Find card in source column
          const cardIndex = sourceColumns[sourceColumnIndex].cards.findIndex(card => card.id === cardId);
          if (cardIndex === -1) return { boards: state.boards };
          
          // Remove card from source column
          const [movedCard] = sourceColumns[sourceColumnIndex].cards.splice(cardIndex, 1);
          
          // Update card with new department ID
          const updatedCard = {
            ...movedCard,
            departmentId: targetDepartmentId,
          };
          
          // Add card to target column
          targetColumns[targetColumnIndex].cards.push(updatedCard);
          
          // Update both boards
          return {
            boards: {
              ...state.boards,
              [sourceBoardId]: {
                ...sourceBoard,
                columns: sourceColumns,
                updatedAt: new Date().toISOString(),
              },
              [targetBoardId]: {
                ...targetBoard,
                columns: targetColumns,
                updatedAt: new Date().toISOString(),
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
          
          const updatedBoard = {
            ...board,
            columns: [...board.columns, newColumn],
            updatedAt: new Date().toISOString(),
          };
          
          return {
            boards: {
              ...state.boards,
              [boardId]: updatedBoard,
            },
          };
        });
      },
      
      deleteColumn: (boardId, columnId) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return { boards: state.boards };
          
          const updatedBoard = {
            ...board,
            columns: board.columns.filter(col => col.id !== columnId),
            updatedAt: new Date().toISOString(),
          };
          
          return {
            boards: {
              ...state.boards,
              [boardId]: updatedBoard,
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
          
          const updatedBoard = {
            ...board,
            columns: reorderedColumns,
            updatedAt: new Date().toISOString(),
          };
          
          return {
            boards: {
              ...state.boards,
              [boardId]: updatedBoard,
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