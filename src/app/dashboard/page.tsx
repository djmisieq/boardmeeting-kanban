'use client';

import Navbar from '@/components/layout/navbar';
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

const taskData = [
  { name: 'Week 1', completed: 12, inProgress: 5, pending: 3 },
  { name: 'Week 2', completed: 15, inProgress: 7, pending: 2 },
  { name: 'Week 3', completed: 8, inProgress: 10, pending: 5 },
  { name: 'Week 4', completed: 10, inProgress: 3, pending: 1 },
];

const problemStatusData = [
  { name: 'Resolved', value: 25, color: '#10B981' },
  { name: 'In Analysis', value: 8, color: '#F59E0B' },
  { name: 'New', value: 5, color: '#EF4444' },
];

const ideaStatusData = [
  { name: 'Implemented', value: 12, color: '#8B5CF6' },
  { name: 'In Progress', value: 8, color: '#3B82F6' },
  { name: 'Approved', value: 5, color: '#06B6D4' },
  { name: 'Proposed', value: 15, color: '#D1D5DB' },
];

export default function Dashboard() {
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Team Dashboard</h1>
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Task Completion Rate</h3>
            <p className="text-3xl font-bold">75%</p>
            <p className="text-sm text-green-500 mt-2">↑ 12% from last month</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Problem Resolution Time</h3>
            <p className="text-3xl font-bold">2.3 days</p>
            <p className="text-sm text-green-500 mt-2">↓ 0.5 days from last month</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">Improvement Ideas</h3>
            <p className="text-3xl font-bold">40</p>
            <p className="text-sm text-green-500 mt-2">↑ 8 from last month</p>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Status Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Task Status Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={taskData}
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
            <h3 className="text-lg font-medium mb-4">Problem Status</h3>
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
            <h3 className="text-lg font-medium mb-4">Improvement Ideas Status</h3>
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

          {/* Latest Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Latest Activity</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4 py-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Today, 10:30 AM</p>
                <p className="font-medium">Task "Update documentation" marked as complete</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4 py-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Today, 9:15 AM</p>
                <p className="font-medium">New problem reported: "Server performance issues"</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Yesterday, 4:45 PM</p>
                <p className="font-medium">New improvement idea: "Implement dark mode"</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Yesterday, 2:30 PM</p>
                <p className="font-medium">Weekly meeting notes added</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}