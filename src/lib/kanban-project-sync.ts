import { useKanbanStore } from '@/store/use-kanban-store';
import { useProjectsStore } from '@/store/use-projects-store';
import { ProjectStatus } from '@/lib/types';
import { 
  getProjectStatusFromColumn, 
  getProgressFromColumn,
  getColumnTypeFromProjectStatus,
  extractColumnType
} from '@/lib/status-mapping';

/**
 * Synchronizuje status karty Kanban z projektem
 * @param cardId ID karty Kanban
 * @param boardId ID tablicy
 * @param columnId ID kolumny
 * @returns Informacja o wykonanej synchronizacji
 */
export const syncCardStatusWithProject = (
  cardId: string,
  boardId: string,
  columnId: string
): { success: boolean; message: string } => {
  try {
    const kanbanStore = useKanbanStore.getState();
    const projectsStore = useProjectsStore.getState();
    
    // Znajdź projekty powiązane z tą kartą
    const linkedProjects = projectsStore.getProjectsForCard(cardId);
    
    if (linkedProjects.length === 0) {
      return { 
        success: false, 
        message: 'Brak powiązanych projektów dla tej karty' 
      };
    }
    
    // Określ typ tablicy (zadania, problemy, usprawnienia)
    const boardType = boardId.includes('tasks') 
      ? 'tasks' 
      : boardId.includes('problems')
        ? 'problems'
        : 'ideas';
    
    // Uzyskaj typ kolumny
    const columnType = extractColumnType(columnId);
    
    // Oblicz status projektu na podstawie typu kolumny
    const projectStatus = getProjectStatusFromColumn(columnType);
    
    // Oblicz progress na podstawie typu kolumny
    const progress = getProgressFromColumn(columnType);
    
    // Aktualizuj status i progress dla wszystkich powiązanych projektów
    for (const project of linkedProjects) {
      // Sprawdź czy status projektu powinien być zaktualizowany
      // Tylko jeśli jest w trakcie lub planowaniu i karta została ukończona
      if (
        (project.status === 'in-progress' || project.status === 'planning') &&
        projectStatus === 'completed'
      ) {
        projectsStore.updateProject(project.id, { status: projectStatus });
      }
      
      // Przelicz postęp projektu
      projectsStore.calculateProjectProgress(project.id);
    }
    
    return {
      success: true,
      message: `Zsynchronizowano status karty z ${linkedProjects.length} projektami`
    };
  } catch (error) {
    console.error('Błąd podczas synchronizacji statusu karty z projektem:', error);
    return {
      success: false,
      message: 'Wystąpił błąd podczas synchronizacji'
    };
  }
};

/**
 * Synchronizuje status projektu z kartami Kanban
 * @param projectId ID projektu
 * @param status Nowy status projektu
 * @returns Informacja o wykonanej synchronizacji
 */
export const syncProjectStatusWithCards = (
  projectId: string,
  status: ProjectStatus
): { success: boolean; message: string } => {
  try {
    const kanbanStore = useKanbanStore.getState();
    const projectsStore = useProjectsStore.getState();
    
    // Pobierz projekt
    const project = projectsStore.projects.find(p => p.id === projectId);
    
    if (!project) {
      return {
        success: false,
        message: 'Projekt nie został znaleziony'
      };
    }
    
    // Pobierz zadania projektu
    const { tasks } = project;
    
    if (tasks.length === 0) {
      return {
        success: false,
        message: 'Projekt nie ma powiązanych kart Kanban'
      };
    }
    
    // Licznik zaktualizowanych kart
    let updatedCardsCount = 0;
    
    // Dla każdego zadania, znajdź powiązaną kartę i aktualizuj jej status
    for (const task of tasks) {
      const { cardId, boardId } = task;
      
      if (!cardId || !boardId) continue;
      
      // Znajdź kartę
      const cardInfo = kanbanStore.findCardById(cardId);
      
      if (!cardInfo) continue;
      
      const { columnId } = cardInfo;
      
      // Określ typ tablicy
      const boardType = boardId.includes('tasks') 
        ? 'tasks' 
        : boardId.includes('problems')
          ? 'problems'
          : 'ideas';
          
      // Tylko aktualizuj karty, jeśli status projektu jest 'completed' lub 'on-hold'
      if (status === 'completed' || status === 'on-hold') {
        // Znajdź odpowiedni typ kolumny dla nowego statusu
        const targetColumnType = getColumnTypeFromProjectStatus(status, boardType as any);
        
        // Znajdź docelową kolumnę w tej samej tablicy
        const board = kanbanStore.getBoard(boardId);
        
        if (!board) continue;
        
        // Znajdź kolumnę odpowiadającą typowi
        const targetColumn = board.columns.find(col => 
          col.id.toLowerCase().includes(targetColumnType)
        );
        
        if (!targetColumn) continue;
        
        // Przenieś kartę do tej kolumny, jeśli nie jest już tam
        if (columnId !== targetColumn.id) {
          kanbanStore.moveCardToColumn(boardId, columnId, cardId, targetColumn.id);
          updatedCardsCount++;
        }
      }
    }
    
    return {
      success: true,
      message: `Zaktualizowano status ${updatedCardsCount} kart Kanban`
    };
  } catch (error) {
    console.error('Błąd podczas synchronizacji statusu projektu z kartami:', error);
    return {
      success: false,
      message: 'Wystąpił błąd podczas synchronizacji'
    };
  }
};
