import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Meeting, AgendaItem, CardType } from '@/lib/types';

interface MeetingsState {
  meetings: Meeting[];
  selectedMeetingId: string | null;
  
  // Akcje dla spotkań
  createMeeting: (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt' | 'agenda' | 'outcomes'>) => string;
  updateMeeting: (id: string, meetingData: Partial<Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteMeeting: (id: string) => void;
  selectMeeting: (id: string | null) => void;
  getMeeting: (id: string) => Meeting | undefined;
  
  // Akcje dla punktów agendy
  addAgendaItem: (meetingId: string, agendaItem: Omit<AgendaItem, 'id' | 'status' | 'outcome'>) => string;
  updateAgendaItem: (meetingId: string, agendaItemId: string, updates: Partial<AgendaItem>) => void;
  removeAgendaItem: (meetingId: string, agendaItemId: string) => void;
  completeAgendaItem: (meetingId: string, agendaItemId: string) => void;
  
  // Akcje dla wyników spotkania
  addOutcomeTask: (meetingId: string, agendaItemId: string | null, task: Omit<CardType, 'id' | 'createdAt' | 'meetingId'>) => string;
  addOutcomeProblem: (meetingId: string, agendaItemId: string | null, problem: Omit<CardType, 'id' | 'createdAt' | 'meetingId'>) => string;
  addOutcomeIdea: (meetingId: string, agendaItemId: string | null, idea: Omit<CardType, 'id' | 'createdAt' | 'meetingId'>) => string;
  
  // Akcje helper
  getUpcomingMeetings: () => Meeting[];
  getPastMeetings: () => Meeting[];
}

// Przykładowe dane startowe
const initialMeetings: Meeting[] = [
  {
    id: 'meeting-dev-weekly',
    title: 'Spotkanie tygodniowe zespołu deweloperskiego',
    description: 'Cotygodniowe spotkanie zespołu deweloperskiego w celu omówienia postępów i problemów.',
    date: '2025-03-18',
    startTime: '10:00',
    endTime: '11:30',
    location: 'Sala konferencyjna A',
    organizer: 'John D.',
    participants: ['John D.', 'Anna K.', 'Mike S.', 'Alex P.'],
    departments: ['dept-dev'],
    status: 'scheduled',
    agenda: [
      {
        id: 'agenda-1',
        title: 'Przegląd postępów z ostatniego tygodnia',
        description: 'Każdy członek zespołu prezentuje swoje postępy z ostatniego tygodnia.',
        duration: 30,
        presenter: 'John D.',
        status: 'pending'
      },
      {
        id: 'agenda-2',
        title: 'Problemy i wyzwania',
        description: 'Omówienie napotkanych problemów i wyzwań.',
        duration: 20,
        presenter: 'Anna K.',
        status: 'pending'
      },
      {
        id: 'agenda-3',
        title: 'Planowanie na kolejny tydzień',
        description: 'Planowanie zadań i priorytetów na następny tydzień.',
        duration: 25,
        presenter: 'John D.',
        status: 'pending'
      }
    ],
    outcomes: {
      tasks: [],
      problems: [],
      ideas: [],
      projects: []
    },
    createdAt: '2025-03-15T10:00:00.000Z',
    updatedAt: '2025-03-15T10:00:00.000Z'
  },
  {
    id: 'meeting-marketing-monthly',
    title: 'Miesięczne spotkanie zespołu marketingowego',
    description: 'Spotkanie zespołu marketingowego w celu podsumowania działań z minionego miesiąca i planów na kolejny.',
    date: '2025-03-20',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Sala konferencyjna B',
    organizer: 'Sarah L.',
    participants: ['Sarah L.', 'Tom R.'],
    departments: ['dept-marketing'],
    status: 'scheduled',
    agenda: [
      {
        id: 'agenda-1',
        title: 'Podsumowanie kampanii z minionego miesiąca',
        description: 'Analiza wyników kampanii marketingowych z ostatniego miesiąca.',
        duration: 45,
        presenter: 'Sarah L.',
        status: 'pending'
      },
      {
        id: 'agenda-2',
        title: 'Planowanie nowych kampanii',
        description: 'Dyskusja i planowanie kampanii na następny miesiąc.',
        duration: 60,
        presenter: 'Tom R.',
        status: 'pending'
      }
    ],
    outcomes: {
      tasks: [],
      problems: [],
      ideas: [],
      projects: []
    },
    createdAt: '2025-03-10T15:30:00.000Z',
    updatedAt: '2025-03-10T15:30:00.000Z'
  }
];

export const useMeetingsStore = create<MeetingsState>()(
  persist(
    (set, get) => ({
      meetings: initialMeetings,
      selectedMeetingId: null,
      
      // Akcje dla spotkań
      createMeeting: (meetingData) => {
        const id = `meeting-${uuidv4().substring(0, 8)}`;
        const now = new Date().toISOString();
        
        const newMeeting: Meeting = {
          ...meetingData,
          id,
          agenda: [],
          outcomes: {
            tasks: [],
            problems: [],
            ideas: [],
            projects: []
          },
          createdAt: now,
          updatedAt: now
        };
        
        set((state) => ({
          meetings: [...state.meetings, newMeeting]
        }));
        
        return id;
      },
      
      updateMeeting: (id, meetingData) => {
        const now = new Date().toISOString();
        
        set((state) => ({
          meetings: state.meetings.map((meeting) =>
            meeting.id === id
              ? {
                  ...meeting,
                  ...meetingData,
                  updatedAt: now
                }
              : meeting
          )
        }));
      },
      
      deleteMeeting: (id) => {
        set((state) => ({
          meetings: state.meetings.filter((meeting) => meeting.id !== id),
          selectedMeetingId: state.selectedMeetingId === id ? null : state.selectedMeetingId
        }));
      },
      
      selectMeeting: (id) => {
        set({ selectedMeetingId: id });
      },
      
      getMeeting: (id) => {
        return get().meetings.find((meeting) => meeting.id === id);
      },
      
      // Akcje dla punktów agendy
      addAgendaItem: (meetingId, agendaItem) => {
        const id = `agenda-${uuidv4().substring(0, 8)}`;
        const now = new Date().toISOString();
        
        const newAgendaItem: AgendaItem = {
          ...agendaItem,
          id,
          status: 'pending'
        };
        
        set((state) => ({
          meetings: state.meetings.map((meeting) =>
            meeting.id === meetingId
              ? {
                  ...meeting,
                  agenda: [...meeting.agenda, newAgendaItem],
                  updatedAt: now
                }
              : meeting
          )
        }));
        
        return id;
      },
      
      updateAgendaItem: (meetingId, agendaItemId, updates) => {
        const now = new Date().toISOString();
        
        set((state) => ({
          meetings: state.meetings.map((meeting) =>
            meeting.id === meetingId
              ? {
                  ...meeting,
                  agenda: meeting.agenda.map((item) =>
                    item.id === agendaItemId
                      ? { ...item, ...updates }
                      : item
                  ),
                  updatedAt: now
                }
              : meeting
          )
        }));
      },
      
      removeAgendaItem: (meetingId, agendaItemId) => {
        const now = new Date().toISOString();
        
        set((state) => ({
          meetings: state.meetings.map((meeting) =>
            meeting.id === meetingId
              ? {
                  ...meeting,
                  agenda: meeting.agenda.filter((item) => item.id !== agendaItemId),
                  updatedAt: now
                }
              : meeting
          )
        }));
      },
      
      completeAgendaItem: (meetingId, agendaItemId) => {
        const now = new Date().toISOString();
        
        set((state) => ({
          meetings: state.meetings.map((meeting) =>
            meeting.id === meetingId
              ? {
                  ...meeting,
                  agenda: meeting.agenda.map((item) =>
                    item.id === agendaItemId
                      ? { ...item, status: 'completed' }
                      : item
                  ),
                  updatedAt: now
                }
              : meeting
          )
        }));
      },
      
      // Akcje dla wyników spotkania
      addOutcomeTask: (meetingId, agendaItemId, task) => {
        const id = `task-${uuidv4().substring(0, 8)}`;
        const now = new Date().toISOString();
        
        const newTask: CardType = {
          ...task,
          id,
          category: 'task',
          meetingId,
          createdAt: now,
          columnId: task.columnId || 'to-do' // Domyślna kolumna
        };
        
        set((state) => {
          const meeting = state.meetings.find(m => m.id === meetingId);
          if (!meeting) return state;
          
          // Jeśli podano agendaItemId, dodaj zadanie do konkretnego punktu agendy
          if (agendaItemId) {
            return {
              meetings: state.meetings.map((meeting) =>
                meeting.id === meetingId
                  ? {
                      ...meeting,
                      agenda: meeting.agenda.map((item) =>
                        item.id === agendaItemId
                          ? {
                              ...item,
                              outcome: {
                                ...item.outcome,
                                tasks: [...(item.outcome?.tasks || []), newTask]
                              }
                            }
                          : item
                      ),
                      outcomes: {
                        ...meeting.outcomes,
                        tasks: [...(meeting.outcomes?.tasks || []), newTask]
                      },
                      updatedAt: now
                    }
                  : meeting
              )
            };
          } else {
            // Dodaj zadanie tylko do wyników spotkania
            return {
              meetings: state.meetings.map((meeting) =>
                meeting.id === meetingId
                  ? {
                      ...meeting,
                      outcomes: {
                        ...meeting.outcomes,
                        tasks: [...(meeting.outcomes?.tasks || []), newTask]
                      },
                      updatedAt: now
                    }
                  : meeting
              )
            };
          }
        });
        
        return id;
      },
      
      addOutcomeProblem: (meetingId, agendaItemId, problem) => {
        const id = `problem-${uuidv4().substring(0, 8)}`;
        const now = new Date().toISOString();
        
        const newProblem: CardType = {
          ...problem,
          id,
          category: 'problem',
          meetingId,
          createdAt: now,
          columnId: problem.columnId || 'new' // Domyślna kolumna
        };
        
        set((state) => {
          const meeting = state.meetings.find(m => m.id === meetingId);
          if (!meeting) return state;
          
          // Jeśli podano agendaItemId, dodaj problem do konkretnego punktu agendy
          if (agendaItemId) {
            return {
              meetings: state.meetings.map((meeting) =>
                meeting.id === meetingId
                  ? {
                      ...meeting,
                      agenda: meeting.agenda.map((item) =>
                        item.id === agendaItemId
                          ? {
                              ...item,
                              outcome: {
                                ...item.outcome,
                                problems: [...(item.outcome?.problems || []), newProblem]
                              }
                            }
                          : item
                      ),
                      outcomes: {
                        ...meeting.outcomes,
                        problems: [...(meeting.outcomes?.problems || []), newProblem]
                      },
                      updatedAt: now
                    }
                  : meeting
              )
            };
          } else {
            // Dodaj problem tylko do wyników spotkania
            return {
              meetings: state.meetings.map((meeting) =>
                meeting.id === meetingId
                  ? {
                      ...meeting,
                      outcomes: {
                        ...meeting.outcomes,
                        problems: [...(meeting.outcomes?.problems || []), newProblem]
                      },
                      updatedAt: now
                    }
                  : meeting
              )
            };
          }
        });
        
        return id;
      },
      
      addOutcomeIdea: (meetingId, agendaItemId, idea) => {
        const id = `idea-${uuidv4().substring(0, 8)}`;
        const now = new Date().toISOString();
        
        const newIdea: CardType = {
          ...idea,
          id,
          category: 'idea',
          meetingId,
          createdAt: now,
          columnId: idea.columnId || 'proposed' // Domyślna kolumna
        };
        
        set((state) => {
          const meeting = state.meetings.find(m => m.id === meetingId);
          if (!meeting) return state;
          
          // Jeśli podano agendaItemId, dodaj pomysł do konkretnego punktu agendy
          if (agendaItemId) {
            return {
              meetings: state.meetings.map((meeting) =>
                meeting.id === meetingId
                  ? {
                      ...meeting,
                      agenda: meeting.agenda.map((item) =>
                        item.id === agendaItemId
                          ? {
                              ...item,
                              outcome: {
                                ...item.outcome,
                                ideas: [...(item.outcome?.ideas || []), newIdea]
                              }
                            }
                          : item
                      ),
                      outcomes: {
                        ...meeting.outcomes,
                        ideas: [...(meeting.outcomes?.ideas || []), newIdea]
                      },
                      updatedAt: now
                    }
                  : meeting
              )
            };
          } else {
            // Dodaj pomysł tylko do wyników spotkania
            return {
              meetings: state.meetings.map((meeting) =>
                meeting.id === meetingId
                  ? {
                      ...meeting,
                      outcomes: {
                        ...meeting.outcomes,
                        ideas: [...(meeting.outcomes?.ideas || []), newIdea]
                      },
                      updatedAt: now
                    }
                  : meeting
              )
            };
          }
        });
        
        return id;
      },
      
      // Helper functions
      getUpcomingMeetings: () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
        
        return get().meetings.filter(meeting => {
          return meeting.date >= today && meeting.status !== 'cancelled';
        }).sort((a, b) => {
          // Sortuj według daty, a następnie według godziny rozpoczęcia
          if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
          }
          return a.startTime.localeCompare(b.startTime);
        });
      },
      
      getPastMeetings: () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
        
        return get().meetings.filter(meeting => {
          return meeting.date < today || meeting.status === 'completed';
        }).sort((a, b) => {
          // Sortuj od najnowszych do najstarszych
          if (a.date !== b.date) {
            return b.date.localeCompare(a.date);
          }
          return b.startTime.localeCompare(a.startTime);
        });
      }
    }),
    {
      name: 'meetings-storage'
    }
  )
);
