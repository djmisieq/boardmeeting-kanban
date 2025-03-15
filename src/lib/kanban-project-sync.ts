import { useKanbanStore } from '@/store/use-kanban-store';
import { useProjectsStore } from '@/store/use-projects-store';
import { useMeetingsStore } from '@/store/use-meetings-store';
import { ProjectStatus, CardType } from '@/lib/types';
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

/**
 * Synchronizuje kartę Kanban ze spotkaniem, aktualizując status w spotkaniu
 * @param cardId ID karty Kanban
 * @param columnId ID kolumny
 * @returns Informacja o wykonanej synchronizacji
 */
export const syncKanbanCardWithMeeting = (
  cardId: string,
  boardId: string,
  columnId: string
): { success: boolean; message: string } => {
  try {
    const kanbanStore = useKanbanStore.getState();
    const meetingsStore = useMeetingsStore.getState();
    
    // Get all meetings
    const meetings = meetingsStore.meetings;
    
    // Counter for updated meetings
    let updatedMeetingsCount = 0;
    
    // Find meetings that have this card as an outcome
    for (const meeting of meetings) {
      const outcomeTypes = ['tasks', 'problems', 'ideas'] as const;
      let cardUpdated = false;
      
      for (const type of outcomeTypes) {
        if (!meeting.outcomes[type]) continue;
        
        const outcomeIndex = meeting.outcomes[type].findIndex(outcome => outcome.id === cardId);
        
        if (outcomeIndex >= 0) {
          // Found the card in this meeting's outcomes
          // Update the card's columnId in the meeting's outcomes
          const outcomes = [...meeting.outcomes[type]];
          outcomes[outcomeIndex] = {
            ...outcomes[outcomeIndex],
            columnId: columnId
          };
          
          // Create an updated outcomes object
          const updatedOutcomes = {
            ...meeting.outcomes,
            [type]: outcomes
          };
          
          // Update the meeting with new outcomes
          meetingsStore.updateMeeting(meeting.id, { outcomes: updatedOutcomes });
          updatedMeetingsCount++;
          cardUpdated = true;
          break;
        }
      }
      
      if (cardUpdated) {
        // If we found and updated the card in this meeting, no need to check other meetings
        // Assuming a card can only be in one meeting's outcomes
        break;
      }
    }
    
    return {
      success: updatedMeetingsCount > 0,
      message: updatedMeetingsCount > 0 
        ? `Zaktualizowano status karty w ${updatedMeetingsCount} spotkaniach` 
        : 'Nie znaleziono spotkań powiązanych z tą kartą'
    };
  } catch (error) {
    console.error('Błąd podczas synchronizacji karty ze spotkaniem:', error);
    return {
      success: false,
      message: 'Wystąpił błąd podczas synchronizacji'
    };
  }
};

/**
 * Dodaje nowo utworzoną kartę Kanban do wyników spotkania
 * @param card Nowa karta Kanban
 * @param meetingId ID spotkania
 * @param agendaItemId Opcjonalne ID punktu agendy
 * @returns Informacja o wykonanej synchronizacji
 */
export const addKanbanCardToMeeting = (
  card: CardType,
  meetingId: string,
  agendaItemId?: string
): { success: boolean; message: string } => {
  try {
    const meetingsStore = useMeetingsStore.getState();
    
    // Get the meeting
    const meeting = meetingsStore.getMeeting(meetingId);
    
    if (!meeting) {
      return {
        success: false,
        message: 'Spotkanie nie zostało znalezione'
      };
    }
    
    // Determine the outcome type based on card category
    let outcomeType: 'tasks' | 'problems' | 'ideas';
    switch (card.category) {
      case 'task':
        outcomeType = 'tasks';
        break;
      case 'problem':
        outcomeType = 'problems';
        break;
      case 'idea':
        outcomeType = 'ideas';
        break;
      default:
        return {
          success: false,
          message: 'Nieznany typ karty'
        };
    }
    
    // If agendaItemId is provided, add the card to that agenda item's outcomes
    if (agendaItemId) {
      const agendaItem = meeting.agenda.find(item => item.id === agendaItemId);
      
      if (!agendaItem) {
        return {
          success: false,
          message: 'Punkt agendy nie został znaleziony'
        };
      }
      
      // Create updated agenda with the card added to the specific agenda item
      const updatedAgenda = meeting.agenda.map(item => {
        if (item.id === agendaItemId) {
          return {
            ...item,
            outcome: {
              ...item.outcome,
              [outcomeType]: [
                ...(item.outcome?.[outcomeType] || []),
                card
              ]
            }
          };
        }
        return item;
      });
      
      // Also add to overall meeting outcomes
      const updatedOutcomes = {
        ...meeting.outcomes,
        [outcomeType]: [
          ...(meeting.outcomes[outcomeType] || []),
          card
        ]
      };
      
      // Update meeting with new agenda and outcomes
      meetingsStore.updateMeeting(meeting.id, { 
        agenda: updatedAgenda,
        outcomes: updatedOutcomes
      });
      
      return {
        success: true,
        message: `Dodano kartę do punktu agendy i wyników spotkania`
      };
    } else {
      // Just add to meeting outcomes
      const updatedOutcomes = {
        ...meeting.outcomes,
        [outcomeType]: [
          ...(meeting.outcomes[outcomeType] || []),
          card
        ]
      };
      
      // Update meeting with new outcomes
      meetingsStore.updateMeeting(meeting.id, { outcomes: updatedOutcomes });
      
      return {
        success: true,
        message: `Dodano kartę do wyników spotkania`
      };
    }
  } catch (error) {
    console.error('Błąd podczas dodawania karty do spotkania:', error);
    return {
      success: false,
      message: 'Wystąpił błąd podczas dodawania karty'
    };
  }
};
