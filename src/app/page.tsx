'use client';

import Link from 'next/link';
import { useKanbanStore } from '@/store/use-kanban-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { CheckSquare, AlertCircle, Lightbulb, FileText, Target, LayoutDashboard, Users } from 'lucide-react';

export default function Home() {
  const { departments } = useDepartmentsStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Boardmeeting Kanban</h1>
          <p className="text-xl text-muted-foreground">
            Visual management of team meetings using Kanban boards
          </p>
        </div>
        
        {/* Department overview */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Departments</h2>
            <Link 
              href="/departments"
              className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Users className="h-4 w-4 mr-1" />
              Manage Departments
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {departments.map((dept) => (
              <div 
                key={dept.id}
                className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-5 border-b dark:border-gray-700">
                  <h3 className="font-medium text-lg mb-1">{dept.name}</h3>
                  {dept.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {dept.description}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Members:</span>
                    <span className="text-sm font-medium">{dept.members.length}</span>
                  </div>
                  <Link
                    href={`/dashboard?departmentId=${dept.id}`}
                    className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-2"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    View Dashboard
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {/* Task Management Card */}
          <Link href="/boards/tasks" className="group">
            <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center mb-4">
                <CheckSquare className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">Task Management</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Create, assign, and track tasks for your team
              </p>
              <div className="text-primary group-hover:underline">View board →</div>
            </div>
          </Link>
          
          {/* Problem Management Card */}
          <Link href="/boards/problems" className="group">
            <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-amber-600 mr-2" />
                <h2 className="text-xl font-semibold">Problem Tracking</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Register, analyze, and solve problems effectively
              </p>
              <div className="text-primary group-hover:underline">View board →</div>
            </div>
          </Link>
          
          {/* Improvement Ideas Card */}
          <Link href="/boards/ideas" className="group">
            <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center mb-4">
                <Lightbulb className="h-6 w-6 text-yellow-500 mr-2" />
                <h2 className="text-xl font-semibold">Improvement Ideas</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Collect and implement improvement ideas
              </p>
              <div className="text-primary group-hover:underline">View board →</div>
            </div>
          </Link>
          
          {/* Dashboard Card */}
          <Link href="/dashboard" className="group">
            <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center mb-4">
                <LayoutDashboard className="h-6 w-6 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold">Team Dashboard</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Visualize team KPIs and metrics
              </p>
              <div className="text-primary group-hover:underline">View dashboard →</div>
            </div>
          </Link>
          
          {/* Meeting Notes Card */}
          <Link href="/notes" className="group">
            <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold">Meeting Notes</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Document and search meeting summaries
              </p>
              <div className="text-primary group-hover:underline">View notes →</div>
            </div>
          </Link>
          
          {/* Goals Card */}
          <Link href="/goals" className="group">
            <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center mb-4">
                <Target className="h-6 w-6 text-red-600 mr-2" />
                <h2 className="text-xl font-semibold">Team Goals</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Define and track cascading goals
              </p>
              <div className="text-primary group-hover:underline">View goals →</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}