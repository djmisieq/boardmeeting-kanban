import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { PROJECT_TEMPLATES, ProjectTemplate, SuggestedMilestone } from '@/lib/project-suggestions';
import { Project } from '@/lib/types';

// Rozszerzony typ ProjectTemplate z dodatkowymi polami
export interface CustomProjectTemplate extends ProjectTemplate {
  id: string;
  createdAt: string;
  updatedAt: string;
  isCustom: boolean; // Flaga wskazująca czy jest to niestandardowy szablon użytkownika
  usageCount: number; // Licznik użycia szablonu
}

interface TemplatesState {
  templates: CustomProjectTemplate[];
  selectedTemplateId: string | null;
  loading: boolean;
  error: string | null;
  
  // Akcje
  initializeTemplates: () => void; // Inicjalizacja szablonów z domyślnych
  createTemplate: (template: Omit<CustomProjectTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => string;
  updateTemplate: (id: string, updates: Partial<CustomProjectTemplate>) => void;
  deleteTemplate: (id: string) => void;
  selectTemplate: (id: string | null) => void;
  incrementUsageCount: (id: string) => void;
  createTemplateFromProject: (project: Project, name: string, applicableCategories: ('task' | 'problem' | 'idea')[]) => string;
  getTemplateById: (id: string) => CustomProjectTemplate | null;
  getTemplateByName: (name: string) => CustomProjectTemplate | null;
  getDuplicateTemplateName: (name: string) => string;
}

// Konwersja domyślnych szablonów na format CustomProjectTemplate
const convertDefaultTemplates = (): CustomProjectTemplate[] => {
  const now = new Date().toISOString();
  
  return PROJECT_TEMPLATES.map(template => ({
    ...template,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    isCustom: false,
    usageCount: 0
  }));
};

export const useTemplatesStore = create<TemplatesState>((set, get) => ({
  templates: [],
  selectedTemplateId: null,
  loading: false,
  error: null,
  
  // Inicjalizacja szablonów
  initializeTemplates: () => {
    // Konwersja domyślnych szablonów
    const defaultTemplates = convertDefaultTemplates();
    
    // Próba załadowania zapisanych szablonów z localStorage
    const storedTemplatesJson = typeof window !== 'undefined' 
      ? localStorage.getItem('custom-project-templates') 
      : null;
    
    if (storedTemplatesJson) {
      try {
        const storedTemplates = JSON.parse(storedTemplatesJson) as CustomProjectTemplate[];
        
        // Łączenie domyślnych z zapisanymi, ale nie duplikuj domyślnych
        const combinedTemplates = [
          ...defaultTemplates.filter(dt => !storedTemplates.some(st => st.name === dt.name && !st.isCustom)),
          ...storedTemplates
        ];
        
        set({ templates: combinedTemplates });
      } catch (error) {
        console.error('Błąd podczas ładowania szablonów z localStorage:', error);
        set({ templates: defaultTemplates });
      }
    } else {
      set({ templates: defaultTemplates });
    }
  },
  
  // Tworzenie nowego szablonu
  createTemplate: (templateData) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newTemplate: CustomProjectTemplate = {
      ...templateData,
      id,
      createdAt: now,
      updatedAt: now,
      usageCount: 0
    };
    
    set(state => {
      const updatedTemplates = [...state.templates, newTemplate];
      
      // Zapisz do localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('custom-project-templates', JSON.stringify(updatedTemplates));
      }
      
      return { templates: updatedTemplates };
    });
    
    return id;
  },
  
  // Aktualizacja szablonu
  updateTemplate: (id, updates) => {
    set(state => {
      const templateIndex = state.templates.findIndex(t => t.id === id);
      
      if (templateIndex === -1) return state;
      
      const updatedTemplates = [...state.templates];
      updatedTemplates[templateIndex] = {
        ...updatedTemplates[templateIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Zapisz do localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('custom-project-templates', JSON.stringify(updatedTemplates));
      }
      
      return { templates: updatedTemplates };
    });
  },
  
  // Usunięcie szablonu
  deleteTemplate: (id) => {
    set(state => {
      // Nie pozwól usunąć domyślnych szablonów
      const template = state.templates.find(t => t.id === id);
      if (template && !template.isCustom) {
        return { 
          error: 'Nie można usunąć wbudowanego szablonu systemowego' 
        };
      }
      
      const updatedTemplates = state.templates.filter(t => t.id !== id);
      
      // Zapisz do localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('custom-project-templates', JSON.stringify(updatedTemplates));
      }
      
      return { 
        templates: updatedTemplates,
        selectedTemplateId: state.selectedTemplateId === id ? null : state.selectedTemplateId
      };
    });
  },
  
  // Wybór szablonu
  selectTemplate: (id) => {
    set({ selectedTemplateId: id });
  },
  
  // Zwiększenie licznika użycia
  incrementUsageCount: (id) => {
    set(state => {
      const templateIndex = state.templates.findIndex(t => t.id === id);
      
      if (templateIndex === -1) return state;
      
      const updatedTemplates = [...state.templates];
      updatedTemplates[templateIndex] = {
        ...updatedTemplates[templateIndex],
        usageCount: updatedTemplates[templateIndex].usageCount + 1,
        updatedAt: new Date().toISOString()
      };
      
      // Zapisz do localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('custom-project-templates', JSON.stringify(updatedTemplates));
      }
      
      return { templates: updatedTemplates };
    });
  },
  
  // Tworzenie szablonu na podstawie istniejącego projektu
  createTemplateFromProject: (project, name, applicableCategories) => {
    // Konwersja kamieni milowych projektu na format SuggestedMilestone
    const suggestedMilestones: SuggestedMilestone[] = project.milestones.map(milestone => {
      // Obliczenie względnej liczby dni od daty rozpoczęcia projektu
      const milestoneDate = new Date(milestone.date);
      const projectStartDate = new Date(project.startDate);
      const relativeDays = Math.round((milestoneDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        name: milestone.name,
        description: milestone.description || '',
        relativeDays: relativeDays
      };
    });
    
    // Obliczenie przewidywanego czasu trwania projektu w dniach
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const estimatedDuration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Utworzenie nowego szablonu
    const templateData: Omit<CustomProjectTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> = {
      name,
      description: `Szablon utworzony na podstawie projektu "${project.name}"`,
      estimatedDuration,
      suggestedMilestones,
      applicableCategories,
      keywords: project.tags || [],
      isCustom: true
    };
    
    return get().createTemplate(templateData);
  },
  
  // Pobranie szablonu po ID
  getTemplateById: (id) => {
    return get().templates.find(t => t.id === id) || null;
  },
  
  // Pobranie szablonu po nazwie
  getTemplateByName: (name) => {
    return get().templates.find(t => t.name === name) || null;
  },
  
  // Generowanie unikalnej nazwy dla duplikatu szablonu
  getDuplicateTemplateName: (name) => {
    const templates = get().templates;
    let newName = `${name} (kopia)`;
    let counter = 1;
    
    while (templates.some(t => t.name === newName)) {
      counter++;
      newName = `${name} (kopia ${counter})`;
    }
    
    return newName;
  }
}));
