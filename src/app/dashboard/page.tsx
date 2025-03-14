'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import { useDepartmentsStore } from '@/store/use-departments-store';
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

export default function Dashboard() {
  const searchParams = useSearchParams();
  const departmentId = searchParams.get('departmentId');
  const { departments, selectDepartment, selectedDepartmentId } = useDepartmentsStore();
  
  // Select the department from URL params if provided
  useEffect(() => {
    if (departmentId) {
      selectDepartment(departmentId);
    }
  }, [departmentId, selectDepartment]);
  
  // Get the current selected department
  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);
  
  // Mock data for dashboard charts
  // In a real app, this would come from an API or be filtered based on selected department
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
        
        {/* Department Members (if department is selected) */}
        {selectedDepartment && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium mb-4">Team Members</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedDepartment.members.length > 0 ? (
                selectedDepartment.members.map((member, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-10 h-10 flex items-center justify-center font-medium mr-3">
                      {member.charAt(0)}
                    </div>
                    <div className="font-medium">{member}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 dark:text-gray-400 col-span-full">
                  No team members have been added to this department yet.
                </div>
              )}
            </div>
          </div>
        )}
        
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