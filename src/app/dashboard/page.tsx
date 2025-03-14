'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/navbar';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useKanbanStore } from '@/store/use-kanban-store';
import { generateTrendData, getDepartmentBoardsStatistics, BoardStatistics } from '@/lib/board-utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DepartmentIcon, TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const departmentId = searchParams.get('departmentId');
  const { departments, selectDepartment, selectedDepartmentId } = useDepartmentsStore();
  const { boards, getBoardsForDepartment, initializeBoard } = useKanbanStore();
  
  const [departmentStats, setDepartmentStats] = useState<{
    tasks: BoardStatistics;
    problems: BoardStatistics;
    ideas: BoardStatistics;
  } | null>(null);
  
  // Select the department from URL params if provided
  useEffect(() => {
    if (departmentId) {
      selectDepartment(departmentId);
    }
  }, [departmentId, selectDepartment]);
  
  // Get the current selected department
  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);
  
  // Initialize boards for department if they don't exist
  useEffect(() => {
    if (selectedDepartment) {
      // Create or get task board for department
      const tasksBoard = selectedDepartment.boardIds.tasksBoard || `${selectedDepartment.id}-tasks`;
      if (!boards[tasksBoard]) {
        initializeBoard(tasksBoard, 'tasks', selectedDepartment.id, []);
      }
      
      // Create or get problems board for department
      const problemsBoard = selectedDepartment.boardIds.problemsBoard || `${selectedDepartment.id}-problems`;
      if (!boards[problemsBoard]) {
        initializeBoard(problemsBoard, 'problems', selectedDepartment.id, []);
      }
      
      // Create or get ideas board for department
      const ideasBoard = selectedDepartment.boardIds.ideasBoard || `${selectedDepartment.id}-ideas`;
      if (!boards[ideasBoard]) {
        initializeBoard(ideasBoard, 'ideas', selectedDepartment.id, []);
      }
    }
  }, [selectedDepartment, boards, initializeBoard]);
  
  // Calculate department statistics
  useEffect(() => {
    if (selectedDepartmentId) {
      const departmentBoards = getBoardsForDepartment(selectedDepartmentId);
      const stats = getDepartmentBoardsStatistics(departmentBoards);
      setDepartmentStats(stats);
    }
  }, [selectedDepartmentId, getBoardsForDepartment, boards]);
  
  // Generate trend data
  const taskTrendData = generateTrendData(
    selectedDepartmentId ? getBoardsForDepartment(selectedDepartmentId) : [], 
    'tasks'
  );
  
  // Colors for pie charts
  const problemStatusColors = {
    Resolved: '#10B981',
    'In Analysis': '#F59E0B',
    New: '#EF4444',
  };
  
  const ideaStatusColors = {
    Implemented: '#8B5CF6',
    'In Implementation': '#3B82F6',
    Approved: '#06B6D4',
    Proposed: '#D1D5DB',
  };
  
  // Transform data for pie charts
  const problemStatusData = departmentStats?.problems.cardsByStatus 
    ? Object.entries(departmentStats.problems.cardsByStatus).map(([name, value]) => ({
        name,
        value,
        color: problemStatusColors[name as keyof typeof problemStatusColors] || '#CBD5E0',
      }))
    : [
        { name: 'Resolved', value: 25, color: '#10B981' },
        { name: 'In Analysis', value: 8, color: '#F59E0B' },
        { name: 'New', value: 5, color: '#EF4444' },
      ];
  
  const ideaStatusData = departmentStats?.ideas.cardsByStatus 
    ? Object.entries(departmentStats.ideas.cardsByStatus).map(([name, value]) => ({
        name,
        value,
        color: ideaStatusColors[name as keyof typeof ideaStatusColors] || '#CBD5E0',
      }))
    : [
        { name: 'Implemented', value: 12, color: '#8B5CF6' },
        { name: 'In Implementation', value: 8, color: '#3B82F6' },
        { name: 'Approved', value: 5, color: '#06B6D4' },
        { name: 'Proposed', value: 15, color: '#D1D5DB' },
      ];
  
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{selectedDepartment?.name || 'Team'} Dashboard</h1>
            {selectedDepartment?.description && (
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {selectedDepartment.description}
              </p>
            )}
          </div>
          
          {selectedDepartment && (
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg px-4 py-3 border border-blue-200 dark:border-blue-800">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Team Members</div>
              <div className="font-medium">{selectedDepartment.members.length} members</div>
            </div>
          )}
        </div>
        
        {/* Tabs for different department views */}
        {departments.length > 1 && (
          <div className="flex overflow-x-auto space-x-2 mb-8 pb-2">
            {departments.map(dept => (
              <Link
                key={dept.id}
                href={`/dashboard?departmentId=${dept.id}`}
                className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap ${
                  dept.id === selectedDepartmentId 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' 
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                {dept.name}
              </Link>
            ))}
          </div>
        )}
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Task Completion Rate</h3>
            <div className="flex items-end">
              <p className="text-3xl font-bold">
                {departmentStats?.tasks.completionRate.toFixed(0) || 75}%
              </p>
              <p className="text-sm text-green-500 ml-2 mb-1">
                <TrendingUp className="h-4 w-4 inline" /> 12% from last month
              </p>
            </div>
            <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${departmentStats?.tasks.completionRate || 75}%` }}
              />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Problem Resolution Time</h3>
            <div className="flex items-end">
              <p className="text-3xl font-bold">
                {departmentStats?.problems.averageResolutionTime?.toFixed(1) || 2.3} days
              </p>
              <p className="text-sm text-green-500 ml-2 mb-1">
                <TrendingDown className="h-4 w-4 inline" /> 0.5 days from last month
              </p>
            </div>
            
            <div className="flex items-center mt-4">
              <Clock className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-sm">
                {departmentStats?.problems.overdueTasks || 2} overdue problems
              </span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Improvement Ideas</h3>
            <div className="flex items-end">
              <p className="text-3xl font-bold">
                {departmentStats?.ideas.totalCards || 40}
              </p>
              <p className="text-sm text-green-500 ml-2 mb-1">
                <TrendingUp className="h-4 w-4 inline" /> 8 from last month
              </p>
            </div>
            
            <div className="flex items-center mt-4">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm">
                {Object.entries(departmentStats?.ideas.cardsByStatus || {})
                  .find(([key]) => key.includes('Implemented'))?.[1] || 12} implemented ideas
              </span>
            </div>
          </div>
        </div>
        
        {/* Department Members (if department is selected) */}
        {selectedDepartment && selectedDepartment.members.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium mb-4">Team Members</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {selectedDepartment.members.map((member, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-10 h-10 flex items-center justify-center font-medium mr-3">
                    {member.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{member}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {departmentStats?.tasks.cardsPerAssignee[member] || 0} active tasks
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Status Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Task Status Trend</h3>
              <Link 
                href={`/boards/tasks?departmentId=${selectedDepartmentId}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View Board →
              </Link>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={taskTrendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#10B981" />
                  <Bar dataKey="inProgress" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="pending" stackId="a" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Problem Status Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Problem Status</h3>
              <Link 
                href={`/boards/problems?departmentId=${selectedDepartmentId}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View Board →
              </Link>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={problemStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {problemStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Idea Status Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Improvement Ideas Status</h3>
              <Link 
                href={`/boards/ideas?departmentId=${selectedDepartmentId}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View Board →
              </Link>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ideaStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {ideaStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Tasks/Deadlines Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {/* Examples of upcoming deadlines - in a real app, these would come from the board data */}
              <div className="flex items-start border-l-4 border-red-500 pl-4 py-1">
                <div className="flex-1">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                    <p className="text-sm text-red-500">Overdue - 2 days ago</p>
                  </div>
                  <p className="font-medium">Fix login page bug</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Assigned to: Mike S.</p>
                </div>
                <Link 
                  href={`/boards/tasks?departmentId=${selectedDepartmentId}`}
                  className="text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                >
                  View →
                </Link>
              </div>
              
              <div className="flex items-start border-l-4 border-amber-500 pl-4 py-1">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-amber-500 mr-1" />
                    <p className="text-sm text-amber-500">Due tomorrow</p>
                  </div>
                  <p className="font-medium">Email delivery delays</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Assigned to: IT Team</p>
                </div>
                <Link 
                  href={`/boards/problems?departmentId=${selectedDepartmentId}`}
                  className="text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                >
                  View →
                </Link>
              </div>
              
              <div className="flex items-start border-l-4 border-blue-500 pl-4 py-1">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-blue-500 mr-1" />
                    <p className="text-sm text-blue-500">Due in 3 days</p>
                  </div>
                  <p className="font-medium">Prepare quarterly report</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Assigned to: Tom R.</p>
                </div>
                <Link 
                  href={`/boards/tasks?departmentId=${selectedDepartmentId}`}
                  className="text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                >
                  View →
                </Link>
              </div>
              
              <div className="border-t pt-4 mt-6">
                <Link 
                  href={`/boards/tasks?departmentId=${selectedDepartmentId}&filter=upcoming`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View all upcoming deadlines →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}