'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/navbar';
import { useKanbanStore } from '@/store/use-kanban-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { getDepartmentBoardsStatistics } from '@/lib/board-utils';
import { BoardType, CardType } from '@/lib/types';
import Link from 'next/link';
import { 
  CheckSquare, AlertCircle, Lightbulb, Calendar, 
  ChevronDown, ChevronUp, Search, Filter, Users, ExternalLink 
} from 'lucide-react';

export default function OverviewPage() {
  const [expandedDepartments, setExpandedDepartments] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'tasks' | 'problems' | 'ideas'>('all');
  const [sortBy, setSortBy] = useState<'department' | 'date' | 'priority'>('department');
  
  const { departments } = useDepartmentsStore();
  const { boards, getBoardsForDepartment } = useKanbanStore();
  
  // Initialize all departments as expanded
  useEffect(() => {
    const expanded: Record<string, boolean> = {};
    departments.forEach(dept => {
      expanded[dept.id] = true;
    });
    setExpandedDepartments(expanded);
  }, [departments]);
  
  const toggleDepartment = (deptId: string) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
  };
  
  // Get all cards from all departments
  const getAllCards = () => {
    let allCards: {
      card: CardType;
      departmentId: string;
      departmentName: string;
      boardType: 'tasks' | 'problems' | 'ideas';
      columnName: string;
    }[] = [];
    
    departments.forEach(dept => {
      const departmentBoards = getBoardsForDepartment(dept.id);
      
      departmentBoards.forEach(board => {
        if (filterType !== 'all' && board.type !== filterType) return;
        
        board.columns.forEach(column => {
          column.cards.forEach(card => {
            if (
              searchTerm && 
              !card.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
              !card.description?.toLowerCase().includes(searchTerm.toLowerCase())
            ) {
              return;
            }
            
            allCards.push({
              card,
              departmentId: dept.id,
              departmentName: dept.name,
              boardType: board.type,
              columnName: column.title
            });
          });
        });
      });
    });
    
    // Sort cards based on sort criteria
    if (sortBy === 'date') {
      allCards.sort((a, b) => {
        if (!a.card.dueDate && !b.card.dueDate) return 0;
        if (!a.card.dueDate) return 1;
        if (!b.card.dueDate) return -1;
        
        return new Date(a.card.dueDate).getTime() - new Date(b.card.dueDate).getTime();
      });
    } else if (sortBy === 'priority') {
      const priorityValues = { high: 3, medium: 2, low: 1, undefined: 0 };
      allCards.sort((a, b) => {
        const priorityA = a.card.priority ? priorityValues[a.card.priority] : 0;
        const priorityB = b.card.priority ? priorityValues[b.card.priority] : 0;
        return priorityB - priorityA;
      });
    }
    // 'department' sort is default
    
    return allCards;
  };
  
  const allCards = getAllCards();
  
  // Get department metrics
  const getDepartmentMetrics = (deptId: string) => {
    const deptBoards = getBoardsForDepartment(deptId);
    return getDepartmentBoardsStatistics(deptBoards);
  };
  
  // Get board type icon
  const getBoardTypeIcon = (type: 'tasks' | 'problems' | 'ideas') => {
    switch (type) {
      case 'tasks':
        return <CheckSquare className="h-4 w-4 text-blue-500" />;
      case 'problems':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'ideas':
        return <Lightbulb className="h-4 w-4 text-purple-500" />;
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    if (status.toLowerCase().includes('done') || status.toLowerCase().includes('completed') || status.toLowerCase().includes('resolved') || status.toLowerCase().includes('implemented')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    }
    
    if (status.toLowerCase().includes('progress') || status.toLowerCase().includes('action') || status.toLowerCase().includes('implementation') || status.toLowerCase().includes('analysis')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    }
    
    if (status.toLowerCase().includes('new') || status.toLowerCase().includes('todo') || status.toLowerCase().includes('proposed') || status.toLowerCase().includes('approved')) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
    }
    
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  };
  
  // Get priority badge
  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    };
    
    return (
      <span className={`text-xs px-2 py-0.5 rounded ${colors[priority as 'high' | 'medium' | 'low']}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };
  
  // Get total counts for all departments
  const getTotalCounts = () => {
    let tasks = 0;
    let problems = 0;
    let ideas = 0;
    
    departments.forEach(dept => {
      const metrics = getDepartmentMetrics(dept.id);
      tasks += metrics.tasks.totalCards;
      problems += metrics.problems.totalCards;
      ideas += metrics.ideas.totalCards;
    });
    
    return { tasks, problems, ideas, total: tasks + problems + ideas };
  };
  
  const totalCounts = getTotalCounts();
  
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Cross-Department Overview</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              View and manage items across all departments
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="tasks">Tasks Only</option>
              <option value="problems">Problems Only</option>
              <option value="ideas">Ideas Only</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="department">Sort by Department</option>
              <option value="date">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
            </select>
          </div>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
            <div className="bg-gray-100 dark:bg-gray-700 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl font-bold text-gray-700 dark:text-gray-200">
                {totalCounts.total}
              </span>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Items</div>
              <div className="text-lg font-medium">{departments.length} Departments</div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg shadow p-4 flex items-center">
            <div className="bg-blue-100 dark:bg-blue-800 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
              <CheckSquare className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Tasks</div>
              <div className="text-lg font-medium">{totalCounts.tasks} total</div>
            </div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900 rounded-lg shadow p-4 flex items-center">
            <div className="bg-amber-100 dark:bg-amber-800 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-300" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Problems</div>
              <div className="text-lg font-medium">{totalCounts.problems} total</div>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900 rounded-lg shadow p-4 flex items-center">
            <div className="bg-purple-100 dark:bg-purple-800 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
              <Lightbulb className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Ideas</div>
              <div className="text-lg font-medium">{totalCounts.ideas} total</div>
            </div>
          </div>
        </div>
        
        {/* Tabs to switch between list and department views */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                List View
              </button>
              <Link href="/departments" className="border-transparent border-b-2 py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700">
                Department View
              </Link>
            </nav>
          </div>
        </div>
        
        {/* List of all items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {sortBy === 'department' ? (
            // Display by department
            <div>
              {departments.map((dept) => (
                <div key={dept.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => toggleDepartment(dept.id)}
                  >
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-500 mr-2" />
                      <h3 className="font-medium">{dept.name}</h3>
                      <div className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                        {dept.members.length} members
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mr-4">
                        {allCards.filter(item => item.departmentId === dept.id).length} items
                      </div>
                      {expandedDepartments[dept.id] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                  
                  {expandedDepartments[dept.id] && (
                    <div className="px-4 pb-4">
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {allCards
                          .filter(item => item.departmentId === dept.id)
                          .map((item, index) => (
                            <div key={`${item.card.id}-${index}`} className="py-3 flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  {getBoardTypeIcon(item.boardType)}
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${getStatusColor(item.columnName)}`}>
                                    {item.columnName}
                                  </span>
                                  {item.card.priority && (
                                    <span className="ml-2">{getPriorityBadge(item.card.priority)}</span>
                                  )}
                                </div>
                                <h4 className="font-medium mt-1">{item.card.title}</h4>
                                {item.card.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                    {item.card.description}
                                  </p>
                                )}
                                <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  {item.card.assignee && (
                                    <div className="flex items-center mr-4">
                                      <Users className="h-3 w-3 mr-1" />
                                      {item.card.assignee}
                                    </div>
                                  )}
                                  {item.card.dueDate && (
                                    <div className="flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {item.card.dueDate}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Link
                                href={`/boards/${item.boardType}?departmentId=${dept.id}`}
                                className="ml-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </div>
                          ))}
                          
                          {allCards.filter(item => item.departmentId === dept.id).length === 0 && (
                            <div className="py-3 text-sm text-gray-500 dark:text-gray-400 italic">
                              No items found for this department.
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Flat list sorted by date or priority
            <div className="divide-y divide-gray-100 dark:divide-gray-700 p-4">
              {allCards.map((item, index) => (
                <div key={`${item.card.id}-${index}`} className="py-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      {getBoardTypeIcon(item.boardType)}
                      <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                        {item.departmentName}
                      </span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded ${getStatusColor(item.columnName)}`}>
                        {item.columnName}
                      </span>
                      {item.card.priority && (
                        <span className="ml-2">{getPriorityBadge(item.card.priority)}</span>
                      )}
                    </div>
                    <h4 className="font-medium mt-1">{item.card.title}</h4>
                    {item.card.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {item.card.description}
                      </p>
                    )}
                    <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {item.card.assignee && (
                        <div className="flex items-center mr-4">
                          <Users className="h-3 w-3 mr-1" />
                          {item.card.assignee}
                        </div>
                      )}
                      {item.card.dueDate && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {item.card.dueDate}
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/boards/${item.boardType}?departmentId=${item.departmentId}`}
                    className="ml-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              ))}
              
              {allCards.length === 0 && (
                <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                  <p>No items found matching your criteria.</p>
                  <p className="mt-1 text-sm">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}