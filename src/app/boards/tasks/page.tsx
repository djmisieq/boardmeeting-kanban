'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import KanbanBoard from '@/components/kanban/kanban-board';
import { useKanbanStore } from '@/store/use-kanban-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { generateBoardStatistics } from '@/lib/board-utils';
import { CardType } from '@/lib/types';
import { Search, Filter, Users, Plus, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function TasksBoard() {
  const searchParams = useSearchParams();
  const departmentIdParam = searchParams.get('departmentId');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  
  const { 
    departments, 
    selectedDepartmentId, 
    selectDepartment 
  } = useDepartmentsStore();
  
  const { 
    getBoard, 
    initializeBoard,
    boards
  } = useKanbanStore();
  
  // Select the department from URL params if provided
  useEffect(() => {
    if (departmentIdParam) {
      selectDepartment(departmentIdParam);
    }
  }, [departmentIdParam, selectDepartment]);
  
  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);
  
  // Get or create the tasks board for the selected department
  const boardId = selectedDepartment?.boardIds.tasksBoard || 
    (selectedDepartmentId ? `${selectedDepartmentId}-tasks` : 'tasks-board');
    
  // Initialize board if it doesn't exist
  useEffect(() => {
    if (selectedDepartmentId && !boards[boardId]) {
      initializeBoard(boardId, 'tasks', selectedDepartmentId, []);
    }
  }, [selectedDepartmentId, boardId, boards, initializeBoard]);
  
  const board = getBoard(boardId);
  
  // Calculate board statistics
  const stats = board ? generateBoardStatistics(board) : null;
  
  // Show announcement for empty boards
  const isEmpty = stats?.totalCards === 0;
  
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">{selectedDepartment?.name || 'Team'} Tasks</h1>
              
              {departments.length > 1 && (
                <div className="relative ml-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-gray-500" />
                    <select
                      className="appearance-none bg-transparent pr-8 py-1 focus:outline-none text-gray-700 dark:text-gray-300"
                      value={selectedDepartmentId || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          window.location.href = `/boards/tasks?departmentId=${e.target.value}`;
                        } else {
                          window.location.href = `/boards/tasks`;
                        }
                      }}
                    >
                      <option value="">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
              )}
            </div>
            {selectedDepartment?.description && (
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {selectedDepartment.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                className="pl-9 pr-4 py-2 border rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <div>
              <select 
                className="px-4 py-2 border rounded-lg"
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
              >
                <option value="">Filter by assignee</option>
                {selectedDepartment?.members.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select 
                className="px-4 py-2 border rounded-lg"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="">Filter by priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <h2 className="text-xl font-medium mb-4">Task Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg px-4 py-3 border border-blue-200 dark:border-blue-800 flex items-center">
              <div className="bg-blue-100 dark:bg-blue-800 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-blue-700 dark:text-blue-200">
                  {stats?.totalCards || 0}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Tasks</div>
                <div className="text-lg font-medium">{board?.columns[0]?.title || 'To Do'}: {stats?.cardsByStatus?.[board?.columns[0]?.title || 'To Do'] || 0}</div>
              </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900 rounded-lg px-4 py-3 border border-amber-200 dark:border-amber-800 flex items-center">
              <div className="bg-amber-100 dark:bg-amber-800 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-200">
                  {stats?.cardsByStatus?.[board?.columns[1]?.title || 'In Progress'] || 0}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">In Progress</div>
                <div className="text-lg font-medium">{stats?.overdueTasks || 0} overdue tasks</div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900 rounded-lg px-4 py-3 border border-green-200 dark:border-green-800 flex items-center">
              <div className="bg-green-100 dark:bg-green-800 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-green-700 dark:text-green-200">
                  {stats?.cardsByStatus?.[board?.columns[2]?.title || 'Done'] || 0}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
                <div className="text-lg font-medium">{stats?.completionRate.toFixed(0) || 0}% completion rate</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Empty state */}
        {isEmpty && (
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center my-10">
            <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Get started by adding tasks to your board. You can add tasks to track work items, issues, or anything your team needs to accomplish.
            </p>
            <div className="flex justify-center">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Add First Task
              </button>
            </div>
          </div>
        )}
        
        {/* Kanban Board */}
        {board && (
          <KanbanBoard 
            boardId={boardId} 
            title="" 
            initialColumns={board.columns} 
            departmentId={selectedDepartmentId || undefined}
          />
        )}
        
        {/* Link to view all departments */}
        {selectedDepartmentId && (
          <div className="mt-6 text-center">
            <Link href="/departments" className="text-blue-600 hover:text-blue-800">
              Manage All Departments →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}