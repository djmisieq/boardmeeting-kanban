// Wspólne typy używane w całej aplikacji

export type CardType = {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  departmentId?: string;  // ID działu, do którego należy karta
  createdBy?: string;    // Osoba, która utworzyła kartę
  createdAt?: string;    // Data utworzenia karty
  labels?: string[];     // Etykiety dla karty
  comments?: CommentType[]; // Komentarze do karty
  history?: HistoryEntry[]; // Historia zmian karty
  projectIds?: string[];  // IDs projektów, do których należy karta
};

export type ColumnType = {
  id: string;
  title: string;
  cards: CardType[];
};

export type BoardType = {
  id: string;
  type: 'tasks' | 'problems' | 'ideas';
  departmentId: string;
  name: string;
  columns: ColumnType[];
  createdAt: string;
  updatedAt: string;
};

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
  metrics?: {
    taskCompletion?: number;
    problemResolutionTime?: number;
    ideasImplemented?: number;
  };
};

export type MeetingNote = {
  id: string;
  title: string;
  date: string;
  departmentId: string;
  participants: string[];
  content: string;
  summary: string;
  tags: string[];
  relatedCards?: string[];  // IDs kart powiązanych z notatką
};

export type Goal = {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  status: 'not-started' | 'on-track' | 'at-risk' | 'completed';
  progress: number;
  dueDate: string;
  owner: string;
  alignedWith?: string;  // ID celu nadrzędnego
  subgoals: Goal[];      // Podcele
  relatedCards?: string[]; // IDs kart powiązanych z celem
};

// Nowe typy dla projektów międzydziałowych
export type ProjectStatus = 
  | 'not-started' 
  | 'planning' 
  | 'in-progress' 
  | 'on-hold' 
  | 'completed';

export type ProjectTask = {
  id: string;            // Unikalny ID zadania w projekcie
  cardId: string;        // ID oryginalnej karty
  boardId: string;       // ID tablicy, na której znajduje się karta
  departmentId: string;  // ID działu
  order: number;         // Kolejność w projekcie
  dependsOn?: string[];  // ID innych zadań, od których zależy
};

export type ProjectMilestone = {
  id: string;
  name: string;
  description?: string;
  date: string;
  completed: boolean;
  taskIds: string[];     // Zadania związane z kamieniem milowym
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  progress: number;      // 0-100%
  owner: string;         // Główna osoba odpowiedzialna
  departments: string[]; // Lista ID działów uczestniczących w projekcie
  tasks: ProjectTask[];   // Lista zadań w projekcie
  tags: string[];        // Tagi kategoryzujące projekt
  createdAt: string;
  updatedAt: string;
  milestones: ProjectMilestone[];
};

// Typy dla rozszerzonych mechanizmów współpracy
export type CommentType = {
  id: string;
  content: string;
  author: string;
  departmentId: string;
  createdAt: string;
  updatedAt?: string;
  mentions?: string[];   // Oznaczone osoby (@mentions)
  parentId?: string;     // ID nadrzędnego komentarza (dla wątków)
};

export type HistoryAction = 
  | 'created'
  | 'updated'
  | 'moved'
  | 'assigned'
  | 'commented'
  | 'changed_priority'
  | 'changed_status'
  | 'added_to_project'
  | 'removed_from_project';

export type HistoryEntry = {
  id: string;
  timestamp: string;
  action: HistoryAction;
  user: string;
  departmentId: string;
  details: {
    field?: string;
    oldValue?: any;
    newValue?: any;
    comment?: string;
  };
};
