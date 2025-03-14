import { BoardType, ColumnType, CardType } from '@/lib/types';

export type BoardStatistics = {
  totalCards: number;
  cardsByStatus: Record<string, number>;
  cardsByPriority: Record<string, number>;
  completionRate: number;
  averageResolutionTime?: number; // W dniach
  cardsPerAssignee: Record<string, number>;
  overdueTasks: number;
  dueSoonTasks: number; // Zadania z terminem w ciągu najbliższych 3 dni
};

/**
 * Generuje statystyki dla tablicy Kanban
 */
export function generateBoardStatistics(board: BoardType): BoardStatistics {
  // Inicjalizacja statystyk
  const stats: BoardStatistics = {
    totalCards: 0,
    cardsByStatus: {},
    cardsByPriority: { low: 0, medium: 0, high: 0 },
    completionRate: 0,
    cardsPerAssignee: {},
    overdueTasks: 0,
    dueSoonTasks: 0,
  };
  
  // Liczba wszystkich kart
  let allCards: CardType[] = [];
  let completedCards: CardType[] = [];
  
  // Zliczanie kart według statusu (kolumny)
  board.columns.forEach(column => {
    stats.cardsByStatus[column.title] = column.cards.length;
    stats.totalCards += column.cards.length;
    allCards = [...allCards, ...column.cards];
    
    // Sprawdzenie, czy kolumna zawiera ukończone zadania (na podstawie tytułu)
    const completedTitles = ['Done', 'Completed', 'Resolved', 'Implemented'];
    if (completedTitles.some(title => column.title.includes(title))) {
      completedCards = [...completedCards, ...column.cards];
    }
  });
  
  // Obliczanie wskaźnika ukończenia
  stats.completionRate = stats.totalCards > 0 
    ? (completedCards.length / stats.totalCards) * 100 
    : 0;
  
  // Aktualna data do obliczeń zadań po terminie/zbliżających się
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);
  
  // Analiza wszystkich kart
  allCards.forEach(card => {
    // Zliczanie kart według priorytetu
    if (card.priority) {
      stats.cardsByPriority[card.priority]++;
    }
    
    // Zliczanie kart według przypisanego członka zespołu
    if (card.assignee) {
      stats.cardsPerAssignee[card.assignee] = (stats.cardsPerAssignee[card.assignee] || 0) + 1;
    }
    
    // Sprawdzanie zadań po terminie
    if (card.dueDate) {
      const dueDate = new Date(card.dueDate);
      if (dueDate < now) {
        stats.overdueTasks++;
      } else if (dueDate <= threeDaysFromNow) {
        stats.dueSoonTasks++;
      }
    }
  });
  
  // Obliczanie średniego czasu rozwiązania (tylko dla tablic problemów)
  if (board.type === 'problems' && completedCards.length > 0) {
    let totalResolutionDays = 0;
    let cardsWithDates = 0;
    
    completedCards.forEach(card => {
      if (card.createdAt && card.dueDate) {
        const created = new Date(card.createdAt);
        const resolved = new Date(card.dueDate);
        const daysToResolve = Math.floor((resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        if (daysToResolve >= 0) {
          totalResolutionDays += daysToResolve;
          cardsWithDates++;
        }
      }
    });
    
    if (cardsWithDates > 0) {
      stats.averageResolutionTime = totalResolutionDays / cardsWithDates;
    }
  }
  
  return stats;
}

/**
 * Pobiera sumaryczne dane dla wszystkich tablic danego działu
 */
export function getDepartmentBoardsStatistics(boards: BoardType[]): {
  tasks: BoardStatistics;
  problems: BoardStatistics;
  ideas: BoardStatistics;
} {
  // Inicjalizacja statystyk dla każdego typu tablicy
  const emptyStats: BoardStatistics = {
    totalCards: 0,
    cardsByStatus: {},
    cardsByPriority: { low: 0, medium: 0, high: 0 },
    completionRate: 0,
    cardsPerAssignee: {},
    overdueTasks: 0,
    dueSoonTasks: 0,
  };
  
  // Statystyki dla każdego typu tablicy
  const result = {
    tasks: { ...emptyStats },
    problems: { ...emptyStats },
    ideas: { ...emptyStats },
  };
  
  // Grupowanie tablic według typu
  const boardsByType: Record<string, BoardType[]> = {
    tasks: [],
    problems: [],
    ideas: [],
  };
  
  boards.forEach(board => {
    if (boardsByType[board.type]) {
      boardsByType[board.type].push(board);
    }
  });
  
  // Generowanie statystyk dla każdego typu tablicy
  Object.keys(boardsByType).forEach(boardType => {
    if (boardsByType[boardType].length === 0) return;
    
    // Jeśli jest tylko jedna tablica danego typu, używamy jej statystyk
    if (boardsByType[boardType].length === 1) {
      result[boardType as keyof typeof result] = generateBoardStatistics(boardsByType[boardType][0]);
      return;
    }
    
    // Agregacja statystyk z wielu tablic
    const combinedStats = { ...emptyStats };
    let totalCompletionRate = 0;
    let totalResolutionTime = 0;
    let boardsWithResolutionTime = 0;
    
    boardsByType[boardType].forEach(board => {
      const stats = generateBoardStatistics(board);
      
      // Agregacja podstawowych statystyk
      combinedStats.totalCards += stats.totalCards;
      combinedStats.overdueTasks += stats.overdueTasks;
      combinedStats.dueSoonTasks += stats.dueSoonTasks;
      
      // Agregacja priorytetów
      Object.keys(stats.cardsByPriority).forEach(priority => {
        combinedStats.cardsByPriority[priority] += stats.cardsByPriority[priority];
      });
      
      // Agregacja zadań według przypisanych osób
      Object.keys(stats.cardsPerAssignee).forEach(assignee => {
        combinedStats.cardsPerAssignee[assignee] = 
          (combinedStats.cardsPerAssignee[assignee] || 0) + stats.cardsPerAssignee[assignee];
      });
      
      // Agregacja statusów
      Object.keys(stats.cardsByStatus).forEach(status => {
        combinedStats.cardsByStatus[status] = 
          (combinedStats.cardsByStatus[status] || 0) + stats.cardsByStatus[status];
      });
      
      // Zbieranie danych do średnich wskaźników
      if (stats.totalCards > 0) {
        totalCompletionRate += stats.completionRate * stats.totalCards; // Ważona średnia
      }
      
      if (stats.averageResolutionTime !== undefined) {
        totalResolutionTime += stats.averageResolutionTime;
        boardsWithResolutionTime++;
      }
    });
    
    // Obliczanie średnich wskaźników
    if (combinedStats.totalCards > 0) {
      combinedStats.completionRate = totalCompletionRate / combinedStats.totalCards;
    }
    
    if (boardsWithResolutionTime > 0) {
      combinedStats.averageResolutionTime = totalResolutionTime / boardsWithResolutionTime;
    }
    
    result[boardType as keyof typeof result] = combinedStats;
  });
  
  return result;
}

/**
 * Generuje dane do wykresu trendów dla danego typu tablicy
 */
export function generateTrendData(boards: BoardType[], boardType: 'tasks' | 'problems' | 'ideas'): any[] {
  // Filtrujemy tablice według typu
  const filteredBoards = boards.filter(board => board.type === boardType);
  
  // Jeśli nie ma tablic danego typu, zwracamy pusty zbiór danych
  if (filteredBoards.length === 0) return [];
  
  // Symulujemy dane trendów (w prawdziwej aplikacji pobralibyśmy dane historyczne)
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  
  switch (boardType) {
    case 'tasks':
      return [
        { name: 'Week 1', completed: 12, inProgress: 5, pending: 3 },
        { name: 'Week 2', completed: 15, inProgress: 7, pending: 2 },
        { name: 'Week 3', completed: 8, inProgress: 10, pending: 5 },
        { name: 'Week 4', completed: 10, inProgress: 3, pending: 1 },
      ];
    
    case 'problems':
      return [
        { name: 'Week 1', resolved: 5, inAnalysis: 3, new: 2 },
        { name: 'Week 2', resolved: 4, inAnalysis: 2, new: 3 },
        { name: 'Week 3', resolved: 6, inAnalysis: 1, new: 1 },
        { name: 'Week 4', resolved: 8, inAnalysis: 2, new: 0 },
      ];
    
    case 'ideas':
      return [
        { name: 'Week 1', implemented: 2, inImplementation: 3, approved: 1, proposed: 6 },
        { name: 'Week 2', implemented: 3, inImplementation: 2, approved: 2, proposed: 4 },
        { name: 'Week 3', implemented: 1, inImplementation: 3, approved: 2, proposed: 5 },
        { name: 'Week 4', implemented: 4, inImplementation: 1, approved: 3, proposed: 3 },
      ];
  }
}