import { CardType, Meeting } from './types';
import { useMeetingsStore } from '@/store/use-meetings-store';
import { useKanbanStore } from '@/store/use-kanban-store';

/**
 * Finds all cards that were created during a specific meeting
 * @param meetingId The ID of the meeting to find cards for
 * @returns Array of cards associated with the meeting
 */
export function findCardsByMeeting(meetingId: string): CardType[] {
  const kanbanStore = useKanbanStore.getState();
  const boards = kanbanStore.boards;
  
  let meetingCards: CardType[] = [];
  
  // Search through all boards and their columns for cards with the meeting ID
  for (const board of boards) {
    for (const column of board.columns) {
      const foundCards = column.cards.filter(card => card.meetingId === meetingId);
      meetingCards = [...meetingCards, ...foundCards];
    }
  }
  
  return meetingCards;
}

/**
 * Get statistics about cards created during meetings
 * @returns Object with statistics
 */
export function getMeetingCardStatistics() {
  const meetingsStore = useMeetingsStore.getState();
  const meetings = meetingsStore.meetings;
  const kanbanStore = useKanbanStore.getState();
  
  const stats = {
    totalMeetingCards: 0,
    cardsPerMeeting: [] as { meetingId: string, meetingTitle: string, cardCount: number }[],
    cardTypeDistribution: {
      tasks: 0,
      problems: 0,
      ideas: 0,
    },
    percentageOfCardsFromMeetings: 0,
  };
  
  // Calculate total cards from meetings and distribution by type
  meetings.forEach(meeting => {
    const meetingCards = findCardsByMeeting(meeting.id);
    stats.totalMeetingCards += meetingCards.length;
    
    stats.cardsPerMeeting.push({
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      cardCount: meetingCards.length
    });
    
    // Count by category
    meetingCards.forEach(card => {
      if (card.category === 'task') stats.cardTypeDistribution.tasks++;
      else if (card.category === 'problem') stats.cardTypeDistribution.problems++;
      else if (card.category === 'idea') stats.cardTypeDistribution.ideas++;
    });
  });
  
  // Calculate total cards in the system
  let totalCards = 0;
  kanbanStore.boards.forEach(board => {
    board.columns.forEach(column => {
      totalCards += column.cards.length;
    });
  });
  
  // Calculate percentage of cards from meetings
  if (totalCards > 0) {
    stats.percentageOfCardsFromMeetings = (stats.totalMeetingCards / totalCards) * 100;
  }
  
  return stats;
}

/**
 * Navigates from a card to its source meeting
 * @param card The card to get meeting info for
 * @returns Meeting object if found, null otherwise
 */
export function getSourceMeeting(card: CardType): Meeting | null {
  if (!card.meetingId) return null;
  
  const meetingsStore = useMeetingsStore.getState();
  return meetingsStore.getMeeting(card.meetingId) || null;
}

/**
 * Gets suggested default column for a card based on meeting agenda item status
 * @param meetingId ID of the meeting
 * @param agendaItemId ID of the agenda item
 * @param cardType Type of card ('task', 'problem', 'idea')
 * @returns Column type for the card
 */
export function getSuggestedColumnForMeetingOutcome(
  meetingId: string,
  agendaItemId: string | null,
  cardType: 'task' | 'problem' | 'idea'
): string {
  const meetingsStore = useMeetingsStore.getState();
  const meeting = meetingsStore.getMeeting(meetingId);
  
  if (!meeting) {
    // Default columns if meeting not found
    if (cardType === 'task') return 'to-do';
    if (cardType === 'problem') return 'new';
    if (cardType === 'idea') return 'idea';
    return 'to-do';
  }
  
  // If agenda item is specified, check its status
  if (agendaItemId) {
    const agendaItem = meeting.agenda.find(item => item.id === agendaItemId);
    
    if (agendaItem && agendaItem.status === 'completed') {
      // For completed agenda items, cards might need immediate action
      if (cardType === 'task') return 'in-progress';
      if (cardType === 'problem') return 'analysis';
      if (cardType === 'idea') return 'approved';
    }
  }
  
  // Default columns based on card type
  if (cardType === 'task') return 'to-do';
  if (cardType === 'problem') return 'new';
  if (cardType === 'idea') return 'idea';
  
  return 'to-do';
}
