'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckSquare, 
  AlertCircle, 
  Lightbulb, 
  Briefcase,
  ArrowUpRight,
  AlertTriangle,
  CalendarDays
} from 'lucide-react';
import { useKanbanStore } from '@/store/use-kanban-store';
import { useProjectsStore } from '@/store/use-projects-store';
import { useMeetingsStore } from '@/store/use-meetings-store';
import KanbanBoard from '@/components/kanban/kanban-board';
import ProjectCard from '@/components/projects/project-card';
import { MeetingStatsWidget } from './meeting-stats-widget';
import { Project } from '@/lib/types';
import Link from 'next/link';

interface IntegratedBoardProps {
  viewMode: 'combined' | 'kanban' | 'projects';
  departmentId: string;
  showMeetingStats?: boolean;
}

const IntegratedBoard: React.FC<IntegratedBoardProps> = ({ 
  viewMode,
  departmentId,
  showMeetingStats = true
}) => {
  const { boards } = useKanbanStore();
  const { projects, getProjectsByDepartment } = useProjectsStore();
  const { meetings } = useMeetingsStore();
  
  const [activeTab, setActiveTab] = useState('tasks');
  const [departmentProjects, setDepartmentProjects] = useState<Project[]>([]);
  
  // Filter boards by department
  const departmentBoards = departmentId
    ? boards.filter(board => board.departmentId === departmentId)
    : [];
  
  // Get task, problem, and idea boards
  const tasksBoard = departmentBoards.find(board => board.type === 'tasks');
  const problemsBoard = departmentBoards.find(board => board.type === 'problems');
  const ideasBoard = departmentBoards.find(board => board.type === 'ideas');
  
  // Update department projects when departmentId changes
  useEffect(() => {
    if (departmentId) {
      const projectsList = getProjectsByDepartment(departmentId);
      setDepartmentProjects(projectsList);
    } else {
      setDepartmentProjects([]);
    }
  }, [departmentId, projects, getProjectsByDepartment]);
  
  // Function to render project cards
  const renderProjectCards = () => {
    if (departmentProjects.length === 0) {
      return (
        <div className="text-center py-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400 mb-3" />
          <h3 className="text-lg font-medium mb-2">Brak projektów</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto">
            Nie masz jeszcze żadnych projektów w tym dziale lub nie wybrano działu.
          </p>
          <Link 
            href="/projects"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Zarządzaj projektami
          </Link>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {departmentProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  };
  
  // Function to render board tab panels
  const renderBoardTabPanels = () => {
    return (
      <>
        <TabsContent value="tasks" className="mt-0">
          {tasksBoard ? (
            <KanbanBoard 
              boardId={tasksBoard.id} 
              showProjectConnections={true}
            />
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">Brak tablicy zadań</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ten dział nie ma skonfigurowanej tablicy zadań.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="problems" className="mt-0">
          {problemsBoard ? (
            <KanbanBoard 
              boardId={problemsBoard.id} 
              showProjectConnections={true}
            />
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">Brak tablicy problemów</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ten dział nie ma skonfigurowanej tablicy problemów.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ideas" className="mt-0">
          {ideasBoard ? (
            <KanbanBoard 
              boardId={ideasBoard.id} 
              showProjectConnections={true}
            />
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">Brak tablicy usprawnień</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ten dział nie ma skonfigurowanej tablicy usprawnień.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="projects" className="mt-0">
          {renderProjectCards()}
        </TabsContent>
        
        <TabsContent value="meetings" className="mt-0">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Spotkania działu</h3>
              <Link
                href="/meetings"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center text-sm"
              >
                Wszystkie spotkania
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
              <CalendarDays className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-2">Widok spotkań</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto">
                Pełna funkcjonalność zarządzania spotkaniami jest dostępna w osobnym widoku spotkań.
              </p>
              <Link 
                href="/meetings"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Przejdź do spotkań
              </Link>
            </div>
          </div>
        </TabsContent>
      </>
    );
  };
  
  // For the combined view, we show projects at the top and Kanban boards below
  if (viewMode === 'combined') {
    return (
      <div className="space-y-6">
        {/* Projects section */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden lg:flex-grow">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Projekty działu
              </h2>
              <Link
                href="/projects"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center text-sm"
              >
                Wszystkie projekty
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>
            
            {renderProjectCards()}
          </div>
          
          {/* Meeting stats widget - only shown in combined view */}
          {showMeetingStats && (
            <div className="lg:w-80">
              <MeetingStatsWidget className="h-full" />
            </div>
          )}
        </div>
        
        {/* Kanban boards section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
          <Tabs defaultValue="tasks" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b dark:border-gray-700">
              <TabsList className="bg-transparent h-auto p-0">
                <TabsTrigger 
                  value="tasks" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-3"
                >
                  <CheckSquare className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                  Zadania
                </TabsTrigger>
                <TabsTrigger 
                  value="problems" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:shadow-none rounded-none px-4 py-3"
                >
                  <AlertCircle className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
                  Problemy
                </TabsTrigger>
                <TabsTrigger 
                  value="ideas" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-yellow-600 data-[state=active]:shadow-none rounded-none px-4 py-3"
                >
                  <Lightbulb className="h-4 w-4 mr-2 text-yellow-600 dark:text-yellow-400" />
                  Usprawnienia
                </TabsTrigger>
                <TabsTrigger 
                  value="meetings" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-400 data-[state=active]:shadow-none rounded-none px-4 py-3"
                >
                  <CalendarDays className="h-4 w-4 mr-2 text-blue-400 dark:text-blue-300" />
                  Spotkania
                </TabsTrigger>
                <TabsTrigger 
                  value="projects" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:shadow-none rounded-none px-4 py-3 md:hidden"
                >
                  <Briefcase className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                  Projekty
                </TabsTrigger>
              </TabsList>
            </div>
            
            {renderBoardTabPanels()}
          </Tabs>
        </div>
      </div>
    );
  }
  
  // For Kanban-only view
  if (viewMode === 'kanban') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
        <Tabs defaultValue="tasks" value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b dark:border-gray-700">
            <TabsList className="bg-transparent h-auto p-0">
              <TabsTrigger 
                value="tasks" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-3"
              >
                <CheckSquare className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                Zadania
              </TabsTrigger>
              <TabsTrigger 
                value="problems" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:shadow-none rounded-none px-4 py-3"
              >
                <AlertCircle className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
                Problemy
              </TabsTrigger>
              <TabsTrigger 
                value="ideas" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-yellow-600 data-[state=active]:shadow-none rounded-none px-4 py-3"
              >
                <Lightbulb className="h-4 w-4 mr-2 text-yellow-600 dark:text-yellow-400" />
                Usprawnienia
              </TabsTrigger>
              <TabsTrigger 
                value="meetings" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-400 data-[state=active]:shadow-none rounded-none px-4 py-3"
              >
                <CalendarDays className="h-4 w-4 mr-2 text-blue-400 dark:text-blue-300" />
                Spotkania
              </TabsTrigger>
            </TabsList>
          </div>
          
          {renderBoardTabPanels()}
        </Tabs>
      </div>
    );
  }
  
  // For Projects-only view
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold flex items-center">
          <Briefcase className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
          Projekty działu
        </h2>
      </div>
      
      {renderProjectCards()}
    </div>
  );
};

export default IntegratedBoard;