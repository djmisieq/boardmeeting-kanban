'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronDown, 
  Layout, 
  Calendar, 
  Columns, 
  Users, 
  FileText, 
  Layers, 
  BarChart2,
  Settings,
  CheckSquare,
  AlertCircle,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { useDepartmentsStore } from '@/store/use-departments-store';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { departments } = useDepartmentsStore();
  
  // Zarządzanie rozwinięciem sekcji
  const [expandedSections, setExpandedSections] = useState({
    meetings: false,
    boards: true,
    departments: false,
    projects: false,
    reports: false
  });
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Sprawdza czy dana ścieżka jest aktywna
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };
  
  return (
    <>
      {/* Przyciemnienie tła na urządzeniach mobilnych */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
    
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-30 h-full w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo i nazwa aplikacji */}
          <div className="p-4 border-b dark:border-gray-700">
            <Link href="/" className="flex items-center space-x-2">
              <Layout className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">BoardMeeting</span>
            </Link>
          </div>
          
          {/* Główna nawigacja */}
          <nav className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-1">
              {/* Dashboard */}
              <li>
                <Link 
                  href="/dashboard"
                  className={`flex items-center px-3 py-2 rounded-md ${
                    isActive('/dashboard') 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <BarChart2 className="h-5 w-5 mr-3" />
                  <span>Dashboard</span>
                </Link>
              </li>
              
              {/* Spotkania */}
              <li>
                <button
                  className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => toggleSection('meetings')}
                >
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>Spotkania</span>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${
                      expandedSections.meetings ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {expandedSections.meetings && (
                  <ul className="pl-10 mt-1 space-y-1">
                    <li>
                      <Link
                        href="/meetings/upcoming"
                        className={`block px-3 py-2 rounded-md ${
                          isActive('/meetings/upcoming') 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        Nadchodzące
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/meetings/past"
                        className={`block px-3 py-2 rounded-md ${
                          isActive('/meetings/past') 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        Poprzednie
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/meetings/notes"
                        className={`block px-3 py-2 rounded-md ${
                          isActive('/meetings/notes') 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Notatki ze spotkań
                        </div>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              
              {/* Tablice Kanban */}
              <li>
                <button
                  className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => toggleSection('boards')}
                >
                  <div className="flex items-center">
                    <Columns className="h-5 w-5 mr-3" />
                    <span>Tablice Kanban</span>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${
                      expandedSections.boards ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {expandedSections.boards && (
                  <ul className="pl-10 mt-1 space-y-1">
                    <li>
                      <Link
                        href="/board?type=tasks"
                        className={`flex items-center px-3 py-2 rounded-md ${
                          isActive('/board') && pathname?.includes('type=tasks')
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <CheckSquare className="h-4 w-4 mr-2 text-blue-500" />
                        Zadania
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/board?type=problems"
                        className={`flex items-center px-3 py-2 rounded-md ${
                          isActive('/board') && pathname?.includes('type=problems')
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                        Problemy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/board?type=ideas"
                        className={`flex items-center px-3 py-2 rounded-md ${
                          isActive('/board') && pathname?.includes('type=ideas')
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                        Usprawnienia
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/integrated-board"
                        className={`block px-3 py-2 rounded-md ${
                          isActive('/integrated-board') 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        Zintegrowana tablica
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              
              {/* Działy */}
              <li>
                <button
                  className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => toggleSection('departments')}
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3" />
                    <span>Działy</span>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${
                      expandedSections.departments ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {expandedSections.departments && (
                  <ul className="pl-10 mt-1 space-y-1">
                    {departments.map(dept => (
                      <li key={dept.id}>
                        <Link
                          href={`/dashboard?departmentId=${dept.id}`}
                          className={`block px-3 py-2 rounded-md truncate ${
                            pathname?.includes(`departmentId=${dept.id}`) 
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {dept.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/departments"
                        className={`block px-3 py-2 rounded-md ${
                          isActive('/departments') 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        Zarządzaj działami
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              
              {/* Projekty */}
              <li>
                <button
                  className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => toggleSection('projects')}
                >
                  <div className="flex items-center">
                    <Layers className="h-5 w-5 mr-3" />
                    <span>Projekty</span>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${
                      expandedSections.projects ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {expandedSections.projects && (
                  <ul className="pl-10 mt-1 space-y-1">
                    <li>
                      <Link
                        href="/projects/active"
                        className={`block px-3 py-2 rounded-md ${
                          isActive('/projects/active') 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        Aktywne
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/projects/completed"
                        className={`block px-3 py-2 rounded-md ${
                          isActive('/projects/completed') 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        Zakończone
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/projects/templates"
                        className={`block px-3 py-2 rounded-md ${
                          isActive('/projects/templates') 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        Szablony
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              
              {/* Raporty */}
              <li>
                <button
                  className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => toggleSection('reports')}
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-3" />
                    <span>Raporty</span>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${
                      expandedSections.reports ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {expandedSections.reports && (
                  <ul className="pl-10 mt-1 space-y-1">
                    <li>
                      <Link
                        href="/reports/performance"
                        className={`block px-3 py-2 rounded-md ${
                          isActive('/reports/performance') 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        Wydajność zespołów
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/reports/projects"
                        className={`block px-3 py-2 rounded-md ${
                          isActive('/reports/projects') 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        Status projektów
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </nav>
          
          {/* Stopka */}
          <div className="p-4 border-t dark:border-gray-700">
            <Link 
              href="/settings" 
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive('/settings') 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Settings className="h-5 w-5 mr-3" />
              <span>Ustawienia</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
