'use client';

import Navbar from '@/components/layout/navbar';
import KanbanBoard, { ColumnType } from '@/components/kanban/kanban-board';
import { useState } from 'react';
import { Search, Filter, AlertTriangle, PlusCircle } from 'lucide-react';

// Mock data for problems
const initialColumns: ColumnType[] = [
  {
    id: 'new',
    title: 'New',
    cards: [
      {
        id: 'problem-1',
        title: 'Server performance issues',
        description: 'Application response time has increased significantly in the last week',
        assignee: 'IT Team',
        dueDate: '2025-03-18',
        priority: 'high',
      },
      {
        id: 'problem-2',
        title: 'Missing data in reports',
        description: 'Financial reports are missing data from the European office',
        assignee: 'Finance Team',
        dueDate: '2025-03-20',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'analysis',
    title: 'Analysis',
    cards: [
      {
        id: 'problem-3',
        title: 'Customer complaints about new UI',
        description: 'Several customers have reported confusion with the new interface',
        assignee: 'UX Team',
        dueDate: '2025-03-16',
        priority: 'high',
      },
      {
        id: 'problem-4',
        title: 'Email delivery delays',
        description: 'Notification emails are being delayed by up to 2 hours',
        assignee: 'IT Team',
        dueDate: '2025-03-19',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'action',
    title: 'Corrective Actions',
    cards: [
      {
        id: 'problem-5',
        title: 'Integration test failures',
        description: 'CI pipeline is failing due to intermittent test failures',
        assignee: 'Dev Team',
        dueDate: '2025-03-15',
        priority: 'high',
      },
    ],
  },
  {
    id: 'resolved',
    title: 'Resolved',
    cards: [
      {
        id: 'problem-6',
        title: 'Login page security vulnerability',
        description: 'XSS vulnerability identified in login form',
        assignee: 'Security Team',
        dueDate: '2025-03-10',
        priority: 'high',
      },
      {
        id: 'problem-7',
        title: 'Broken links in documentation',
        description: 'Several external links in the user manual are broken',
        assignee: 'Documentation Team',
        dueDate: '2025-03-08',
        priority: 'low',
      },
    ],
  },
];

export default function ProblemsBoard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Problem Tracking</h1>
          
          <div className="flex space-x-4">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              onClick={() => setShowReportModal(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Report Problem
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Problem Resolution Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">1. New</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Problems are reported and documented
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">2. Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Root cause investigation and impact assessment
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">3. Corrective Actions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Implementing solutions to fix the problem
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">4. Resolved</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Problem fixed and verified with preventive measures
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <h2 className="text-xl font-medium mb-4">Problems Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertTriangle className="h-10 w-10 text-red-500 mr-3" />
              <div>
                <div className="text-xl font-bold">2</div>
                <div className="text-sm text-gray-500">New Problems</div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 mr-3">2</div>
              <div>
                <div className="text-xl font-bold">In Analysis</div>
                <div className="text-sm text-gray-500">Under Investigation</div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mr-3">1</div>
              <div>
                <div className="text-xl font-bold">In Progress</div>
                <div className="text-sm text-gray-500">Being Resolved</div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 mr-3">2</div>
              <div>
                <div className="text-xl font-bold">Resolved</div>
                <div className="text-sm text-gray-500">Problems Fixed</div>
              </div>
            </div>
          </div>
        </div>
        
        <KanbanBoard 
          boardId="problems-board" 
          title="" 
          initialColumns={initialColumns} 
        />
      </div>
    </div>
  );
}