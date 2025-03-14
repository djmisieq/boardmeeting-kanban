'use client';

import { useEffect, useState } from 'react';
import { useKanbanStore } from '@/store/use-kanban-store';
import { BoardStatistics, getDepartmentBoardsStatistics } from '@/lib/board-utils';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

interface DepartmentMetricsProps {
  departmentId: string;
  departmentName: string;
  showLinks?: boolean;
  compact?: boolean;
}

export default function DepartmentMetrics({ 
  departmentId, 
  departmentName,
  showLinks = true,
  compact = false
}: DepartmentMetricsProps) {
  const { getBoardsForDepartment } = useKanbanStore();
  const [stats, setStats] = useState<{
    tasks: BoardStatistics;
    problems: BoardStatistics;
    ideas: BoardStatistics;
  } | null>(null);
  
  // Calculate department statistics
  useEffect(() => {
    if (departmentId) {
      const departmentBoards = getBoardsForDepartment(departmentId);
      const boardStats = getDepartmentBoardsStatistics(departmentBoards);
      setStats(boardStats);
    }
  }, [departmentId, getBoardsForDepartment]);
  
  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    );
  }
  
  // Different layout based on compact mode
  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="font-semibold">{departmentName} Metrics</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
              <span>Tasks</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">{stats.tasks.totalCards}</span>
              <span className="text-green-500 text-sm">
                {stats.tasks.completionRate.toFixed(0)}% done
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <span>Problems</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">{stats.problems.totalCards}</span>
              <span className="text-red-500 text-sm">
                {stats.problems.overdueTasks} overdue
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
              <span>Ideas</span>
            </div>
            <span className="font-medium">{stats.ideas.totalCards}</span>
          </div>
          
          {showLinks && (
            <div className="mt-4 pt-4 border-t dark:border-gray-700">
              <Link
                href={`/dashboard?departmentId=${departmentId}`}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
              >
                View Dashboard →
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Full version
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold">{departmentName} Metrics</h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tasks Stats */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium">Tasks</h4>
            </div>
            <div className="text-3xl font-bold">
              {stats.tasks.totalCards}
            </div>
            <div className="space-y-1 mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Completion Rate:</span>
                <span className="font-medium">{stats.tasks.completionRate.toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">To Do:</span>
                <span className="font-medium">{Object.entries(stats.tasks.cardsByStatus)
                  .find(([key]) => key.includes('To Do') || key.includes('ToDo'))?.[1] || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">In Progress:</span>
                <span className="font-medium">{Object.entries(stats.tasks.cardsByStatus)
                  .find(([key]) => key.includes('Progress'))?.[1] || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                <span className="font-medium">{Object.entries(stats.tasks.cardsByStatus)
                  .find(([key]) => key.includes('Done') || key.includes('Completed'))?.[1] || 0}</span>
              </div>
            </div>
            
            {showLinks && (
              <div className="mt-4">
                <Link
                  href={`/boards/tasks?departmentId=${departmentId}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
                >
                  View Tasks Board →
                </Link>
              </div>
            )}
          </div>
          
          {/* Problems Stats */}
          <div className="space-y-2">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
              <h4 className="font-medium">Problems</h4>
            </div>
            <div className="text-3xl font-bold">
              {stats.problems.totalCards}
            </div>
            <div className="space-y-1 mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Resolution Time:</span>
                <span className="font-medium">{stats.problems.averageResolutionTime?.toFixed(1) || 'N/A'} days</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">New:</span>
                <span className="font-medium">{Object.entries(stats.problems.cardsByStatus)
                  .find(([key]) => key.includes('New'))?.[1] || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">In Analysis:</span>
                <span className="font-medium">{Object.entries(stats.problems.cardsByStatus)
                  .find(([key]) => key.includes('Analysis'))?.[1] || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Resolved:</span>
                <span className="font-medium">{Object.entries(stats.problems.cardsByStatus)
                  .find(([key]) => key.includes('Resolved'))?.[1] || 0}</span>
              </div>
            </div>
            
            {showLinks && (
              <div className="mt-4">
                <Link
                  href={`/boards/problems?departmentId=${departmentId}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
                >
                  View Problems Board →
                </Link>
              </div>
            )}
          </div>
          
          {/* Ideas Stats */}
          <div className="space-y-2">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="font-medium">Improvement Ideas</h4>
            </div>
            <div className="text-3xl font-bold">
              {stats.ideas.totalCards}
            </div>
            <div className="space-y-1 mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Implementation Rate:</span>
                <span className="font-medium">{(Object.entries(stats.ideas.cardsByStatus)
                  .find(([key]) => key.includes('Implemented'))?.[1] || 0) / (stats.ideas.totalCards || 1) * 100}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Proposed:</span>
                <span className="font-medium">{Object.entries(stats.ideas.cardsByStatus)
                  .find(([key]) => key.includes('Proposed'))?.[1] || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">In Implementation:</span>
                <span className="font-medium">{Object.entries(stats.ideas.cardsByStatus)
                  .find(([key]) => key.includes('Implementation'))?.[1] || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Implemented:</span>
                <span className="font-medium">{Object.entries(stats.ideas.cardsByStatus)
                  .find(([key]) => key.includes('Implemented'))?.[1] || 0}</span>
              </div>
            </div>
            
            {showLinks && (
              <div className="mt-4">
                <Link
                  href={`/boards/ideas?departmentId=${departmentId}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
                >
                  View Ideas Board →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}