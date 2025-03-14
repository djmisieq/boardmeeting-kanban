import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  CommentType,
  HistoryEntry,
  HistoryAction,
  CardType
} from '@/lib/types';

interface CollaborationState {
  comments: Record<string, CommentType[]>; // cardId -> komentarze
  history: Record<string, HistoryEntry[]>; // cardId -> historia
  currentViewingUsers: Record<string, string[]>; // cardId -> lista użytkowników przeglądających
  
  // Zarządzanie komentarzami
  addComment: (cardId: string, content: string, author: string, departmentId: string, parentId?: string) => string;
  editComment: (cardId: string, commentId: string, newContent: string) => void;
  deleteComment: (cardId: string, commentId: string) => void;
  getCommentsForCard: (cardId: string) => CommentType[];
  getThreadedComments: (cardId: string) => { [parentId: string]: CommentType[] };
  
  // Zarządzanie historią
  addHistoryEntry: (
    cardId: string, 
    action: HistoryAction, 
    user: string, 
    departmentId: string, 
    details: HistoryEntry['details']
  ) => void;
  getHistoryForCard: (cardId: string) => HistoryEntry[];
  
  // Współpraca w czasie rzeczywistym
  registerUserViewingCard: (cardId: string, userId: string) => void;
  unregisterUserViewingCard: (cardId: string, userId: string) => void;
  getUsersViewingCard: (cardId: string) => string[];
  
  // Obsługa wzmianek (@mentions)
  extractMentions: (content: string) => string[];
  notifyMentionedUsers: (cardId: string, commentId: string, mentions: string[]) => void;
}

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  comments: {},
  history: {},
  currentViewingUsers: {},
  
  // Zarządzanie komentarzami
  addComment: (cardId, content, author, departmentId, parentId) => {
    const commentId = uuidv4();
    const now = new Date().toISOString();
    
    const mentions = get().extractMentions(content);
    
    const newComment: CommentType = {
      id: commentId,
      content,
      author,
      departmentId,
      createdAt: now,
      mentions,
      ...(parentId && { parentId })
    };
    
    set(state => {
      const cardComments = state.comments[cardId] || [];
      
      return {
        comments: {
          ...state.comments,
          [cardId]: [...cardComments, newComment]
        }
      };
    });
    
    // Dodaj wpis do historii
    get().addHistoryEntry(
      cardId,
      'commented',
      author,
      departmentId,
      { comment: content }
    );
    
    // Powiadom użytkowników oznaczonych w komentarzu
    if (mentions.length > 0) {
      get().notifyMentionedUsers(cardId, commentId, mentions);
    }
    
    return commentId;
  },
  
  editComment: (cardId, commentId, newContent) => {
    set(state => {
      const cardComments = state.comments[cardId] || [];
      const commentIndex = cardComments.findIndex(c => c.id === commentId);
      
      if (commentIndex === -1) return state;
      
      const updatedComments = [...cardComments];
      const oldComment = updatedComments[commentIndex];
      
      // Aktualizuj komentarz
      updatedComments[commentIndex] = {
        ...oldComment,
        content: newContent,
        updatedAt: new Date().toISOString(),
        mentions: get().extractMentions(newContent)
      };
      
      return {
        comments: {
          ...state.comments,
          [cardId]: updatedComments
        }
      };
    });
  },
  
  deleteComment: (cardId, commentId) => {
    set(state => {
      const cardComments = state.comments[cardId] || [];
      
      return {
        comments: {
          ...state.comments,
          [cardId]: cardComments.filter(c => c.id !== commentId)
        }
      };
    });
  },
  
  getCommentsForCard: (cardId) => {
    return get().comments[cardId] || [];
  },
  
  getThreadedComments: (cardId) => {
    const allComments = get().getCommentsForCard(cardId);
    const threads: { [parentId: string]: CommentType[] } = { root: [] };
    
    // Pogrupuj komentarze według parentId
    allComments.forEach(comment => {
      if (!comment.parentId) {
        // To jest komentarz główny
        threads.root.push(comment);
      } else {
        // To jest odpowiedź
        if (!threads[comment.parentId]) {
          threads[comment.parentId] = [];
        }
        threads[comment.parentId].push(comment);
      }
    });
    
    // Posortuj wszystkie grupy według daty utworzenia
    Object.keys(threads).forEach(threadId => {
      threads[threadId].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
    
    return threads;
  },
  
  // Zarządzanie historią
  addHistoryEntry: (cardId, action, user, departmentId, details) => {
    const entryId = uuidv4();
    
    const newEntry: HistoryEntry = {
      id: entryId,
      timestamp: new Date().toISOString(),
      action,
      user,
      departmentId,
      details
    };
    
    set(state => {
      const cardHistory = state.history[cardId] || [];
      
      return {
        history: {
          ...state.history,
          [cardId]: [...cardHistory, newEntry]
        }
      };
    });
  },
  
  getHistoryForCard: (cardId) => {
    return get().history[cardId] || [];
  },
  
  // Współpraca w czasie rzeczywistym
  registerUserViewingCard: (cardId, userId) => {
    set(state => {
      const currentUsers = state.currentViewingUsers[cardId] || [];
      
      if (currentUsers.includes(userId)) {
        return state;
      }
      
      return {
        currentViewingUsers: {
          ...state.currentViewingUsers,
          [cardId]: [...currentUsers, userId]
        }
      };
    });
  },
  
  unregisterUserViewingCard: (cardId, userId) => {
    set(state => {
      const currentUsers = state.currentViewingUsers[cardId] || [];
      
      return {
        currentViewingUsers: {
          ...state.currentViewingUsers,
          [cardId]: currentUsers.filter(id => id !== userId)
        }
      };
    });
  },
  
  getUsersViewingCard: (cardId) => {
    return get().currentViewingUsers[cardId] || [];
  },
  
  // Obsługa wzmianek (@mentions)
  extractMentions: (content) => {
    // Wyszukaj wszystkie wzmianki w formacie @name
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  },
  
  notifyMentionedUsers: (cardId, commentId, mentions) => {
    // TODO: Tutaj w przyszłości zaimplementujemy system powiadomień
    // dla użytkowników wymienionych w komentarzu
    console.log(`Notify users ${mentions.join(', ')} about mention in comment ${commentId} on card ${cardId}`);
  }
}));

// Funkcja pomocnicza do tworzenia wpisów historii przy zmianie karty
export const trackCardChanges = (card: CardType, updatedCard: CardType, userId: string, departmentId: string) => {
  const store = useCollaborationStore.getState();
  
  // Sprawdź zmiany w tytule
  if (card.title !== updatedCard.title) {
    store.addHistoryEntry(
      card.id,
      'updated',
      userId,
      departmentId,
      {
        field: 'title',
        oldValue: card.title,
        newValue: updatedCard.title
      }
    );
  }
  
  // Sprawdź zmiany w opisie
  if (card.description !== updatedCard.description) {
    store.addHistoryEntry(
      card.id,
      'updated',
      userId,
      departmentId,
      {
        field: 'description',
        oldValue: card.description,
        newValue: updatedCard.description
      }
    );
  }
  
  // Sprawdź zmiany w przypisanej osobie
  if (card.assignee !== updatedCard.assignee) {
    store.addHistoryEntry(
      card.id,
      'assigned',
      userId,
      departmentId,
      {
        oldValue: card.assignee,
        newValue: updatedCard.assignee
      }
    );
  }
  
  // Sprawdź zmiany w priorytecie
  if (card.priority !== updatedCard.priority) {
    store.addHistoryEntry(
      card.id,
      'changed_priority',
      userId,
      departmentId,
      {
        oldValue: card.priority,
        newValue: updatedCard.priority
      }
    );
  }
  
  // Sprawdź zmiany w terminie
  if (card.dueDate !== updatedCard.dueDate) {
    store.addHistoryEntry(
      card.id,
      'updated',
      userId,
      departmentId,
      {
        field: 'dueDate',
        oldValue: card.dueDate,
        newValue: updatedCard.dueDate
      }
    );
  }
};
