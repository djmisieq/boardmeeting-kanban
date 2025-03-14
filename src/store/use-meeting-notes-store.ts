import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { MeetingNote } from '@/lib/types';

interface MeetingNotesState {
  notes: Record<string, MeetingNote>;
  
  // Actions
  addNote: (note: Omit<MeetingNote, 'id'>) => string;
  updateNote: (id: string, updates: Partial<Omit<MeetingNote, 'id'>>) => void;
  deleteNote: (id: string) => void;
  getNoteById: (id: string) => MeetingNote | undefined;
  getNotesForDepartment: (departmentId: string) => MeetingNote[];
  getAllNotes: () => MeetingNote[];
  searchNotes: (query: string, departmentId?: string) => MeetingNote[];
}

// Sample initial meeting notes
const initialNotes: Record<string, MeetingNote> = {
  'note-1': {
    id: 'note-1',
    title: 'Weekly Team Meeting',
    date: '2025-03-12',
    departmentId: 'dept-dev',
    participants: ['John D.', 'Anna K.', 'Mike S.', 'Alex P.'],
    content: `
# Weekly Team Meeting - March 12, 2025

## Agenda
1. Project status update
2. Blockers and issues
3. Planning for next sprint
4. Open discussion

## Notes
- Development of the dashboard features is progressing well
- Several issues reported with the login page performance
- Need to prioritize bug fixes before adding new features
- Next sprint planning will be on Friday

## Action Items
- John: Fix login page performance issues
- Anna: Complete dashboard feature by end of week
- Mike: Set up automated testing for new features
- Alex: Update documentation for new API endpoints

## Decisions
- Agreed to postpone the new feature implementation
- Weekly check-ins will continue at the same time
    `,
    summary: 'Discussed project progress, blockers, and upcoming sprint planning.',
    tags: ['team', 'weekly', 'development'],
    relatedCards: ['task-1', 'task-2']
  },
  'note-2': {
    id: 'note-2',
    title: 'Project Kickoff: Mobile App Redesign',
    date: '2025-03-10',
    departmentId: 'dept-marketing',
    participants: ['Sarah L.', 'Tom R.', 'UX Team', 'Dev Team'],
    content: `
# Project Kickoff: Mobile App Redesign

## Objectives
- Revamp the mobile app interface
- Improve user experience and engagement
- Increase conversion rates by 15%

## Timeline
- Research & User Testing: 2 weeks
- Design Phase: 3 weeks
- Development: 6 weeks
- QA & Launch: 3 weeks

## Responsibilities
- UX Team: Research, wireframes, and user testing
- Design Team: Visual design and prototypes
- Dev Team: Implementation
- Marketing: Launch strategy

## Next Steps
- UX Team to start user interviews next week
- Weekly progress updates scheduled
    `,
    summary: 'Initial kickoff for the mobile app redesign project. Defined goals, timeline, and responsibilities.',
    tags: ['project', 'kickoff', 'design', 'mobile'],
    relatedCards: []
  },
  'note-3': {
    id: 'note-3',
    title: 'Quarterly Review Q1 2025',
    date: '2025-03-05',
    departmentId: 'dept-hr',
    participants: ['Linda M.', 'Robert K.', 'Management Team', 'Department Heads'],
    content: `
# Quarterly Business Review - Q1 2025

## Financial Highlights
- Revenue increased by 12% compared to Q4 2024
- New customer acquisition up by 8%
- Operating costs reduced by 3%

## Department Updates
- Sales: Exceeded targets by 5%
- Marketing: New campaign launched with positive early results
- Development: On track with product roadmap
- HR: Successfully implemented new onboarding process

## Challenges
- Supply chain delays affecting hardware deliveries
- Increasing competition in our primary market

## Goals for Q2
- Launch new mobile app redesign
- Increase market share in European region
- Complete migration to new CRM system
    `,
    summary: 'Quarterly business review. Discussed KPIs, achievements, and plans for Q2.',
    tags: ['quarterly', 'review', 'management', 'business'],
    relatedCards: []
  }
};

export const useMeetingNotesStore = create<MeetingNotesState>()(
  persist(
    (set, get) => ({
      notes: initialNotes,
      
      addNote: (note) => {
        const id = `note-${uuidv4()}`;
        set((state) => ({
          notes: {
            ...state.notes,
            [id]: {
              id,
              ...note,
            },
          },
        }));
        return id;
      },
      
      updateNote: (id, updates) => {
        set((state) => {
          const note = state.notes[id];
          if (!note) return state;
          
          return {
            notes: {
              ...state.notes,
              [id]: {
                ...note,
                ...updates,
              },
            },
          };
        });
      },
      
      deleteNote: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.notes;
          return { notes: rest };
        });
      },
      
      getNoteById: (id) => {
        return get().notes[id];
      },
      
      getNotesForDepartment: (departmentId) => {
        return Object.values(get().notes).filter(
          note => note.departmentId === departmentId
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      
      getAllNotes: () => {
        return Object.values(get().notes)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      
      searchNotes: (query, departmentId) => {
        const lowerQuery = query.toLowerCase();
        let notes = departmentId
          ? get().getNotesForDepartment(departmentId)
          : get().getAllNotes();
          
        return notes.filter(note => 
          note.title.toLowerCase().includes(lowerQuery) ||
          note.summary.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery) ||
          note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      },
    }),
    {
      name: 'meeting-notes-storage',
    }
  )
);