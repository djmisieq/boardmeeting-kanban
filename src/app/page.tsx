'use client';

import React from 'react';
import Link from 'next/link';
import { useKanbanStore } from '@/store/use-kanban-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useProjectsStore } from '@/store/use-projects-store';
import { useApp } from '@/providers/app-provider';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Loading, CardSkeleton } from '@/components/ui/loading';
import { 
  CheckSquare, 
  AlertCircle, 
  Lightbulb, 
  FileText, 
  Target, 
  LayoutDashboard, 
  Users, 
  FolderKanban,
  Settings,
  GitPullRequest,
  RefreshCw
} from 'lucide-react';

export default function Home() {
  const { departments } = useDepartmentsStore();
  const { projects } = useProjectsStore();
  const { error, isLoading } = useApp();
  
  // Stan lokalny dla ładowania departamentów
  const [departmentsLoaded, setDepartmentsLoaded] = React.useState(departments.length > 0);
  
  // Efekt do symulacji ładowania danych (jeśli nie są jeszcze załadowane)
  React.useEffect(() => {
    if (departments.length === 0) {
      const timer = setTimeout(() => {
        setDepartmentsLoaded(true);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [departments.length]);
  
  return (
    <ErrorBoundary>
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-6xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Boardmeeting Kanban</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Wizualne zarządzanie spotkaniami zespołowymi z użyciem tablic Kanban
            </p>
          </div>
          
          {/* Department overview */}
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Działy</h2>
              <Link 
                href="/departments"
                className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <Users className="h-4 w-4 mr-1" />
                Zarządzaj działami
              </Link>
            </div>
            
            {!departmentsLoaded ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : departments.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-8 text-center">
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Brak działów</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Nie masz jeszcze żadnych działów. Utwórz swój pierwszy dział, aby rozpocząć.
                </p>
                <Link
                  href="/departments"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Utwórz dział
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {departments.map((dept) => (
                  <div 
                    key={dept.id}
                    className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-5 border-b dark:border-gray-700">
                      <h3 className="font-medium text-lg mb-1 text-gray-900 dark:text-white">{dept.name}</h3>
                      {dept.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {dept.description}
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Członkowie:</span>
                        <span className="text-sm font-medium">{dept.members.length}</span>
                      </div>
                      <Link
                        href={`/dashboard?departmentId=${dept.id}`}
                        className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-2"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Zobacz dashboard
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Cross-department Projects */}
          <div className="pt-8 border-t dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Projekty międzydziałowe</h2>
              <Link 
                href="/projects"
                className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <FolderKanban className="h-4 w-4 mr-1" />
                Wszystkie projekty
              </Link>
            </div>
            
            {projects.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Nie masz jeszcze żadnych projektów międzydziałowych.
                </p>
                <Link
                  href="/projects"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FolderKanban className="h-4 w-4 mr-2" />
                  Utwórz projekt
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {projects.slice(0, 3).map((project) => (
                  <div 
                    key={project.id}
                    className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-5 border-b dark:border-gray-700">
                      <h3 className="font-medium text-lg mb-1 text-gray-900 dark:text-white">{project.name}</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded">
                          {project.status === 'planning' ? 'Planowanie' :
                           project.status === 'in-progress' ? 'W trakcie' :
                           project.status === 'on-hold' ? 'Wstrzymany' :
                           project.status === 'completed' ? 'Zakończony' : 'Nie rozpoczęty'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(project.endDate).toLocaleDateString('pl-PL')}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <div className="text-right text-xs mt-1 text-gray-500">
                          {project.progress}% ukończono
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 flex justify-end">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                      >
                        Zobacz szczegóły
                        <GitPullRequest className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {/* Task Management Card */}
            <Link href="/boards/tasks" className="group">
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 transition-all duration-300 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700">
                <div className="flex items-center mb-4">
                  <CheckSquare className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Zarządzanie zadaniami</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Twórz, przypisuj i śledź zadania dla swojego zespołu
                </p>
                <div className="text-blue-600 dark:text-blue-400 group-hover:underline flex items-center">
                  Zobacz tablicę <CheckSquare className="h-3 w-3 ml-1" />
                </div>
              </div>
            </Link>
            
            {/* Problem Management Card */}
            <Link href="/boards/problems" className="group">
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 transition-all duration-300 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700">
                <div className="flex items-center mb-4">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Śledzenie problemów</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Rejestruj, analizuj i skutecznie rozwiązuj problemy
                </p>
                <div className="text-blue-600 dark:text-blue-400 group-hover:underline flex items-center">
                  Zobacz tablicę <CheckSquare className="h-3 w-3 ml-1" />
                </div>
              </div>
            </Link>
            
            {/* Improvement Ideas Card */}
            <Link href="/boards/ideas" className="group">
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 transition-all duration-300 hover:shadow-md hover:border-yellow-300 dark:hover:border-yellow-700">
                <div className="flex items-center mb-4">
                  <Lightbulb className="h-6 w-6 text-yellow-500 dark:text-yellow-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pomysły usprawnień</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Zbieraj i wdrażaj pomysły na usprawnienia
                </p>
                <div className="text-blue-600 dark:text-blue-400 group-hover:underline flex items-center">
                  Zobacz tablicę <CheckSquare className="h-3 w-3 ml-1" />
                </div>
              </div>
            </Link>
            
            {/* Dashboard Card */}
            <Link href="/dashboard" className="group">
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 transition-all duration-300 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700">
                <div className="flex items-center mb-4">
                  <LayoutDashboard className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard zespołu</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Wizualizuj wskaźniki KPI i metryki zespołu
                </p>
                <div className="text-blue-600 dark:text-blue-400 group-hover:underline flex items-center">
                  Zobacz dashboard <CheckSquare className="h-3 w-3 ml-1" />
                </div>
              </div>
            </Link>
            
            {/* Meeting Notes Card */}
            <Link href="/notes" className="group">
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 transition-all duration-300 hover:shadow-md hover:border-green-300 dark:hover:border-green-700">
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notatki ze spotkań</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Dokumentuj i wyszukuj podsumowania spotkań
                </p>
                <div className="text-blue-600 dark:text-blue-400 group-hover:underline flex items-center">
                  Zobacz notatki <CheckSquare className="h-3 w-3 ml-1" />
                </div>
              </div>
            </Link>
            
            {/* Goals Card */}
            <Link href="/goals" className="group">
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 transition-all duration-300 hover:shadow-md hover:border-red-300 dark:hover:border-red-700">
                <div className="flex items-center mb-4">
                  <Target className="h-6 w-6 text-red-600 dark:text-red-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cele zespołu</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Definiuj i śledź kaskadowe cele
                </p>
                <div className="text-blue-600 dark:text-blue-400 group-hover:underline flex items-center">
                  Zobacz cele <CheckSquare className="h-3 w-3 ml-1" />
                </div>
              </div>
            </Link>
          </div>
          
          <div className="text-center mt-12 pt-6 border-t dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © Boardmeeting Kanban {new Date().getFullYear()} – Aplikacja wizualnego zarządzania spotkaniami zespołowymi
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
