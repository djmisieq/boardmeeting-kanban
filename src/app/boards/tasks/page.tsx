'use client';

import Navbar from '@/components/layout/navbar';
import KanbanBoard, { ColumnType } from '@/components/kanban/kanban-board';
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

// Mock data for initial tasks
const initialColumns: ColumnType[] = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      {
        id: 'task-1',
        title: 'Update documentation',
        description: 'Update the user manual with new features from last sprint',
        assignee: 'Anna K.',
        dueDate: '2025-03-20',
        priority: 'medium',
      },
      {
        id: 'task-2',
        title: 'Fix login page bug',
        description: 'Users are experiencing intermittent login failures',
        assignee: 'Mike S.',
        dueDate: '2025-03-18',
        priority: 'high',
      },
      {
        id: 'task-3',
        title: 'Prepare quarterly report',
        description: 'Compile statistics and create presentation for board meeting',
        assignee: 'Tom R.',
        dueDate: '2025-03-25',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    cards: [
      {
        id: 'task-4',
        title: 'Design new landing page',
        description: 'Create mockups for the new marketing campaign',
        assignee: 'Sarah L.',
        dueDate: '2025-03-19',
        priority: 'medium',
      },
      {
        id: 'task-5',
        title: 'Implement payment gateway',
        description: 'Integrate Stripe API with checkout process',
        assignee: 'John D.',
        dueDate: '2025-03-17',
        priority: 'high',
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [
      {
        id: 'task-6',
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated builds and deployments',
        assignee: 'Alex P.',
        dueDate: '2025-03-10',
        priority: 'high',
      },
      {
        id: 'task-7',
        title: 'Update dependencies',
        description: 'Update all npm packages to latest versions',
        assignee: 'Mike S.',
        dueDate: '2025-03-08',
        priority: 'low',
      },
      {
        id: 'task-8',
        title: 'Code review',
        description: 'Review pull requests for new features',
        assignee: 'Anna K.',
        dueDate: '2025-03-12',
        priority: 'medium',
      },
    ],
  },
];

export default function TasksBoard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Task Management</h1>
          
          <div className="flex space-x-4">
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
                <option value="Anna K.">Anna K.</option>
                <option value="Mike S.">Mike S.</option>
                <option value="Tom R.">Tom R.</option>
                <option value="Sarah L.">Sarah L.</option>
                <option value="John D.">John D.</option>
                <option value="Alex P.">Alex P.</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <h2 className="text-xl font-medium mb-4">Task Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold">8</div>
              <div className="text-sm text-gray-500">Total Tasks</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-500">3</div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500">3</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </div>
        
        <KanbanBoard 
          boardId="tasks-board" 
          title="" 
          initialColumns={initialColumns} 
        />
      </div>
    </div>
  );
}