import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Department } from '@/lib/types';

interface DepartmentsState {
  departments: Department[];
  selectedDepartmentId: string | null;
  
  // Actions
  addDepartment: (name: string, description?: string) => string; // Returns the new department ID
  updateDepartment: (id: string, data: Partial<Omit<Department, 'id'>>) => void;
  deleteDepartment: (id: string) => void;
  selectDepartment: (id: string | null) => void;
  addMemberToDepartment: (departmentId: string, memberName: string) => void;
  removeMemberFromDepartment: (departmentId: string, memberName: string) => void;
  assignBoardToDepartment: (departmentId: string, boardType: 'tasksBoard' | 'problemsBoard' | 'ideasBoard', boardId: string) => void;
  getDepartmentBoardId: (departmentId: string, boardType: 'tasksBoard' | 'problemsBoard' | 'ideasBoard') => string;
  updateDepartmentMetrics: (departmentId: string, metrics: Department['metrics']) => void;
  getAllMembers: () => string[]; // Get all unique members across departments
}

// Generate default board IDs for new departments
const getDefaultBoardIds = (departmentId: string) => ({
  tasksBoard: `${departmentId}-tasks`,
  problemsBoard: `${departmentId}-problems`,
  ideasBoard: `${departmentId}-ideas`,
});

// Pre-populated sample data
const initialDepartments: Department[] = [
  {
    id: 'dept-dev',
    name: 'Development Team',
    description: 'Software development and engineering team',
    members: ['John D.', 'Anna K.', 'Mike S.', 'Alex P.'],
    boardIds: getDefaultBoardIds('dept-dev'),
    metrics: {
      taskCompletion: 78,
      problemResolutionTime: 2.3,
      ideasImplemented: 14
    }
  },
  {
    id: 'dept-marketing',
    name: 'Marketing Team',
    description: 'Marketing, branding, and communications',
    members: ['Sarah L.', 'Tom R.'],
    boardIds: getDefaultBoardIds('dept-marketing'),
    metrics: {
      taskCompletion: 82,
      problemResolutionTime: 1.8,
      ideasImplemented: 9
    }
  },
  {
    id: 'dept-hr',
    name: 'HR & Operations',
    description: 'Human resources and company operations',
    members: ['Linda M.', 'Robert K.'],
    boardIds: getDefaultBoardIds('dept-hr'),
    metrics: {
      taskCompletion: 90,
      problemResolutionTime: 1.5,
      ideasImplemented: 6
    }
  },
];

export const useDepartmentsStore = create<DepartmentsState>()(
  persist(
    (set, get) => ({
      departments: initialDepartments,
      selectedDepartmentId: 'dept-dev',
      
      addDepartment: (name, description) => {
        const newDepartmentId = `dept-${uuidv4().substring(0, 8)}`;
        set((state) => ({
          departments: [
            ...state.departments,
            {
              id: newDepartmentId,
              name,
              description,
              members: [],
              boardIds: getDefaultBoardIds(newDepartmentId),
              metrics: {
                taskCompletion: 0,
                problemResolutionTime: 0,
                ideasImplemented: 0
              }
            },
          ],
        }));
        return newDepartmentId;
      },
      
      updateDepartment: (id, data) => set((state) => ({
        departments: state.departments.map((dept) =>
          dept.id === id ? { ...dept, ...data } : dept
        ),
      })),
      
      deleteDepartment: (id) => set((state) => ({
        departments: state.departments.filter((dept) => dept.id !== id),
        selectedDepartmentId: state.selectedDepartmentId === id ? 
          (state.departments.length > 1 ? 
            state.departments.find(d => d.id !== id)?.id || null : null) : 
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
      
      getDepartmentBoardId: (departmentId, boardType) => {
        const department = get().departments.find(d => d.id === departmentId);
        if (!department) return '';
        
        // Return the specific board ID or generate a default one
        return department.boardIds[boardType] || `${departmentId}-${boardType.replace('Board', '')}`;
      },
      
      updateDepartmentMetrics: (departmentId, metrics) => set((state) => ({
        departments: state.departments.map((dept) =>
          dept.id === departmentId
            ? {
                ...dept,
                metrics: {
                  ...dept.metrics,
                  ...metrics,
                },
              }
            : dept
        ),
      })),
      
      getAllMembers: () => {
        // Get all unique members from all departments
        const allMembers = new Set<string>();
        get().departments.forEach(dept => {
          dept.members.forEach(member => {
            allMembers.add(member);
          });
        });
        return Array.from(allMembers);
      },
    }),
    {
      name: 'departments-storage',
    }
  )
);