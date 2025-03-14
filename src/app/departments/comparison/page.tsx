'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/navbar';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useKanbanStore } from '@/store/use-kanban-store';
import { generateBoardStatistics } from '@/lib/board-utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

export default function DepartmentsComparisonPage() {
  const { departments } = useDepartmentsStore();
  const { getBoardsForDepartment } = useKanbanStore();
  
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [completionRateData, setCompletionRateData] = useState<any[]>([]);
  const [problemResolutionData, setProblemResolutionData] = useState<any[]>([]);
  const [ideasImplementationData, setIdeasImplementationData] = useState<any[]>([]);
  
  // Calculate stats for all departments
  useEffect(() => {
    const departmentStats = departments.map(dept => {
      // Get boards for this department
      const departmentBoards = getBoardsForDepartment(dept.id);
      
      // If no boards found, return placeholder data
      if (!departmentBoards || departmentBoards.length === 0) {
        return {
          department: dept.name,
          taskCompletionRate: 0,
          problemsResolved: 0,
          ideasImplemented: 0,
          problemResolutionTime: 0,
          totalTasks: 0,
          totalProblems: 0,
          totalIdeas: 0,
          overdueTasks: 0,
        };
      }
      
      // Calculate stats for each board type
      const taskBoards = departmentBoards.filter(board => board.type === 'tasks');
      const problemBoards = departmentBoards.filter(board => board.type === 'problems');
      const ideaBoards = departmentBoards.filter(board => board.type === 'ideas');
      
      // Generate statistics
      const taskStats = taskBoards.length > 0 ? generateBoardStatistics(taskBoards[0]) : null;
      const problemStats = problemBoards.length > 0 ? generateBoardStatistics(problemBoards[0]) : null;
      const ideaStats = ideaBoards.length > 0 ? generateBoardStatistics(ideaBoards[0]) : null;
      
      // Return department stats
      return {
        department: dept.name,
        departmentId: dept.id,
        taskCompletionRate: taskStats?.completionRate || 0,
        problemsResolved: problemStats ? 
          Object.entries(problemStats.cardsByStatus).find(([key]) => key.includes('Resolved'))?.[1] || 0 : 0,
        ideasImplemented: ideaStats ? 
          Object.entries(ideaStats.cardsByStatus).find(([key]) => key.includes('Implemented'))?.[1] || 0 : 0,
        problemResolutionTime: problemStats?.averageResolutionTime || 0,
        totalTasks: taskStats?.totalCards || 0,
        totalProblems: problemStats?.totalCards || 0,
        totalIdeas: ideaStats?.totalCards || 0,
        overdueTasks: taskStats?.overdueTasks || 0,
      };
    });
    
    // Sort departments by task completion rate
    const sortedDepartments = [...departmentStats].sort((a, b) => b.taskCompletionRate - a.taskCompletionRate);
    
    setComparisonData(sortedDepartments);
    
    // Create data for specific charts
    setCompletionRateData(
      departmentStats.map(dept => ({
        name: dept.department,
        completionRate: parseFloat(dept.taskCompletionRate.toFixed(1)),
      }))
    );
    
    setProblemResolutionData(
      departmentStats.map(dept => ({
        name: dept.department,
        resolutionTime: parseFloat(dept.problemResolutionTime.toFixed(1)) || 0,
        resolvedProblems: dept.problemsResolved,
      }))
    );
    
    setIdeasImplementationData(
      departmentStats.map(dept => ({
        name: dept.department,
        totalIdeas: dept.totalIdeas,
        implementedIdeas: dept.ideasImplemented,
        implementationRate: dept.totalIdeas > 0 ? 
          parseFloat(((dept.ideasImplemented / dept.totalIdeas) * 100).toFixed(1)) : 0,
      }))
    );
  }, [departments, getBoardsForDepartment]);
  
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Department Comparison</h1>
          
          <Link 
            href="/departments" 
            className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            Manage Departments
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          {/* Task Completion Rate Comparison */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Task Completion Rate Comparison</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={completionRateData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: '%', position: 'insideLeft', angle: -90 }} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                  <Legend />
                  <Bar dataKey="completionRate" name="Task Completion Rate" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Problem Resolution Comparison */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Problem Resolution Time Comparison</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={problemResolutionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" label={{ value: 'Days', position: 'insideLeft', angle: -90 }} />
                  <YAxis yAxisId="right" orientation="right" 
                    label={{ value: 'Count', position: 'insideRight', angle: 90 }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="resolutionTime" name="Avg. Resolution Time (Days)" 
                    fill="#F59E0B" />
                  <Bar yAxisId="right" dataKey="resolvedProblems" name="Resolved Problems" 
                    fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Ideas Implementation Comparison */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Ideas Implementation Comparison</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ideasImplementationData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" 
                    label={{ value: '%', position: 'insideRight', angle: 90 }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="totalIdeas" name="Total Ideas" fill="#D1D5DB" />
                  <Bar yAxisId="left" dataKey="implementedIdeas" name="Implemented Ideas" fill="#8B5CF6" />
                  <Bar yAxisId="right" dataKey="implementationRate" name="Implementation Rate (%)" 
                    fill="#EC4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Department Performance Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <h2 className="text-xl font-semibold p-6 border-b">Department Performance Overview</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Problems
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ideas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Overdue Tasks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Team Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {comparisonData.map((dept, index) => {
                    const department = departments.find(d => d.id === dept.departmentId);
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white">{dept.department}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {department?.description?.substring(0, 30)}
                            {department?.description && department.description.length > 30 ? '...' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium">{dept.totalTasks} tasks</div>
                            <div className="text-green-600">
                              {dept.taskCompletionRate.toFixed(0)}% completion
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium">{dept.totalProblems} problems</div>
                            <div>
                              {dept.problemResolutionTime ? 
                                `${dept.problemResolutionTime.toFixed(1)} days avg.` : 
                                'No data'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium">{dept.totalIdeas} ideas</div>
                            <div className="text-purple-600">
                              {dept.ideasImplemented} implemented
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            dept.overdueTasks > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {dept.overdueTasks} overdue
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {department?.members.length || 0} members
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/dashboard?departmentId=${dept.departmentId}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View Dashboard
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}