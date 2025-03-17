'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Calendar, FileText, Kanban, Layers, Clock, CheckCircle, ArrowUpRight } from 'lucide-react';
import { useKanbanStore } from '@/store/use-kanban-store';
import { useProjectsStore } from '@/store/use-projects-store';
import { useDepartmentsStore } from '@/store/use-departments-store';

interface ActivityItem {
  id: string;
  title: string;
  type: 'task' | 'problem' | 'idea' | 'project' | 'meeting' | 'note';
  status: string;
  timestamp: string;
  link: string;
  assignee?: string;
}

const UnifiedDashboard = () => {
  const { boards } = useKanbanStore();
  const { projects } = useProjectsStore();
  const { departments, selectedDepartmentId } = useDepartmentsStore();
  
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<ActivityItem[]>([]);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  
  // Generate recent activity from all boards and projects
  useEffect(() => {
    const activity: ActivityItem[] = [];
    
    // Get cards from boards
    Object.values(boards).forEach(board => {
      board.columns.forEach(column => {
        column.cards.forEach(card => {
          // Add only the 20 most recent cards
          if (card.createdAt) {
            activity.push({
              id: card.id,
              title: card.title,
              type: board.type,
              status: column.title,
              timestamp: card.createdAt,
              link: `/card/${card.id}?boardId=${board.id}&columnId=${column.id}`,
              assignee: card.assignee
            });
          }
        });
      });
    });
    
    // Get projects
    projects.forEach(project => {
      activity.push({
        id: project.id,
        title: project.name,
        type: 'project',
        status: project.status,
        timestamp: project.createdAt,
        link: `/projects/${project.id}`,
        assignee: project.owner
      });
    });
    
    // Sort by timestamp (recent first) and limit to 10
    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentActivity(activity.slice(0, 10));
    
    // Find cards with upcoming deadlines
    const deadlines: ActivityItem[] = [];
    Object.values(boards).forEach(board => {
      board.columns.forEach(column => {
        column.cards
          .filter(card => card.dueDate && new Date(card.dueDate) > new Date())
          .forEach(card => {
            deadlines.push({
              id: card.id,
              title: card.title,
              type: board.type,
              status: column.title,
              timestamp: card.dueDate || '',
              link: `/card/${card.id}?boardId=${board.id}&columnId=${column.id}`,
              assignee: card.assignee
            });
          });
      });
    });
    
    // Sort by due date (sooner first) and limit to 5
    deadlines.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    setUpcomingDeadlines(deadlines.slice(0, 5));
    
    // Get active projects
    const active = projects
      .filter(p => p.status === 'in-progress')
      .sort((a, b) => b.progress - a.progress);
    setActiveProjects(active.slice(0, 3));
  }, [boards, projects]);
  
  // Helper to get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'problem':
        return <Clock className="h-5 w-5 text-red-500" />;
      case 'idea':
        return <PlusCircle className="h-5 w-5 text-purple-500" />;
      case 'project':
        return <Layers className="h-5 w-5 text-green-500" />;
      case 'meeting':
        return <Calendar className="h-5 w-5 text-amber-500" />;
      case 'note':
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <ArrowUpRight className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Quick Access */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/boards/tasks" className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-28">
            <Kanban className="h-8 w-8 text-blue-500 mb-2" />
            <span className="font-medium">Kanban Boards</span>
          </Link>
          
          <Link href="/projects" className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-28">
            <Layers className="h-8 w-8 text-green-500 mb-2" />
            <span className="font-medium">Projects</span>
          </Link>
          
          <Link href="/meetings" className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-28">
            <Calendar className="h-8 w-8 text-amber-500 mb-2" />
            <span className="font-medium">Meetings</span>
          </Link>
          
          <Link href="/notes" className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-28">
            <FileText className="h-8 w-8 text-gray-500 mb-2" />
            <span className="font-medium">Notes</span>
          </Link>
        </div>
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Link href="/activity" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={`${activity.id}-${activity.type}`} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="mr-3">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <Link 
                    href={activity.link}
                    className="font-medium hover:text-blue-600 transition-colors block truncate"
                  >
                    {activity.title}
                  </Link>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="capitalize">{activity.type}</span>
                    <span className="mx-1">•</span>
                    <span>{activity.status}</span>
                    {activity.assignee && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{activity.assignee}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Side panel with upcoming deadlines */}
        <div className="space-y-6">
          {/* Upcoming deadlines */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
            
            {upcomingDeadlines.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map(item => {
                  const dueDate = new Date(item.timestamp);
                  const today = new Date();
                  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  let statusColor = 'bg-blue-500';
                  if (diffDays < 0) statusColor = 'bg-red-500';
                  else if (diffDays < 2) statusColor = 'bg-amber-500';
                  
                  return (
                    <Link 
                      key={item.id} 
                      href={item.link}
                      className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium truncate mr-2">{item.title}</span>
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${statusColor}`}>
                          {diffDays < 0 ? 'Overdue' : diffDays === 0 ? 'Today' : `${diffDays} days`}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.assignee || 'Unassigned'}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Active Projects */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Active Projects</h2>
              <Link href="/projects" className="text-sm text-blue-600 hover:underline">View All</Link>
            </div>
            
            {activeProjects.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No active projects</p>
            ) : (
              <div className="space-y-3">
                {activeProjects.map(project => (
                  <Link 
                    key={project.id} 
                    href={`/projects/${project.id}`}
                    className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="font-medium">{project.name}</div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="w-full max-w-[180px]">
                        <div className="bg-gray-200 dark:bg-gray-600 h-2 rounded-full w-full">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-xs font-medium">{project.progress}%</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;