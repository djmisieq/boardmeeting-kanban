// Typ działu
export interface Department {
  id: string;
  name: string;
  description?: string;
  members: string[];
  boardIds: {
    tasksBoard: string;
    problemsBoard: string;
    ideasBoard: string;
  };
  metrics?: {
    taskCompletion: number;
    problemResolutionTime: number;
    ideasImplemented: number;
  };
}

// Typ karty Kanban
export interface CardType {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  departmentId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  columnId: string;
  category?: 'task' | 'problem' | 'idea';
  meetingId?: string; // Powiązanie z meeting, z którego pochodzi karta
  labels?: string[];
  comments?: CommentType[];
  history?: HistoryEntry[];
  projectIds?: string[]; // Identyfikatory projektów, do których należy karta
}

// Typ komentarza
export interface CommentType {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

// Typ wpisu historii
export interface HistoryEntry {
  id: string;
  action: string; // np. "created", "updated", "moved"
  timestamp: string;
  user: string;
  details?: string;
}

// Typ kolumny Kanban
export interface ColumnType {
  id: string;
  title: string;
  cards: CardType[];
}

// Typ tablicy Kanban
export interface BoardType {
  id: string;
  name?: string;
  type: 'tasks' | 'problems' | 'ideas';
  departmentId: string;
  columns: ColumnType[];
  createdAt: string;
  updatedAt: string;
}

// Status projektu
export type ProjectStatus = 
  | 'not-started' 
  | 'planning' 
  | 'in-progress' 
  | 'on-hold' 
  | 'completed';

// Zadanie w projekcie powiązane z kartą Kanban
export interface ProjectTask {
  id: string;
  cardId: string;
  boardId: string;
  departmentId: string;
  order: number;
  dependsOn?: string[];
}

// Kamień milowy projektu
export interface ProjectMilestone {
  id: string;
  name: string;
  description?: string;
  date: string;
  completed: boolean;
  taskIds: string[];
}

// Projekt
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  progress: number;
  owner: string;
  departments: string[];
  tasks: ProjectTask[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  milestones: ProjectMilestone[];
  meetingId?: string; // ID spotkania, z którego powstał projekt (opcjonalne)
}

// Punkt agendy spotkania
export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  duration: number; // czas w minutach
  presenter?: string;
  status: 'pending' | 'in-progress' | 'completed';
  notes?: string;
  outcome?: {
    tasks: CardType[];
    problems: CardType[];
    ideas: CardType[];
  };
}

// Spotkanie
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  organizer: string;
  participants: string[];
  departments: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  agenda: AgendaItem[];
  notes?: string;
  summary?: string;
  outcomes?: {
    tasks: CardType[];
    problems: CardType[];
    ideas: CardType[];
    projects: Project[];
  };
  createdAt: string;
  updatedAt: string;
}
