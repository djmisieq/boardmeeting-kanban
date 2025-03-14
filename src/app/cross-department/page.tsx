'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/navbar';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useKanbanStore } from '@/store/use-kanban-store';
import { CardType, ColumnType, BoardType } from '@/lib/types';
import { 
  Search, Filter, Users, Clock, Calendar, AlertCircle, 
  CheckCircle, Clipboard, Gauge, Lightbulb
} from 'lucide-react';
import Link from 'next/link';

export default function CrossDepartmentView() {
  const { departments } = useDepartmentsStore();
  const { boards, getBoardsForDepartment } = useKanbanStore();
  
  const [activeTab, setActiveTab] = useState<'tasks' | 'problems' | 'ideas'>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  // Get all members across departments
  const allMembers = Array.from(new Set(
    departments.flatMap(dept => dept.members)
  )).sort();
  
  // Get all items of current type across departments
  const getFilteredItems = () => {
    let allItems: {
      card: CardType;
      department: string;
      departmentId: string;
      boardId: string;
      columnId: string;
      status: string;
    }[] = [];
    
    // Loop through all departments
    departments.forEach(dept => {
      // Filter by department if filter is applied
      if (filterDepartment && dept.id !== filterDepartment) return;
      
      // Get boards for this department
      const departmentBoards = getBoardsForDepartment(dept.id, activeTab);
      
      // Process each board
      departmentBoards.forEach(board => {
        // Process each column
        board.columns.forEach(column => {
          // Filter by status if filter is applied
          if (filterStatus && !column.title.toLowerCase().includes(filterStatus.toLowerCase())) return;
          
          // Process each card
          column.cards.forEach(card => {
            // Filter by search query
            if (searchQuery && 
                !card.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
                !card.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
              return;
            }
            
            // Filter by assignee
            if (filterAssignee && card.assignee !== filterAssignee) return;
            
            // Filter by priority
            if (filterPriority && card.priority !== filterPriority) return;
            
            // Add item to the list
            allItems.push({
              card,
              department: dept.name,
              departmentId: dept.id,
              boardId: board.id,
              columnId: column.id,
              status: column.title
            });
          });
        });
      });
    });
    
    // Sort by due date (if available)
    allItems.sort((a, b) => {
      // Put items with no due date at the end
      if (!a.card.dueDate && !b.card.dueDate) return 0;
      if (!a.card.dueDate) return 1;
      if (!b.card.dueDate) return -1;
      
      // Sort by due date
      return new Date(a.card.dueDate).getTime() - new Date(b.card.dueDate).getTime();
    });
    
    return allItems;
  };
  
  // Get filtered items
  const filteredItems = getFilteredItems();
  
  // Get board link for an item
  const getBoardLink = (item: {departmentId: string, boardId: string}) => {
    switch (activeTab) {
      case 'tasks':
        return `/boards/tasks?departmentId=${item.departmentId}`;
      case 'problems':
        return `/boards/problems?departmentId=${item.departmentId}`;
      case 'ideas':
        return `/boards/ideas?departmentId=${item.departmentId}`;
      default:
        return '#';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    const lowercaseStatus = status.toLowerCase();
    
    if (lowercaseStatus.includes('done') || 
        lowercaseStatus.includes('completed') || 
        lowercaseStatus.includes('resolved') || 
        lowercaseStatus.includes('implemented')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    }
    
    if (lowercaseStatus.includes('progress') || 
        lowercaseStatus.includes('implementing') || 
        lowercaseStatus.includes('action') || 
        lowercaseStatus.includes('analysis')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    }
    
    if (lowercaseStatus.includes('approved')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
    }
    
    if (lowercaseStatus.includes('new') || 
        lowercaseStatus.includes('todo') || 
        lowercaseStatus.includes('proposed')) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
    
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  };
  
  // Get priority icon and color
  const getPriorityInfo = (priority?: string) => {
    switch (priority) {
      case 'high':
        return { 
          icon: <AlertCircle className="h-4 w-4" />, 
          color: 'text-red-600 dark:text-red-400' 
        };
      case 'medium':
        return { 
          icon: <Clock className="h-4 w-4" />, 
          color: 'text-amber-600 dark:text-amber-400' 
        };
      case 'low':
        return { 
          icon: <CheckCircle className="h-4 w-4" />, 
          color: 'text-green-600 dark:text-green-400' 
        };
      default:
        return { 
          icon: <span>-</span>, 
          color: 'text-gray-600 dark:text-gray-400' 
        };
    }
  };
  
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Cross-Department View</h1>
        
        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'tasks' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('tasks')}
          >
            <Clipboard className="h-4 w-4 inline mr-1" />
            Tasks
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'problems' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('problems')}
          >
            <Gauge className="h-4 w-4 inline mr-1" />
            Problems
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'ideas' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-600 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('ideas')}
          >
            <Lightbulb className="h-4 w-4 inline mr-1" />
            Ideas
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          
          <div>
            <select 
              className="px-4 py-2 border rounded-lg"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select 
              className="px-4 py-2 border rounded-lg"
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
            >
              <option value="">All Assignees</option>
              {allMembers.map(member => (
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
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          
          <div>
            <select 
              className="px-4 py-2 border rounded-lg"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="progress">In Progress</option>
              <option value="done">Done</option>
              <option value="new">New</option>
              <option value="analysis">Analysis</option>
              <option value="resolved">Resolved</option>
              <option value="proposed">Proposed</option>
              <option value="approved">Approved</option>
              <option value="implemented">Implemented</option>
            </select>
          </div>
        </div>
        
        {/* Summary */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-medium">
            {activeTab === 'tasks' ? 'Tasks' : 
             activeTab === 'problems' ? 'Problems' : 'Ideas'} 
            {filterDepartment ? 
              ` for ${departments.find(d => d.id === filterDepartment)?.name}` : 
              ' across all departments'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Showing {filteredItems.length} {activeTab} 
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </p>
        </div>
        
        {/* Results */}
        {filteredItems.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item, index) => {
                  const priorityInfo = getPriorityInfo(item.card.priority);
                  const isOverdue = item.card.dueDate ? new Date(item.card.dueDate) < new Date() : false;
                  
                  return (
                    <tr key={`${item.boardId}-${item.card.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{item.card.title}</div>
                        {item.card.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {item.card.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <Users className="h-3 w-3 inline mr-1" />
                          {item.department}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {item.card.assignee || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.card.dueDate ? (
                          <div className={`text-sm flex items-center ${isOverdue ? 'text-red-600' : ''}`}>
                            <Calendar className="h-3 w-3 mr-1" />
                            {item.card.dueDate}
                            {isOverdue && ' (Overdue)'}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm flex items-center ${priorityInfo.color}`}>
                          {priorityInfo.icon}
                          <span className="ml-1">
                            {item.card.priority ? 
                              item.card.priority.charAt(0).toUpperCase() + item.card.priority.slice(1) : 
                              '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link 
                          href={getBoardLink(item)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Board →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
            <h3 className="text-xl font-medium mb-2">No items found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery || filterDepartment || filterAssignee || filterPriority || filterStatus ? 
                'Try adjusting your filters to see more results.' : 
                `No ${activeTab} have been created yet.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}