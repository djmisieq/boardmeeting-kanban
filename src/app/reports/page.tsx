'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/navbar';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useKanbanStore } from '@/store/use-kanban-store';
import { getDepartmentBoardsStatistics, BoardStatistics } from '@/lib/board-utils';
import ExportReportDialog from '@/components/reports/export-report-dialog';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line,
} from 'recharts';
import { Download, Filter, Share2, Calendar, ArrowDownTray } from 'lucide-react';
import Link from 'next/link';

type DepartmentStats = {
  departmentId: string;
  departmentName: string;
  tasks: BoardStatistics;
  problems: BoardStatistics;
  ideas: BoardStatistics;
};

export default function ReportsPage() {
  const { departments } = useDepartmentsStore();
  const { getBoardsForDepartment } = useKanbanStore();
  
  const [departmentsStats, setDepartmentsStats] = useState<DepartmentStats[]>([]);
  const [reportType, setReportType] = useState<'tasks' | 'problems' | 'ideas'>('tasks');
  const [comparisonMetric, setComparisonMetric] = useState<'completion' | 'overdue' | 'total'>('completion');
  const [timePeriod, setTimePeriod] = useState<'30days' | 'quarter' | 'ytd' | 'custom'>('30days');
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  useEffect(() => {
    // Collect statistics for all departments
    const allStats = departments.map(dept => {
      const departmentBoards = getBoardsForDepartment(dept.id);
      const stats = getDepartmentBoardsStatistics(departmentBoards);
      
      return {
        departmentId: dept.id,
        departmentName: dept.name,
        ...stats
      };
    });
    
    setDepartmentsStats(allStats);
  }, [departments, getBoardsForDepartment]);
  
  // Prepare data for comparison chart
  const comparisonData = departmentsStats.map(dept => {
    let metricValue = 0;
    
    switch (comparisonMetric) {
      case 'completion':
        metricValue = dept[reportType].completionRate || 0;
        break;
      case 'overdue':
        metricValue = dept[reportType].overdueTasks || 0;
        break;
      case 'total':
        metricValue = dept[reportType].totalCards || 0;
        break;
    }
    
    return {
      department: dept.departmentName,
      value: metricValue
    };
  });
  
  // Prepare data for radar chart - team performance across categories
  const radarData = departments.map(dept => {
    const stats = departmentsStats.find(s => s.departmentId === dept.id);
    if (!stats) return null;
    
    return {
      department: dept.name,
      'Task Completion': stats.tasks.completionRate || 0,
      'Problem Resolution': 100 - ((stats.problems.overdueTasks || 0) / (stats.problems.totalCards || 1) * 100),
      'Idea Implementation': ((Object.entries(stats.ideas.cardsByStatus || {})
        .find(([key]) => key.includes('Implemented'))?.[1] || 0) / (stats.ideas.totalCards || 1)) * 100,
      'Team Activity': Math.min(100, (stats.tasks.totalCards + stats.problems.totalCards + stats.ideas.totalCards) / 2)
    };
  }).filter(Boolean);
  
  // Prepare data for trend chart
  const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const trendData = weekLabels.map((week, i) => {
    const data: any = { name: week };
    
    departments.forEach(dept => {
      // This is simplified - in a real app we would use actual historical data
      const baseValue = Math.random() * 30 + 50; // Random value between 50-80
      const trend = i * 5; // Increasing trend over weeks
      data[dept.name] = Math.min(100, Math.max(0, baseValue + trend));
    });
    
    return data;
  });
  
  const getMetricLabel = () => {
    switch (comparisonMetric) {
      case 'completion':
        return 'Completion Rate (%)';
      case 'overdue':
        return 'Overdue Items';
      case 'total':
        return 'Total Items';
    }
  };
  
  const getReportTypeLabel = () => {
    switch (reportType) {
      case 'tasks':
        return 'Tasks';
      case 'problems':
        return 'Problems';
      case 'ideas':
        return 'Ideas';
    }
  };
  
  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case '30days':
        return 'Last 30 Days';
      case 'quarter':
        return 'Last Quarter';
      case 'ytd':
        return 'Year to Date';
      case 'custom':
        return 'Custom Range';
    }
  };
  
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Department Reports</h1>
          
          <div className="flex space-x-4">
            <button 
              className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setShowExportDialog(true)}
            >
              <ArrowDownTray className="h-4 w-4 mr-2" />
              Export Report
            </button>
            
            <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>
        </div>
        
        {/* Report Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">Report Settings</h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Report Type</label>
              <select 
                className="w-full px-3 py-2 border rounded-lg" 
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
              >
                <option value="tasks">Tasks</option>
                <option value="problems">Problems</option>
                <option value="ideas">Improvement Ideas</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Comparison Metric</label>
              <select 
                className="w-full px-3 py-2 border rounded-lg"
                value={comparisonMetric}
                onChange={(e) => setComparisonMetric(e.target.value as any)}
              >
                <option value="completion">Completion Rate</option>
                <option value="overdue">Overdue Items</option>
                <option value="total">Total Items</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Time Period</label>
              <select 
                className="w-full px-3 py-2 border rounded-lg"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as any)}
              >
                <option value="30days">Last 30 Days</option>
                <option value="quarter">Last Quarter</option>
                <option value="ytd">Year to Date</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {timePeriod === 'custom' && (
              <div className="flex gap-2 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1">From</label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded-lg pr-8"
                    />
                    <Calendar className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To</label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded-lg pr-8"
                    />
                    <Calendar className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Departments</h3>
            <p className="text-3xl font-bold">{departments.length}</p>
            <p className="text-sm mt-4">
              Total teams across the organization
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Team Members</h3>
            <p className="text-3xl font-bold">
              {departments.reduce((sum, dept) => sum + dept.members.length, 0)}
            </p>
            <p className="text-sm mt-4">
              Total participants in all departments
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Overall Progress</h3>
            <p className="text-3xl font-bold">
              {(departmentsStats.reduce((sum, dept) => sum + dept.tasks.completionRate, 0) / Math.max(1, departmentsStats.length)).toFixed(0)}%
            </p>
            <p className="text-sm mt-4">
              Average completion rate across all teams
            </p>
          </div>
        </div>
        
        {/* Comparison Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">Department Comparison: {getReportTypeLabel()} {getMetricLabel()}</h2>
            <div className="text-sm text-gray-500">
              {getTimePeriodLabel()}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" name={getMetricLabel()} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Performance Radar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Team Performance Radar</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  {departments.map((dept, index) => (
                    <Radar
                      key={dept.id}
                      name={dept.name}
                      dataKey={dept.name}
                      stroke={`hsl(${index * 360 / departments.length}, 70%, 50%)`}
                      fill={`hsl(${index * 360 / departments.length}, 70%, 50%)`}
                      fillOpacity={0.2}
                    />
                  ))}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Completion Rate Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={trendData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid stroke="#f5f5f5" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  {departments.map((dept, index) => (
                    <Line
                      key={dept.id}
                      type="monotone"
                      dataKey={dept.name}
                      stroke={`hsl(${index * 360 / departments.length}, 70%, 50%)`}
                      strokeWidth={2}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Data Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2">
            <h3 className="text-lg font-medium mb-4">Department Metrics</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Members</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task Completion</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Problems Resolved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ideas Implemented</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {departmentsStats.map((dept) => (
                    <tr key={dept.departmentId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{dept.departmentName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {departments.find(d => d.id === dept.departmentId)?.members.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{dept.tasks.completionRate.toFixed(1)}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {Object.entries(dept.problems.cardsByStatus || {})
                            .find(([key]) => key.includes('Resolved'))?.[1] || 0}
                            /{dept.problems.totalCards}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {Object.entries(dept.ideas.cardsByStatus || {})
                            .find(([key]) => key.includes('Implemented'))?.[1] || 0}
                            /{dept.ideas.totalCards}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/dashboard?departmentId=${dept.departmentId}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View Dashboard
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Export Report Dialog */}
      {showExportDialog && (
        <ExportReportDialog
          departmentsStats={departmentsStats}
          reportType={reportType}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
}