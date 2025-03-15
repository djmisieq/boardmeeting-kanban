import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  PieChart, 
  Clock, 
  Check, 
  Target, 
  Building, 
  Bookmark,
  Edit,
  Trash,
  CheckSquare,
  Flag
} from 'lucide-react';
import { useProjectsStore } from '@/store/use-projects-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { Project } from '@/lib/types';
import ProjectTasksTab from './project-tasks-tab';
import ProjectMilestonesTab from './project-milestones-tab';

interface ProjectDetailProps {
  projectId: string;
}

const ProjectDetail = ({ projectId }: ProjectDetailProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'milestones'>('overview');
  const { projects, updateProject, deleteProject } = useProjectsStore();
  const { departments } = useDepartmentsStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  
  // Znajdź projekt
  useEffect(() => {
    const foundProject = projects.find(p => p.id === projectId);
    setProject(foundProject || null);
    setLoading(false);
  }, [projectId, projects]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
        <h3 className="text-red-800 dark:text-red-200 font-medium">Projekt nie został znaleziony</h3>
        <p className="text-red-700 dark:text-red-300 mt-1">
          Projekt o ID {projectId} nie istnieje lub został usunięty.
        </p>
      </div>
    );
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'planning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'on-hold':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'Nie rozpoczęty';
      case 'planning':
        return 'Planowanie';
      case 'in-progress':
        return 'W trakcie';
      case 'on-hold':
        return 'Wstrzymany';
      case 'completed':
        return 'Zakończony';
      default:
        return status;
    }
  };
  
  const handleDeleteProject = () => {
    if (window.confirm(`Czy na pewno chcesz usunąć projekt "${project.name}"? Ta operacja jest nieodwracalna.`)) {
      deleteProject(project.id);
      window.location.href = '/projects'; // Przekierowanie po usunięciu
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* Nagłówek projektu */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            title="Edytuj projekt"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={handleDeleteProject}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            title="Usuń projekt"
          >
            <Trash className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-3 mb-1">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
            {getStatusLabel(project.status)}
          </span>
          <span className="text-white text-opacity-80">{project.progress}% ukończone</span>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-white text-opacity-90">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            <span>{project.owner}</span>
          </div>
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-2" />
            <span>{project.departments.length} {project.departments.length === 1 ? 'dział' : 'działy'}</span>
          </div>
          <div className="flex items-center">
            <CheckSquare className="h-4 w-4 mr-2" />
            <span>{project.tasks.length} {project.tasks.length === 1 ? 'zadanie' : 'zadania'}</span>
          </div>
          <div className="flex items-center">
            <Flag className="h-4 w-4 mr-2" />
            <span>{project.milestones.length} {project.milestones.length === 1 ? 'kamień milowy' : 'kamienie milowe'}</span>
          </div>
        </div>
      </div>
      
      {/* Pasek postępu */}
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700">
        <div
          className="absolute top-0 left-0 h-full bg-green-500"
          style={{ width: `${project.progress}%` }}
        />
      </div>
      
      {/* Zakładki */}
      <div className="border-b dark:border-gray-700">
        <nav className="flex px-6">
          <button
            className={`py-4 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent hover:border-gray-300 text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Przegląd
          </button>
          <button
            className={`py-4 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent hover:border-gray-300 text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('tasks')}
          >
            Zadania
          </button>
          <button
            className={`py-4 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'milestones'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent hover:border-gray-300 text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('milestones')}
          >
            Kamienie milowe
          </button>
        </nav>
      </div>
      
      {/* Treść zakładki */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Opis projektu */}
            <div>
              <h3 className="text-lg font-medium mb-2">Opis projektu</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {project.description || 'Brak opisu projektu.'}
              </p>
            </div>
            
            {/* Statystyki */}
            <div>
              <h3 className="text-lg font-medium mb-4">Statystyki projektu</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex">
                  <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                  </div>
                  <div>
                    <h4 className="text-sm text-blue-700 dark:text-blue-300 font-medium">Status</h4>
                    <p className="text-lg font-semibold">{getStatusLabel(project.status)}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex">
                  <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full mr-4">
                    <PieChart className="h-6 w-6 text-green-700 dark:text-green-300" />
                  </div>
                  <div>
                    <h4 className="text-sm text-green-700 dark:text-green-300 font-medium">Postęp</h4>
                    <p className="text-lg font-semibold">{project.progress}%</p>
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg flex">
                  <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-full mr-4">
                    <Target className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                  </div>
                  <div>
                    <h4 className="text-sm text-purple-700 dark:text-purple-300 font-medium">Ukończone kamienie milowe</h4>
                    <p className="text-lg font-semibold">
                      {project.milestones.filter(m => m.completed).length}/{project.milestones.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Zaangażowane działy */}
            <div>
              <h3 className="text-lg font-medium mb-2">Zaangażowane działy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {project.departments.map(deptId => {
                  const department = departments.find(d => d.id === deptId);
                  return department ? (
                    <div 
                      key={deptId} 
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md border dark:border-gray-600"
                    >
                      <Building className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                      <span>{department.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            
            {/* Tagi */}
            {project.tags && project.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Tagi</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center"
                    >
                      <Bookmark className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'tasks' && (
          <ProjectTasksTab project={project} />
        )}
        
        {activeTab === 'milestones' && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Funkcja widoku kamieni milowych będzie dostępna wkrótce.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;