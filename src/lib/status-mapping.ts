import { ProjectStatus } from './types';

/**
 * Interface for column type mapping
 */
interface ColumnTypeMapping {
  columnType: string;
  projectStatus: ProjectStatus;
  progressValue: number;
}

/**
 * Maps Kanban column types to corresponding project statuses and progress values
 */
export const COLUMN_STATUS_MAPPING: ColumnTypeMapping[] = [
  // Tasks board columns
  { columnType: 'to-do', projectStatus: 'not-started', progressValue: 0 },
  { columnType: 'in-progress', projectStatus: 'in-progress', progressValue: 50 },
  { columnType: 'done', projectStatus: 'completed', progressValue: 100 },
  
  // Problems board columns
  { columnType: 'new', projectStatus: 'not-started', progressValue: 0 },
  { columnType: 'analysis', projectStatus: 'planning', progressValue: 25 },
  { columnType: 'corrective-actions', projectStatus: 'in-progress', progressValue: 60 },
  { columnType: 'resolved', projectStatus: 'completed', progressValue: 100 },
  
  // Ideas board columns
  { columnType: 'idea', projectStatus: 'not-started', progressValue: 0 },
  { columnType: 'approved', projectStatus: 'planning', progressValue: 30 },
  { columnType: 'implementation', projectStatus: 'in-progress', progressValue: 70 },
  { columnType: 'completed', projectStatus: 'completed', progressValue: 100 },
  
  // Polish equivalents
  { columnType: 'do-zrobienia', projectStatus: 'not-started', progressValue: 0 },
  { columnType: 'w-trakcie', projectStatus: 'in-progress', progressValue: 50 },
  { columnType: 'zakończone', projectStatus: 'completed', progressValue: 100 },
  { columnType: 'nowy', projectStatus: 'not-started', progressValue: 0 },
  { columnType: 'analiza', projectStatus: 'planning', progressValue: 25 },
  { columnType: 'działania-naprawcze', projectStatus: 'in-progress', progressValue: 60 },
  { columnType: 'rozwiązany', projectStatus: 'completed', progressValue: 100 },
  { columnType: 'pomysł', projectStatus: 'not-started', progressValue: 0 },
  { columnType: 'zatwierdzony', projectStatus: 'planning', progressValue: 30 },
  { columnType: 'wdrożenie', projectStatus: 'in-progress', progressValue: 70 },
  { columnType: 'wdrożony', projectStatus: 'completed', progressValue: 100 },
];

/**
 * Gets the project status based on the Kanban column type
 * @param columnType The Kanban column type or name
 * @returns The corresponding project status
 */
export function getProjectStatusFromColumn(columnType: string): ProjectStatus {
  // Normalize the column type by converting to lowercase and removing spaces
  const normalizedColumnType = columnType.toLowerCase().replace(/\s+/g, '-');
  
  // Find the matching mapping
  const mapping = COLUMN_STATUS_MAPPING.find(
    m => normalizedColumnType.includes(m.columnType)
  );
  
  // Return the mapped status or default to 'in-progress'
  return mapping?.projectStatus || 'in-progress';
}

/**
 * Gets the progress value based on the Kanban column type
 * @param columnType The Kanban column type or name
 * @returns The corresponding progress value (0-100)
 */
export function getProgressFromColumn(columnType: string): number {
  // Normalize the column type by converting to lowercase and removing spaces
  const normalizedColumnType = columnType.toLowerCase().replace(/\s+/g, '-');
  
  // Find the matching mapping
  const mapping = COLUMN_STATUS_MAPPING.find(
    m => normalizedColumnType.includes(m.columnType)
  );
  
  // Return the mapped progress value or default to 50
  return mapping?.progressValue || 50;
}

/**
 * Gets the appropriate column type for a given project status
 * @param status The project status
 * @param boardType The type of board ('tasks', 'problems', 'ideas')
 * @returns The corresponding column type
 */
export function getColumnTypeFromProjectStatus(
  status: ProjectStatus,
  boardType: 'tasks' | 'problems' | 'ideas'
): string {
  // Default column mapping based on board type
  const defaultMapping = {
    'tasks': {
      'not-started': 'to-do',
      'planning': 'to-do',
      'in-progress': 'in-progress',
      'on-hold': 'in-progress',
      'completed': 'done'
    },
    'problems': {
      'not-started': 'new',
      'planning': 'analysis',
      'in-progress': 'corrective-actions',
      'on-hold': 'analysis',
      'completed': 'resolved'
    },
    'ideas': {
      'not-started': 'idea',
      'planning': 'approved',
      'in-progress': 'implementation',
      'on-hold': 'approved',
      'completed': 'completed'
    }
  };
  
  return defaultMapping[boardType][status];
}

/**
 * Maps a full column name to its corresponding base type
 * @param fullColumnName The full column name (e.g. "departmentId-tasks-in-progress")
 * @returns The base column type (e.g. "in-progress")
 */
export function extractColumnType(fullColumnName: string): string {
  const parts = fullColumnName.split('-');
  
  // If there are at least 3 parts (departmentId-boardType-columnType)
  if (parts.length >= 3) {
    // Return everything after the second dash
    return parts.slice(2).join('-');
  }
  
  return fullColumnName; // Fallback to the full name
}

/**
 * Determines if a column status indicates completion
 * @param columnType The column type to check
 * @returns True if the column represents a completed state
 */
export function isCompletionColumn(columnType: string): boolean {
  const normalizedColumnType = columnType.toLowerCase().replace(/\s+/g, '-');
  
  const completionTypes = [
    'done', 
    'zakończone', 
    'resolved', 
    'rozwiązany', 
    'completed', 
    'wdrożony',
    'zakonczone',
    'ukonczony'
  ];
  
  return completionTypes.some(type => normalizedColumnType.includes(type));
}
