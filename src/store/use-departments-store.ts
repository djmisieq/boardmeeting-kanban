import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type Department = {
  id: string;
  name: string;
  description?: string;
  members: string[];
  boardIds: {
    tasksBoard?: string;
    problemsBoard?: string;
    ideasBoard?: string;
  };
};

interface DepartmentsState {
  departments: Department[];
  selectedDepartmentId: string | null;
  
  // Actions
  addDepartment: (name: string, description?: string) => void;
  updateDepartment: (id: string, data: Partial<Omit<Department, 'id'>>) => void;
  deleteDepartment: (id: string) => void;
  selectDepartment: (id: string | null) => void;
  addMemberToDepartment: (departmentId: string, memberName: string) => void;
  removeMemberFromDepartment: (departmentId: string, memberName: string) => void;
  assignBoardToDepartment: (departmentId: string, boardType: 'tasksBoard' | 'problemsBoard' | 'ideasBoard', boardId: string) => void;
}

// Pre-populated sample data
const initialDepartments: Department[] = [
  {
    id: 'dept-dev',
    name: 'Development Team',
    description: 'Software development and engineering team',
    members: ['John D.', 'Anna K.', 'Mike S.', 'Alex P.'],
    boardIds: {
      tasksBoard: 'dev-tasks',
      problemsBoard: 'dev-problems',
      ideasBoard: 'dev-ideas',
    },
  },
  {
    id: 'dept-marketing',
    name: 'Marketing Team',
    description: 'Marketing, branding, and communications',
    members: ['Sarah L.', 'Tom R.'],
    boardIds: {
      tasksBoard: 'marketing-tasks',
      problemsBoard: 'marketing-problems',
      ideasBoard: 'marketing-ideas',
    },
  },
  {
    id: 'dept-hr',
    name: 'HR & Operations',
    description: 'Human resources and company operations',
    members: ['Linda M.', 'Robert K.'],
    boardIds: {
      tasksBoard: 'hr-tasks',
      problemsBoard: 'hr-problems',
      ideasBoard: 'hr-ideas',
    },
  },
];

export const useDepartmentsStore = create<DepartmentsState>()(
  persist(
    (set) => ({
      departments: initialDepartments,
      selectedDepartmentId: 'dept-dev',
      
      addDepartment: (name, description) => set((state) => ({
        departments: [
          ...state.departments,
          {
            id: `dept-${uuidv4()}`,
            name,
            description,
            members: [],
            boardIds: {},
          },
        ],
      })),
      
      updateDepartment: (id, data) => set((state) => ({
        departments: state.departments.map((dept) =>
          dept.id === id ? { ...dept, ...data } : dept
        ),
      })),
      
      deleteDepartment: (id) => set((state) => ({
        departments: state.departments.filter((dept) => dept.id !== id),
        selectedDepartmentId: state.selectedDepartmentId === id ? 
          (state.departments.length > 1 ? state.departments[0].id : null) : 
          state.selectedDepartmentId,
      })),
      
      selectDepartment: (id) => set({ selectedDepartmentId: id }),
      
      addMemberToDepartment: (departmentId, memberName) => set((state) => ({
        departments: state.departments.map((dept) =>
          dept.id === departmentId && !dept.members.includes(memberName)
            ? { ...dept, members: [...dept.members, memberName] }
            : dept
        ),
      })),
      
      removeMemberFromDepartment: (departmentId, memberName) => set((state) => ({
        departments: state.departments.map((dept) =>
          dept.id === departmentId
            ? { ...dept, members: dept.members.filter((m) => m !== memberName) }
            : dept
        ),
      })),
      
      assignBoardToDepartment: (departmentId, boardType, boardId) => set((state) => ({
        departments: state.departments.map((dept) =>
          dept.id === departmentId
            ? {
                ...dept,
                boardIds: {
                  ...dept.boardIds,
                  [boardType]: boardId,
                },
              }
            : dept
        ),
      })),
    }),
    {
      name: 'departments-storage',
    }
  )
);