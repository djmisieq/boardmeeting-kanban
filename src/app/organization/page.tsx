'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/navbar';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useKanbanStore } from '@/store/use-kanban-store';
import { BoardType, CardType } from '@/lib/types';
import { generateBoardStatistics, getDepartmentBoardsStatistics } from '@/lib/board-utils';
import { 
  CheckSquare, 
  AlertCircle, 
  Lightbulb, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown,
  Users,
  Calendar,
  Flag,
  Search,
  Filter,
  PieChart,
  BarChart4,
  Activity
} from 'lucide-react';

export default function OrganizationOverview() {
  const { departments } = useDepartmentsStore();
  const { boards, getBoardsForDepartment } = useKanbanStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, tasks, problems, ideas
  const [departmentBoards, setDepartmentBoards] = useState<{[key: string]: BoardType[]}>({});
  const [organizationStats, setOrganizationStats] = useState<{
    totalTasks: number;
    totalProblems: number;
    totalIdeas: number;
    totalMembers: number;
    taskCompletion: number;
    problemResolutionTime: number;
    ideasImplemented: number;
  }>({
    totalTasks: 0,
    totalProblems: 0,
    totalIdeas: 0,
    totalMembers: 0,
    taskCompletion: 0,
    problemResolutionTime: 0,
    ideasImplemented: 0
  });
  
  // Get recently updated cards across all departments
  const [recentCards, setRecentCards] = useState<(CardType & {
    boardType: 'tasks' | 'problems' | 'ideas';
    departmentName: string;
    columnName: string;
    boardId: string;
    columnId: string;
  })[]>([]);
  
  // Collect boards for each department
  useEffect(() => {
    const deptBoards: {[key: string]: BoardType[]} = {};
    
    departments.forEach(dept => {
      const boards = getBoardsForDepartment(dept.id);
      deptBoards[dept.id] = boards;
    });
    
    setDepartmentBoards(deptBoards);
  }, [departments, getBoardsForDepartment]);
  
  // Calculate organization-wide statistics
  useEffect(() => {
    let totalTasksCount = 0;
    let totalProblemsCount = 0;
    let totalIdeasCount = 0;
    let totalMembersCount = 0;
    let taskCompletionSum = 0;
    let problemResolutionTimeSum = 0;
    let ideasImplementedSum = 0;
    
    let taskBoardsCount = 0;
    let problemBoardsCount = 0;
    let ideaBoardsCount = 0;
    
    // Count unique members across departments
    const uniqueMembers = new Set<string>();
    
    departments.forEach(dept => {
      // Add members to set
      dept.members.forEach(member => uniqueMembers.add(member));
      
      // Get department boards
      const boards = departmentBoards[dept.id] || [];
      
      // Categorize boards and calculate statistics
      boards.forEach(board => {
        const stats = generateBoardStatistics(board);
        
        if (board.type === 'tasks') {
          totalTasksCount += stats.totalCards;
          taskCompletionSum += stats.completionRate;
          taskBoardsCount++;
        } else if (board.type === 'problems') {
          totalProblemsCount += stats.totalCards;
          if (stats.averageResolutionTime) {
            problemResolutionTimeSum += stats.averageResolutionTime;
            problemBoardsCount++;
          }
        } else if (board.type === 'ideas') {
          totalIdeasCount += stats.totalCards;
          
          // Count implemented ideas
          const implementedColumn = board.columns.find(col => 
            col.title.toLowerCase().includes('implemented') || 
            col.title.toLowerCase().includes('completed')
          );
          
          if (implementedColumn) {
            ideasImplementedSum += implementedColumn.cards.length;
          }
          
          ideaBoardsCount++;
        }
      });
    });
    
    // Calculate averages
    const avgTaskCompletion = taskBoardsCount > 0 ? taskCompletionSum / taskBoardsCount : 0;
    const avgProblemResolutionTime = problemBoardsCount > 0 ? problemResolutionTimeSum / problemBoardsCount : 0;
    
    setOrganizationStats({
      totalTasks: totalTasksCount,
      totalProblems: totalProblemsCount,
      totalIdeas: totalIdeasCount,
      totalMembers: uniqueMembers.size,
      taskCompletion: avgTaskCompletion,
      problemResolutionTime: avgProblemResolutionTime,
      ideasImplemented: ideasImplementedSum
    });
    
    // Collect recent cards (simulating recently updated ones)
    const allCards: (CardType & {
      boardType: 'tasks' | 'problems' | 'ideas';
      departmentName: string;
      columnName: string;
      boardId: string;
      columnId: string;
    })[] = [];
    
    departments.forEach(dept => {
      const depBoards = departmentBoards[dept.id] || [];
      
      depBoards.forEach(board => {
        board.columns.forEach(column => {
          column.cards.forEach(card => {
            allCards.push({
              ...card,
              boardType: board.type,
              departmentName: dept.name,
              columnName: column.title,
              boardId: board.id,
              columnId: column.id
            });
          });
        });
      });
    });
    
    // Sort by "created date" (we don't have real dates, so this is simulated)
    // In a real app, you'd sort by updatedAt or createdAt
    allCards.sort(() => Math.random() - 0.5);
    
    // Take the first 10 cards
    setRecentCards(allCards.slice(0, 10));
    
  }, [departments, departmentBoards]);
  
  // Filter recent cards based on search and filter
  const filteredRecentCards = recentCards.filter(card => {
    // Apply text search
    const matchesSearch = searchTerm === '' || 
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.departmentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply type filter
    const matchesFilter = filter === 'all' || card.boardType === filter;
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Organization Overview</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          A comprehensive view across all departments and teams
        </p>
        
        {/* Organization KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Tasks</p>
                <h3 className="text-3xl font-bold mt-1">{organizationStats.totalTasks}</h3>
              </div>
              <span className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <CheckSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">
                  {organizationStats.taskCompletion.toFixed(0)}% completion rate
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Problems</p>
                <h3 className="text-3xl font-bold mt-1">{organizationStats.totalProblems}</h3>
              </div>
              <span className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">
                  {organizationStats.problemResolutionTime.toFixed(1)} days avg. resolution time
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Ideas</p>
                <h3 className="text-3xl font-bold mt-1">{organizationStats.totalIdeas}</h3>
              </div>
              <span className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">
                  {organizationStats.ideasImplemented} ideas implemented
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Team Members</p>
                <h3 className="text-3xl font-bold mt-1">{organizationStats.totalMembers}</h3>
              </div>
              <span className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-gray-500">
                  Across {departments.length} departments
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Departments overview */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Departments</h2>
            <Link 
              href="/departments" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
            >
              Manage departments
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {departments.map(dept => {
              const deptBoards = departmentBoards[dept.id] || [];
              const stats = getDepartmentBoardsStatistics(deptBoards);
              
              const tasksCount = stats.tasks.totalCards;
              const problemsCount = stats.problems.totalCards;
              const ideasCount = stats.ideas.totalCards;
              
              return (
                <div key={dept.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 border-b dark:border-gray-700">
                    <h3 className="text-xl font-semibold mb-1">{dept.name}</h3>
                    {dept.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        {dept.description}
                      </p>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{dept.members.length} members</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-900">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{tasksCount}</div>
                        <div className="text-xs text-gray-500">Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-600 dark:text-red-400">{problemsCount}</div>
                        <div className="text-xs text-gray-500">Problems</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{ideasCount}</div>
                        <div className="text-xs text-gray-500">Ideas</div>
                      </div>
                    </div>
                    
                    <Link
                      href={`/dashboard?departmentId=${dept.id}`}
                      className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Dashboard
                    </Link>
                  </div>
                </div>
              );
            })}
            
            {/* Add new department card */}
            <Link
              href="/departments"
              className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-center h-full"
            >
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-3">
                <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Add Department</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Create a new department to organize your teams better
              </p>
            </Link>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Recent Activity</h2>
            
            <div className="flex space-x-4">
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
                className="px-4 py-2 border rounded-lg"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Items</option>
                <option value="tasks">Tasks</option>
                <option value="problems">Problems</option>
                <option value="ideas">Ideas</option>
              </select>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {filteredRecentCards.length === 0 ? (
              <div className="p-8 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No activities found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your filters or search term' 
                    : 'Start adding tasks, problems, or ideas to see activity here'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredRecentCards.map((card, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {card.boardType === 'tasks' && (
                            <div className="flex items-center">
                              <CheckSquare className="h-4 w-4 text-blue-600 mr-1" />
                              <span>Task</span>
                            </div>
                          )}
                          {card.boardType === 'problems' && (
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 text-red-600 mr-1" />
                              <span>Problem</span>
                            </div>
                          )}
                          {card.boardType === 'ideas' && (
                            <div className="flex items-center">
                              <Lightbulb className="h-4 w-4 text-yellow-600 mr-1" />
                              <span>Idea</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{card.title}</div>
                          {card.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {card.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {card.departmentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            card.columnName.includes('Done') || card.columnName.includes('Resolved') || card.columnName.includes('Implemented')
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : card.columnName.includes('Progress') || card.columnName.includes('Action') || card.columnName.includes('Implementation')
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                          }`}>
                            {card.columnName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {card.assignee ? (
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-500 mr-1" />
                              <span>{card.assignee}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {card.dueDate ? (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                              <span>{card.dueDate}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">No due date</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/boards/${card.boardType}?departmentId=${card.departmentId}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Analytics Dashboard Link */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-md p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-6">
              <h2 className="text-2xl font-bold mb-2">Organization-wide Analytics</h2>
              <p className="text-blue-100 mb-4">
                Get comprehensive insights across all departments and teams with detailed metrics and performance indicators.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <BarChart4 className="h-5 w-5 mr-1" />
                  <span>Performance Trends</span>
                </div>
                <div className="flex items-center">
                  <PieChart className="h-5 w-5 mr-1" />
                  <span>Workload Distribution</span>
                </div>
                <div className="flex items-center">
                  <Activity className="h-5 w-5 mr-1" />
                  <span>Team Productivity</span>
                </div>
              </div>
            </div>
            <Link 
              href="/analytics" 
              className="flex-shrink-0 bg-white text-blue-700 font-medium px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              View Analytics Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}