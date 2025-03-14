'use client';

import Navbar from '@/components/layout/navbar';
import KanbanBoard, { ColumnType } from '@/components/kanban/kanban-board';
import { useState } from 'react';
import { Search, Lightbulb, Plus } from 'lucide-react';

// Mock data for ideas
const initialColumns: ColumnType[] = [
  {
    id: 'proposed',
    title: 'Proposed Ideas',
    cards: [
      {
        id: 'idea-1',
        title: 'Implement dark mode theme',
        description: 'Add dark mode support across all applications',
        assignee: 'UX Team',
        priority: 'medium',
      },
      {
        id: 'idea-2',
        title: 'Automated testing framework',
        description: 'Develop a comprehensive automated testing framework to improve code quality',
        assignee: 'QA Team',
        priority: 'high',
      },
      {
        id: 'idea-3',
        title: 'Virtual team-building events',
        description: 'Organize regular virtual team-building activities for remote teams',
        assignee: 'HR Team',
        priority: 'low',
      },
    ],
  },
  {
    id: 'approved',
    title: 'Approved',
    cards: [
      {
        id: 'idea-4',
        title: 'New onboarding process',
        description: 'Revamp the employee onboarding process to improve experience',
        assignee: 'HR Team',
        dueDate: '2025-04-15',
        priority: 'medium',
      },
      {
        id: 'idea-5',
        title: 'Knowledge sharing sessions',
        description: 'Weekly knowledge sharing sessions where teams can present their work',
        assignee: 'Team Leads',
        dueDate: '2025-03-30',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'implementing',
    title: 'In Implementation',
    cards: [
      {
        id: 'idea-6',
        title: 'API documentation portal',
        description: 'Create a centralized portal for all API documentation',
        assignee: 'Dev Team',
        dueDate: '2025-04-10',
        priority: 'high',
      },
      {
        id: 'idea-7',
        title: 'Customer feedback system',
        description: 'Implement an improved system for collecting and processing customer feedback',
        assignee: 'Product Team',
        dueDate: '2025-03-25',
        priority: 'high',
      },
    ],
  },
  {
    id: 'completed',
    title: 'Implemented',
    cards: [
      {
        id: 'idea-8',
        title: 'Code review guidelines',
        description: 'Established standardized guidelines for code reviews',
        assignee: 'Dev Team',
        dueDate: '2025-03-05',
        priority: 'medium',
      },
      {
        id: 'idea-9',
        title: 'Flexible work schedule policy',
        description: 'Implemented new policy allowing more flexible working hours',
        assignee: 'HR Team',
        dueDate: '2025-02-28',
        priority: 'medium',
      },
    ],
  },
];

export default function IdeasBoard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArea, setFilterArea] = useState('');
  
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Improvement Ideas</h1>
          
          <div className="flex space-x-4">
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
            
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Submit Idea
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Recently Implemented Ideas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium">Code review guidelines</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Created consistent guidelines for all code reviews
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">Implemented by</span>
                <span className="text-xs font-medium ml-1">Dev Team</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium">Flexible work schedule policy</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                New policy allowing more flexible working hours
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">Implemented by</span>
                <span className="text-xs font-medium ml-1">HR Team</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium">Weekly team standups</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Introduced weekly standup meetings for all teams
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">Implemented by</span>
                <span className="text-xs font-medium ml-1">Team Leads</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <h2 className="text-xl font-medium mb-4">Ideas Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
              <Lightbulb className="h-10 w-10 text-yellow-500 mr-3" />
              <div>
                <div className="text-xl font-bold">3</div>
                <div className="text-sm text-gray-500">Proposed Ideas</div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mr-3">2</div>
              <div>
                <div className="text-xl font-bold">Approved</div>
                <div className="text-sm text-gray-500">Ready for Implementation</div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mr-3">2</div>
              <div>
                <div className="text-xl font-bold">In Progress</div>
                <div className="text-sm text-gray-500">Being Implemented</div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 mr-3">2</div>
              <div>
                <div className="text-xl font-bold">Implemented</div>
                <div className="text-sm text-gray-500">Ideas in Action</div>
              </div>
            </div>
          </div>
        </div>
        
        <KanbanBoard 
          boardId="ideas-board" 
          title="" 
          initialColumns={initialColumns} 
        />
      </div>
    </div>
  );
}