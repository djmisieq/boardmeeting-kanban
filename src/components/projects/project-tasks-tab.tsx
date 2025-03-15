import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Calendar, 
  User, 
  Flag, 
  Plus,
  AlertCircle, 
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { useProjectsStore } from '@/store/use-projects-store';
import { useKanbanStore } from '@/store/use-kanban-store';
import { Project, CardType, ProjectTask } from '@/lib/types';

interface ProjectTasksTabProps {
  project: Project;
}

const ProjectTasksTab = ({ project }: ProjectTasksTabProps) => {
  const { updateTaskInProject, removeTaskFromProject } = useProjectsStore();
  const { getBoard } = useKanbanStore();
  const [tasks, setTasks] = useState<(CardType & { status: string; taskId: string })[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Ładowanie szczegółów zadań z tablic Kanban
    const loadTasks = async () => {
      setLoading(true);
      
      const tasksWithDetails = project.tasks.map(task => {
        const board = getBoard(task.boardId);
        if (!board) return null;
        
        // Znalezienie karty w tablicy
        let card: CardType | null = null;
        let status = '';
        
        for (const column of board.columns) {
          const foundCard = column.cards.find(c => c.id === task.cardId);
          if (foundCard) {
            card = foundCard;
            status = column.title;
            break;
          }
        }
        
        if (!card) return null;
        
        return {
          ...card,
          status,
          taskId: task.id
        };
      }).filter(Boolean) as (CardType & { status: string; taskId: string })[];
      
      setTasks(tasksWithDetails);
      setLoading(false);
    };
    
    loadTasks();
  }, [project.tasks, getBoard]);
  
  const getCardTypeIcon = (boardId: string) => {
    if (boardId.includes('tasks')) {
      return <CheckSquare className="h-4 w-4 text-blue-500" />;
    } else if (boardId.includes('problems')) {
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    } else if (boardId.includes('ideas')) {
      return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckSquare className="h-4 w-4 text-gray-500" />;
  };
  
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };
  
  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'Wysoki';
      case 'medium':
        return 'Średni';
      case 'low':
        return 'Niski';
      default:
        return 'Brak';
    }
  };
  
  const handleRemoveTask = (taskId: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć to zadanie z projektu? Karta pozostanie na tablicy Kanban.')) {
      removeTaskFromProject(project.id, taskId);
    }
  };

  const handleAddTask = () => {
    // Tutaj będzie dodany dialog wyboru karty do dodania do projektu
    alert('Funkcja dodawania zadań do projektu będzie dostępna wkrótce.');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Zadania w projekcie</h3>
        <button
          onClick={handleAddTask}
          className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Dodaj zadanie
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p>Ładowanie zadań...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Ten projekt nie ma jeszcze żadnych zadań.
          </p>
          <button
            onClick={handleAddTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Dodaj pierwsze zadanie
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div
              key={task.taskId}
              className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="mt-1 mr-3">
                    {getCardTypeIcon(task.boardId || '')}
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="flex items-center text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        <Clock className="h-3 w-3 mr-1" />
                        {task.status}
                      </div>
                      
                      {task.assignee && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <User className="h-3 w-3 mr-1" />
                          {task.assignee}
                        </div>
                      )}
                      
                      {task.dueDate && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          {task.dueDate}
                        </div>
                      )}
                      
                      {task.priority && (
                        <div className={`flex items-center text-xs px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                          <Flag className="h-3 w-3 mr-1" />
                          {getPriorityLabel(task.priority)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => handleRemoveTask(task.taskId)}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Usuń z projektu"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectTasksTab;