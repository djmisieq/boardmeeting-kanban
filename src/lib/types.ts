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
