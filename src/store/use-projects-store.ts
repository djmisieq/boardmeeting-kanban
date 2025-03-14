import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  Project, 
  ProjectTask, 
  ProjectStatus, 
  ProjectMilestone
} from '@/lib/types';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  
  // Akcje zarządzania projektami
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  
  // Zarządzanie zadaniami w projekcie
  addTaskToProject: (projectId: string, task: Omit<ProjectTask, 'id' | 'order'>) => string;
  removeTaskFromProject: (projectId: string, taskId: string) => void;
  updateTaskInProject: (projectId: string, taskId: string, updates: Partial<ProjectTask>) => void;
  reorderProjectTasks: (projectId: string, taskIds: string[]) => void;
  
  // Zarządzanie kamieniami milowymi
  addMilestone: (projectId: string, milestone: Omit<ProjectMilestone, 'id'>) => string;
  updateMilestone: (projectId: string, milestoneId: string, updates: Partial<ProjectMilestone>) => void;
  deleteMilestone: (projectId: string, milestoneId: string) => void;
  
  // Pomocnicze
  calculateProjectProgress: (projectId: string) => void;
  getProjectsByDepartment: (departmentId: string) => Project[];
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  
  // Akcje zarządzania projektami
  createProject: (projectData) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newProject: Project = {
      ...projectData,
      id,
      progress: 0,
      createdAt: now,
      updatedAt: now,
      tasks: [],
      milestones: []
    };
    
    set(state => ({
      projects: [...state.projects, newProject]
    }));
    
    return id;
  },
  
  updateProject: (id, updates) => {
    set(state => ({
      projects: state.projects.map(project => 
        project.id === id 
          ? { 
              ...project, 
              ...updates, 
              updatedAt: new Date().toISOString() 
            } 
          : project
      )
    }));
  },
  
  deleteProject: (id) => {
    set(state => ({
      projects: state.projects.filter(project => project.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject
    }));
  },
  
  setCurrentProject: (id) => {
    if (id === null) {
      set({ currentProject: null });
      return;
    }
    
    const project = get().projects.find(p => p.id === id) || null;
    set({ currentProject: project });
  },
  
  // Zarządzanie zadaniami w projekcie
  addTaskToProject: (projectId, taskData) => {
    const taskId = uuidv4();
    const { projects } = get();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return taskId;
    
    const project = projects[projectIndex];
    const order = project.tasks.length;
    
    const newTask: ProjectTask = {
      ...taskData,
      id: taskId,
      order
    };
    
    set(state => {
      const updatedProjects = [...state.projects];
      updatedProjects[projectIndex] = {
        ...project,
        tasks: [...project.tasks, newTask],
        updatedAt: new Date().toISOString()
      };
      
      return { projects: updatedProjects };
    });
    
    get().calculateProjectProgress(projectId);
    
    return taskId;
  },
  
  removeTaskFromProject: (projectId, taskId) => {
    const { projects } = get();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return;
    
    const project = projects[projectIndex];
    
    set(state => {
      const updatedProjects = [...state.projects];
      updatedProjects[projectIndex] = {
        ...project,
        tasks: project.tasks.filter(t => t.id !== taskId),
        updatedAt: new Date().toISOString()
      };
      
      // Aktualizacja order dla pozostałych zadań
      updatedProjects[projectIndex].tasks = updatedProjects[projectIndex].tasks
        .map((task, index) => ({ ...task, order: index }));
      
      return { projects: updatedProjects };
    });
    
    get().calculateProjectProgress(projectId);
  },
  
  updateTaskInProject: (projectId, taskId, updates) => {
    const { projects } = get();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return;
    
    const project = projects[projectIndex];
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return;
    
    set(state => {
      const updatedProjects = [...state.projects];
      const updatedTasks = [...project.tasks];
      
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        ...updates
      };
      
      updatedProjects[projectIndex] = {
        ...project,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString()
      };
      
      return { projects: updatedProjects };
    });
    
    get().calculateProjectProgress(projectId);
  },
  
  reorderProjectTasks: (projectId, taskIds) => {
    const { projects } = get();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return;
    
    const project = projects[projectIndex];
    
    // Stworzyć nową kolejność na podstawie tablicy taskIds
    const reorderedTasks = taskIds.map((taskId, index) => {
      const task = project.tasks.find(t => t.id === taskId);
      if (!task) return null;
      return { ...task, order: index };
    }).filter(Boolean) as ProjectTask[];
    
    // Dodanie zadań, które mogły nie zostać uwzględnione w taskIds
    const remainingTasks = project.tasks
      .filter(task => !taskIds.includes(task.id))
      .map((task, i) => ({ ...task, order: reorderedTasks.length + i }));
    
    set(state => {
      const updatedProjects = [...state.projects];
      updatedProjects[projectIndex] = {
        ...project,
        tasks: [...reorderedTasks, ...remainingTasks],
        updatedAt: new Date().toISOString()
      };
      
      return { projects: updatedProjects };
    });
  },
  
  // Zarządzanie kamieniami milowymi
  addMilestone: (projectId, milestoneData) => {
    const milestoneId = uuidv4();
    const { projects } = get();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return milestoneId;
    
    const project = projects[projectIndex];
    
    const newMilestone: ProjectMilestone = {
      ...milestoneData,
      id: milestoneId
    };
    
    set(state => {
      const updatedProjects = [...state.projects];
      updatedProjects[projectIndex] = {
        ...project,
        milestones: [...project.milestones, newMilestone],
        updatedAt: new Date().toISOString()
      };
      
      return { projects: updatedProjects };
    });
    
    return milestoneId;
  },
  
  updateMilestone: (projectId, milestoneId, updates) => {
    const { projects } = get();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return;
    
    const project = projects[projectIndex];
    const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
    
    if (milestoneIndex === -1) return;
    
    set(state => {
      const updatedProjects = [...state.projects];
      const updatedMilestones = [...project.milestones];
      
      updatedMilestones[milestoneIndex] = {
        ...updatedMilestones[milestoneIndex],
        ...updates
      };
      
      updatedProjects[projectIndex] = {
        ...project,
        milestones: updatedMilestones,
        updatedAt: new Date().toISOString()
      };
      
      return { projects: updatedProjects };
    });
    
    get().calculateProjectProgress(projectId);
  },
  
  deleteMilestone: (projectId, milestoneId) => {
    const { projects } = get();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return;
    
    const project = projects[projectIndex];
    
    set(state => {
      const updatedProjects = [...state.projects];
      updatedProjects[projectIndex] = {
        ...project,
        milestones: project.milestones.filter(m => m.id !== milestoneId),
        updatedAt: new Date().toISOString()
      };
      
      return { projects: updatedProjects };
    });
  },
  
  // Pomocnicze
  calculateProjectProgress: (projectId) => {
    const { projects } = get();
    const project = projects.find(p => p.id === projectId);
    
    if (!project) return;
    
    // Jeśli nie ma zadań, postęp wynosi 0%
    if (project.tasks.length === 0) {
      get().updateProject(projectId, { progress: 0 });
      return;
    }
    
    // Obliczamy postęp na podstawie statusów kart w Kanban
    const totalTasks = project.tasks.length;
    let completedTasks = 0;
    
    // Tutaj będzie potrzebna integracja z useKanbanStore 
    // aby sprawdzić aktualny status każdej karty
    // To jest uproszczona wersja:
    for (const task of project.tasks) {
      // W rzeczywistej implementacji sprawdzamy status karty task.cardId
      // na jej tablicy Kanban task.boardId
      
      // Przykładowo, jeśli karta jest w ostatniej kolumnie (np. "Done")
      // uznajemy ją za zakończoną
      // TODO: Zaimplementować rzeczywiste sprawdzanie statusu
      
      // Tymczasowo, założmy że 30% zadań jest zakończonych
      if (Math.random() > 0.7) completedTasks++;
    }
    
    const progress = Math.round((completedTasks / totalTasks) * 100);
    get().updateProject(projectId, { progress });
  },
  
  getProjectsByDepartment: (departmentId) => {
    return get().projects.filter(project => 
      project.departments.includes(departmentId)
    );
  }
}));
