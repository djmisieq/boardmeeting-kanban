'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/navbar';
import KanbanBoard from '@/components/kanban/kanban-board';
import { useKanbanStore } from '@/store/use-kanban-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { generateBoardStatistics } from '@/lib/board-utils';
import { CardType } from '@/lib/types';
import { Search, Filter, Users, Plus, ChevronDown, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ProblemsBoard() {
  const searchParams = useSearchParams();
  const departmentIdParam = searchParams.get('departmentId');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  
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
  
  // Get or create the problems board for the selected department
  const boardId = selectedDepartment?.boardIds.problemsBoard || 
    (selectedDepartmentId ? `${selectedDepartmentId}-problems` : 'problems-board');
    
  // Initialize board if it doesn't exist
  useEffect(() => {
    if (selectedDepartmentId && !boards[boardId]) {
      initializeBoard(boardId, 'problems', selectedDepartmentId, []);
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
              <h1 className="text-3xl font-bold">{selectedDepartment?.name || 'Team'} Problems</h1>
              
              {departments.length > 1 && (
                <div className="relative ml-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-gray-500" />
                    <select
                      className="appearance-none bg-transparent pr-8 py-1 focus:outline-none text-gray-700 dark:text-gray-300"
                      value={selectedDepartmentId || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          window.location.href = `/boards/problems?departmentId=${e.target.value}`;
                        } else {
                          window.location.href = `/boards/problems`;
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
                placeholder="Search problems..."
                className="pl-9 pr-4 py-2 border rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
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
            
            <button 
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Report Problem
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-medium mb-4">Problem Resolution Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium mb-2">1. New</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Problems are reported and documented
              </p>
              <div className="mt-2 text-sm">
                <span className="font-medium">{stats?.cardsByStatus?.New || stats?.cardsByStatus?.['New'] || 0}</span> problems
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium mb-2">2. Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Root cause investigation and impact assessment
              </p>
              <div className="mt-2 text-sm">
                <span className="font-medium">{stats?.cardsByStatus?.Analysis || stats?.cardsByStatus?.['Analysis'] || 0}</span> problems
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium mb-2">3. Corrective Actions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Implementing solutions to fix the problem
              </p>
              <div className="mt-2 text-sm">
                <span className="font-medium">{stats?.cardsByStatus?.['Corrective Actions'] || 0}</span> problems
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium mb-2">4. Resolved</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Problem fixed and verified with preventive measures
              </p>
              <div className="mt-2 text-sm">
                <span className="font-medium">{stats?.cardsByStatus?.Resolved || stats?.cardsByStatus?.['Resolved'] || 0}</span> problems
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <h2 className="text-xl font-medium mb-4">Problem Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-900 rounded-lg px-4 py-3 border border-red-200 dark:border-red-800 flex items-center">
              <div className="bg-red-100 dark:bg-red-800 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-red-700 dark:text-red-200">
                  {stats?.totalCards || 0}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Problems</div>
                <div className="text-lg font-medium">
                  {stats?.overdueTasks || 0} overdue
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900 rounded-lg px-4 py-3 border border-amber-200 dark:border-amber-800 flex items-center">
              <div className="bg-amber-100 dark:bg-amber-800 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
                <Clock className="h-6 w-6 text-amber-700 dark:text-amber-200" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Avg Resolution Time</div>
                <div className="text-lg font-medium">
                  {stats?.averageResolutionTime?.toFixed(1) || 0} days
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900 rounded-lg px-4 py-3 border border-green-200 dark:border-green-800 flex items-center">
              <div className="bg-green-100 dark:bg-green-800 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
                <CheckCircle className="h-6 w-6 text-green-700 dark:text-green-200" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Resolution Rate</div>
                <div className="text-lg font-medium">
                  {stats?.completionRate.toFixed(0) || 0}% resolved
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Empty state */}
        {isEmpty && (
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center my-10">
            <h3 className="text-xl font-semibold mb-2">No problems reported</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Track and manage problems your team encounters. Report issues, analyze their root causes, and implement corrective actions.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => setShowReportModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Report First Problem
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
            searchFilter={searchQuery}
            priorityFilter={filterPriority}
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
      
      {/* Report Problem Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Report New Problem</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              // In a real app, this would submit the form and add a new card
              setShowReportModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Problem Title</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Briefly describe the problem"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Detailed Description</label>
                  <textarea
                    className="w-full p-2 border rounded-md h-24 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Provide as much detail as possible about the problem"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  >
                    <option value="">Select priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assign To (Optional)</label>
                  <select
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Unassigned</option>
                    {selectedDepartment?.members.map(member => (
                      <option key={member} value={member}>{member}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Report Problem
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}