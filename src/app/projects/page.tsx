'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/navbar';
import { useProjectsStore } from '@/store/use-projects-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import ProjectCard from '@/components/projects/project-card';
import ProjectForm from '@/components/projects/project-form';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  PauseCircle, 
  AlertTriangle, 
  Tag 
} from 'lucide-react';
import { ProjectStatus } from '@/lib/types';

export default function ProjectsPage() {
  const { projects } = useProjectsStore();
  const { departments } = useDepartmentsStore();
  
  // Stan dla filtrów i wyszukiwania
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  
  // Filtrowanie projektów
  const filteredProjects = projects.filter(project => {
    // Filtr według wyszukiwanego tekstu
    if (searchQuery && 
        !project.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !project.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filtr według statusu
    if (filterStatus !== 'all' && project.status !== filterStatus) {
      return false;
    }
    
    // Filtr według działu
    if (filterDepartment && !project.departments.includes(filterDepartment)) {
      return false;
    }
    
    return true;
  });
  
  // Sortowanie projektów - najpierw w trakcie, potem planowane, potem zakończone
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const statusOrder = {
      'in-progress': 0,
      'planning': 1,
      'not-started': 2,
      'on-hold': 3,
      'completed': 4
    };
    
    // Sortuj według statusu
    const statusComparison = statusOrder[a.status] - statusOrder[b.status];
    if (statusComparison !== 0) return statusComparison;
    
    // Jeśli status jest taki sam, sortuj według daty zakończenia (od najbliższej)
    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
  });
  
  // Obsługa pomyślnego utworzenia projektu
  const handleProjectCreated = (projectId: string) => {
    setShowNewProjectForm(false);
    // Tutaj można dodać np. przekierowanie do widoku szczegółów projektu
  };
  
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Projekty międzydziałowe</h1>
          
          <button
            onClick={() => setShowNewProjectForm(prev => !prev)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            {showNewProjectForm ? 'Anuluj' : 'Nowy projekt'}
            {!showNewProjectForm && <Plus size={16} />}
          </button>
        </div>
        
        {showNewProjectForm && (
          <div className="mb-8 bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Utwórz nowy projekt</h2>
            <ProjectForm 
              onSuccess={handleProjectCreated}
              onCancel={() => setShowNewProjectForm(false)}
            />
          </div>
        )}
        
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Szukaj projektów..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | 'all')}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="in-progress">W trakcie</option>
            <option value="planning">Planowanie</option>
            <option value="not-started">Nie rozpoczęte</option>
            <option value="on-hold">Wstrzymane</option>
            <option value="completed">Zakończone</option>
          </select>
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Wszystkie działy</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Statystyki projektów */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Wszystkie projekty</div>
                <div className="text-2xl font-semibold">{projects.length}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">W trakcie</div>
                <div className="text-2xl font-semibold">
                  {projects.filter(p => p.status === 'in-progress').length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                <PauseCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Wstrzymane</div>
                <div className="text-2xl font-semibold">
                  {projects.filter(p => p.status === 'on-hold').length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Zakończone</div>
                <div className="text-2xl font-semibold">
                  {projects.filter(p => p.status === 'completed').length}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {sortedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                showDetails={true} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">Brak projektów</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || filterStatus !== 'all' || filterDepartment
                ? 'Nie znaleziono projektów spełniających kryteria wyszukiwania.'
                : 'Nie utworzono jeszcze żadnych projektów międzydziałowych.'}
            </p>
            {!showNewProjectForm && (
              <button
                onClick={() => setShowNewProjectForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 mx-auto"
              >
                Utwórz pierwszy projekt
                <Plus size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
