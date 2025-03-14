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
import { Search, Filter, Users, Plus, ChevronDown, Lightbulb, CheckCircle, TrendingUp } from 'lucide-react';

export default function IdeasBoard() {
  const searchParams = useSearchParams();
  const departmentIdParam = searchParams.get('departmentId');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
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
  
  // Get or create the ideas board for the selected department
  const boardId = selectedDepartment?.boardIds.ideasBoard || 
    (selectedDepartmentId ? `${selectedDepartmentId}-ideas` : 'ideas-board');
    
  // Initialize board if it doesn't exist
  useEffect(() => {
    if (selectedDepartmentId && !boards[boardId]) {
      initializeBoard(boardId, 'ideas', selectedDepartmentId, []);
    }
  }, [selectedDepartmentId, boardId, boards, initializeBoard]);
  
  const board = getBoard(boardId);
  
  // Calculate board statistics
  const stats = board ? generateBoardStatistics(board) : null;
  
  // Show announcement for empty boards
  const isEmpty = stats?.totalCards === 0;
  
  // Calculate implementation rate
  const implementedCount = stats?.cardsByStatus?.Implemented || 
    stats?.cardsByStatus?.['Implemented'] || 0;
    
  const implementationRate = stats?.totalCards ? 
    (implementedCount / stats.totalCards * 100) : 0;
    
  // Get count of ideas in implementation
  const inImplementationCount = stats?.cardsByStatus?.['In Implementation'] || 0;
  
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">{selectedDepartment?.name || 'Team'} Improvement Ideas</h1>
              
              {departments.length > 1 && (
                <div className="relative ml-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-gray-500" />
                    <select
                      className="appearance-none bg-transparent pr-8 py-1 focus:outline-none text-gray-700 dark:text-gray-300"
                      value={selectedDepartmentId || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          window.location.href = `/boards/ideas?departmentId=${e.target.value}`;
                        } else {
                          window.location.href = `/boards/ideas`;
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
                placeholder="Search ideas..."
                className="pl-9 pr-4 py-2 border rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <div>
              <select 
                className="px-4 py-2 border rounded-lg"
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
              >
                <option value="">Filter by area</option>
                <option value="UX">UX / Design</option>
                <option value="Development">Development</option>
                <option value="Process">Process</option>
                <option value="HR">HR / Management</option>
                <option value="Product">Product</option>
              </select>
            </div>
            
            <button 
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Submit Idea
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-medium mb-4">Recently Implemented Ideas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {board?.columns.find(col => col.title === 'Implemented')?.cards.slice(0, 3).map((card, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium">{card.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {card.description || 'No description provided'}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500">Implemented by</span>
                  <span className="text-xs font-medium ml-1">{card.assignee || 'Unassigned'}</span>
                </div>
              </div>
            ))}
            
            {(!board?.columns.find(col => col.title === 'Implemented')?.cards.length) && (
              <div className="col-span-3 text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No ideas have been implemented yet.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <h2 className="text-xl font-medium mb-4">Ideas Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 dark:bg-purple-900 rounded-lg px-4 py-3 border border-purple-200 dark:border-purple-800 flex items-center">
              <div className="bg-purple-100 dark:bg-purple-800 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
                <Lightbulb className="h-6 w-6 text-purple-700 dark:text-purple-200" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Ideas</div>
                <div className="text-lg font-medium">
                  {stats?.totalCards || 0} ideas
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg px-4 py-3 border border-blue-200 dark:border-blue-800 flex items-center">
              <div className="bg-blue-100 dark:bg-blue-800 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="h-6 w-6 text-blue-700 dark:text-blue-200" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">In Implementation</div>
                <div className="text-lg font-medium">
                  {inImplementationCount || 0} ideas
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900 rounded-lg px-4 py-3 border border-green-200 dark:border-green-800 flex items-center">
              <div className="bg-green-100 dark:bg-green-800 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
                <CheckCircle className="h-6 w-6 text-green-700 dark:text-green-200" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Implementation Rate</div>
                <div className="text-lg font-medium">
                  {implementationRate.toFixed(0)}% implemented
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg px-4 py-3 border border-yellow-200 dark:border-yellow-800 flex items-center">
              <div className="bg-yellow-100 dark:bg-yellow-800 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-200">
                  {stats?.cardsByStatus?.['Proposed Ideas'] || 0}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">New Ideas</div>
                <div className="text-lg font-medium">
                  Awaiting review
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Empty state */}
        {isEmpty && (
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center my-10">
            <h3 className="text-xl font-semibold mb-2">No improvement ideas yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Submit ideas to improve processes, products, or workplace. Ideas can be reviewed, approved, and implemented to drive continuous improvement.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit First Idea
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
      
      {/* Submit Idea Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Submit Improvement Idea</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              // In a real app, this would submit the form and add a new card
              setShowSubmitModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Idea Title</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Briefly describe your idea"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Detailed Description</label>
                  <textarea
                    className="w-full p-2 border rounded-md h-24 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Explain your idea in detail, including potential benefits"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Area of Improvement</label>
                  <select
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  >
                    <option value="">Select area</option>
                    <option value="UX">UX / Design</option>
                    <option value="Development">Development</option>
                    <option value="Process">Process Improvement</option>
                    <option value="HR">HR / Management</option>
                    <option value="Product">Product Enhancement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expected Benefit</label>
                  <select
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  >
                    <option value="">Select benefit</option>
                    <option value="time">Time Saving</option>
                    <option value="quality">Quality Improvement</option>
                    <option value="cost">Cost Reduction</option>
                    <option value="satisfaction">Customer Satisfaction</option>
                    <option value="employee">Employee Satisfaction</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Submit Idea
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