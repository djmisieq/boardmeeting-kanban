import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Check, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { CardType, Project, ProjectTask, ProjectMilestone } from '@/lib/types';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useProjectsStore } from '@/store/use-projects-store';
import { 
  findBestTemplateForCard, 
  getSuggestedMilestonesForCard, 
  getSuggestedEndDate,
  getSuggestedTags
} from '@/lib/project-suggestions';

interface CardToProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardType;
  boardId: string;
  columnId: string;
  category: 'task' | 'problem' | 'idea';
  departmentId: string;
}

interface MilestoneFormData {
  name: string;
  description: string;
  date: string;
}

const CardToProjectDialog = ({
  isOpen,
  onClose,
  card,
  boardId,
  columnId,
  category,
  departmentId
}: CardToProjectDialogProps) => {
  const { departments } = useDepartmentsStore();
  const { createProject, addTaskToProject, addMilestone } = useProjectsStore();
  
  // Stan dla formularza
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState(card.title);
  const [projectDescription, setProjectDescription] = useState(card.description || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [projectOwner, setProjectOwner] = useState(card.assignee || '');
  const [involvedDepartments, setInvolvedDepartments] = useState<string[]>([departmentId]);
  const [milestones, setMilestones] = useState<MilestoneFormData[]>([]);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDescription, setNewMilestoneDescription] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [error, setError] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Efekt inicjalizacji sugestii
  useEffect(() => {
    if (isOpen) {
      // Ustaw sugerowaną datę zakończenia
      const suggestedEndDate = getSuggestedEndDate(startDate, category);
      setEndDate(suggestedEndDate);
      
      // Ustaw sugerowane tagi
      const suggestedTags = getSuggestedTags(card, category);
      setTags(suggestedTags);
      
      // Znajdź najlepszy szablon
      const template = findBestTemplateForCard(card, category);
      if (template) {
        setSelectedTemplate(template.name);
      }
    }
  }, [isOpen, card, category, startDate]);
  
  // Pomocnicza funkcja walidacji
  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!projectName.trim()) {
        setError('Nazwa projektu jest wymagana');
        return false;
      }
      if (!startDate) {
        setError('Data rozpoczęcia jest wymagana');
        return false;
      }
      if (!endDate) {
        setError('Data zakończenia jest wymagana');
        return false;
      }
      
      // Sprawdzenie czy data zakończenia jest późniejsza niż rozpoczęcia
      if (new Date(endDate) <= new Date(startDate)) {
        setError('Data zakończenia musi być późniejsza niż data rozpoczęcia');
        return false;
      }
    }
    
    if (currentStep === 2) {
      if (!projectOwner.trim()) {
        setError('Właściciel projektu jest wymagany');
        return false;
      }
      if (involvedDepartments.length === 0) {
        setError('Musisz wybrać co najmniej jeden dział');
        return false;
      }
    }
    
    setError('');
    return true;
  };
  
  // Przejście do następnego kroku
  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };
  
  // Przejście do poprzedniego kroku
  const prevStep = () => {
    setStep(step - 1);
  };
  
  // Dodawanie kamienia milowego
  const addMilestoneToList = () => {
    if (!newMilestoneName.trim()) {
      setError('Nazwa kamienia milowego jest wymagana');
      return;
    }
    if (!newMilestoneDate) {
      setError('Data kamienia milowego jest wymagana');
      return;
    }
    
    const milestone: MilestoneFormData = {
      name: newMilestoneName,
      description: newMilestoneDescription,
      date: newMilestoneDate
    };
    
    setMilestones([...milestones, milestone]);
    setNewMilestoneName('');
    setNewMilestoneDescription('');
    setNewMilestoneDate('');
    setError('');
  };
  
  // Usuwanie kamienia milowego
  const removeMilestone = (index: number) => {
    const updatedMilestones = [...milestones];
    updatedMilestones.splice(index, 1);
    setMilestones(updatedMilestones);
  };
  
  // Toggle dla działów
  const toggleDepartment = (deptId: string) => {
    if (involvedDepartments.includes(deptId)) {
      setInvolvedDepartments(involvedDepartments.filter(id => id !== deptId));
    } else {
      setInvolvedDepartments([...involvedDepartments, deptId]);
    }
  };
  
  // Funkcja generująca sugerowane kamienie milowe
  const generateSuggestedMilestones = () => {
    const { milestones: suggestedMilestones } = getSuggestedMilestonesForCard(card, category, startDate);
    
    // Konwersja do formatu MilestoneFormData
    const milestoneData: MilestoneFormData[] = suggestedMilestones.map(milestone => {
      const milestoneDate = new Date(startDate);
      milestoneDate.setDate(milestoneDate.getDate() + milestone.relativeDays);
      
      return {
        name: milestone.name,
        description: milestone.description,
        date: milestoneDate.toISOString().split('T')[0]
      };
    });
    
    setMilestones(milestoneData);
  };
  
  // Dodanie/usunięcie tagu
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };
  
  // Utworzenie projektu
  const createProjectFromCard = () => {
    try {
      // Tworzenie nowego projektu
      const projectId = createProject({
        name: projectName,
        description: projectDescription,
        status: 'planning',
        startDate,
        endDate,
        owner: projectOwner,
        departments: involvedDepartments,
        tasks: [],
        tags,
        milestones: []
      });
      
      // Dodanie oryginalnej karty jako zadania w projekcie
      addTaskToProject(projectId, {
        cardId: card.id,
        boardId,
        departmentId,
        dependsOn: []
      });
      
      // Dodanie kamieni milowych
      milestones.forEach(milestone => {
        addMilestone(projectId, {
          name: milestone.name,
          description: milestone.description,
          date: milestone.date,
          completed: false,
          taskIds: []
        });
      });
      
      // Aktualizacja karty z informacją o przypisanym projekcie
      // To będzie zrobione w rodzicu, który wywoła tę funkcję
      
      onClose();
    } catch (err) {
      console.error('Błąd podczas tworzenia projektu:', err);
      setError('Wystąpił błąd podczas tworzenia projektu');
    }
  };
  
  if (!isOpen) return null;
  
  // Renderowanie informacji o wykrytym szablonie
  const renderTemplateInfo = () => {
    if (!selectedTemplate) return null;
    
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-4 rounded">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
          <div>
            <p className="text-blue-700 dark:text-blue-400 font-medium">
              Wykryto szablon: {selectedTemplate}
            </p>
            <p className="text-blue-600 dark:text-blue-300 text-sm mt-1">
              Na podstawie analizy karty, sugerujemy szablon projektu typu "{selectedTemplate}". 
              Dane projektu zostały wstępnie wypełnione na podstawie tego szablonu.
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl animate-scaleIn overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Przekształć kartę w projekt</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Treść formularza */}
        <div className="overflow-y-auto p-6 flex-grow">
          {/* Pasek postępu */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${step >= 1 ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                Podstawowe informacje
              </span>
              <span className={`text-sm ${step >= 2 ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                Działy i zasoby
              </span>
              <span className={`text-sm ${step >= 3 ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                Kamienie milowe
              </span>
              <span className={`text-sm ${step >= 4 ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                Podsumowanie
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Komunikat błędu */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4 rounded">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}
          
          {/* Informacja o wykrytym szablonie */}
          {step === 1 && renderTemplateInfo()}
          
          {/* Krok 1: Podstawowe informacje */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium mb-1">
                  Nazwa projektu *
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  autoFocus
                />
              </div>
              
              <div>
                <label htmlFor="projectDescription" className="block text-sm font-medium mb-1">
                  Opis projektu
                </label>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full p-2 border rounded-md h-24 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Opisz cel projektu i główne założenia..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                    Data rozpoczęcia *
                  </label>
                  <div className="relative">
                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2 pl-8 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    />
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                    Data zakończenia *
                  </label>
                  <div className="relative">
                    <input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2 pl-8 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    />
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tagi projektu</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['wdrożenie', 'optymalizacja', 'naprawa', 'analiza', 'badanie', category].map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        tags.includes(tag)
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Krok 2: Działy i zasoby */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="projectOwner" className="block text-sm font-medium mb-1">
                  Właściciel projektu *
                </label>
                <div className="relative">
                  <input
                    id="projectOwner"
                    type="text"
                    value={projectOwner}
                    onChange={(e) => setProjectOwner(e.target.value)}
                    className="w-full p-2 pl-8 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Osoba odpowiedzialna za projekt"
                  />
                  <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Zaangażowane działy *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {departments.map(dept => (
                    <div
                      key={dept.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        involvedDepartments.includes(dept.id)
                          ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-500'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                      }`}
                      onClick={() => toggleDepartment(dept.id)}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 flex items-center justify-center border rounded mr-2 ${
                          involvedDepartments.includes(dept.id)
                            ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600'
                            : 'border-gray-400 dark:border-gray-500'
                        }`}>
                          {involvedDepartments.includes(dept.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {dept.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Krok 3: Kamienie milowe */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Kamienie milowe projektu</h3>
                  <button
                    onClick={generateSuggestedMilestones}
                    className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    title="Generuj sugerowane kamienie milowe na podstawie typu projektu i karty"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Sugeruj kamienie milowe
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Dodaj kluczowe etapy projektu. Kamienie milowe pomogą monitorować postęp.
                </p>
                
                <div className="border dark:border-gray-700 rounded-md p-4 space-y-3">
                  <div>
                    <label htmlFor="milestoneName" className="block text-sm font-medium mb-1">
                      Nazwa kamienia milowego
                    </label>
                    <input
                      id="milestoneName"
                      type="text"
                      value={newMilestoneName}
                      onChange={(e) => setNewMilestoneName(e.target.value)}
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                      placeholder="np. Zakończenie analizy, Rozpoczęcie wdrożenia..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="milestoneDescription" className="block text-sm font-medium mb-1">
                      Opis (opcjonalnie)
                    </label>
                    <input
                      id="milestoneDescription"
                      type="text"
                      value={newMilestoneDescription}
                      onChange={(e) => setNewMilestoneDescription(e.target.value)}
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="milestoneDate" className="block text-sm font-medium mb-1">
                      Data
                    </label>
                    <div className="relative">
                      <input
                        id="milestoneDate"
                        type="date"
                        value={newMilestoneDate}
                        onChange={(e) => setNewMilestoneDate(e.target.value)}
                        className="w-full p-2 pl-8 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                      />
                      <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <button
                    onClick={addMilestoneToList}
                    className="w-full py-2 mt-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Dodaj kamień milowy
                  </button>
                </div>
                
                {/* Lista dodanych kamieni milowych */}
                {milestones.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Dodane kamienie milowe:</h4>
                    <div className="space-y-2">
                      {milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-md"
                        >
                          <div>
                            <div className="font-medium">{milestone.name}</div>
                            {milestone.description && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">{milestone.description}</div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {milestone.date}
                            </div>
                          </div>
                          <button
                            onClick={() => removeMilestone(index)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Krok 4: Podsumowanie */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-2">Podsumowanie projektu</h3>
              
              <div className="border dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800 divide-y dark:divide-gray-700">
                <div className="py-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Nazwa projektu</div>
                  <div className="font-medium">{projectName}</div>
                </div>
                
                <div className="py-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Opis</div>
                  <div>{projectDescription || <span className="text-gray-400 italic">Brak opisu</span>}</div>
                </div>
                
                <div className="py-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Okres</div>
                  <div>
                    {startDate} - {endDate}
                  </div>
                </div>
                
                <div className="py-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Właściciel</div>
                  <div>{projectOwner}</div>
                </div>
                
                <div className="py-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Zaangażowane działy</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {involvedDepartments.map(deptId => {
                      const dept = departments.find(d => d.id === deptId);
                      return dept ? (
                        <span
                          key={deptId}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                        >
                          {dept.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                
                <div className="py-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Tagi</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="py-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Kamienie milowe ({milestones.length})</div>
                  {milestones.length === 0 ? (
                    <div className="italic text-gray-400 dark:text-gray-500">Brak zdefiniowanych kamieni milowych</div>
                  ) : (
                    <div className="mt-1 space-y-1">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{milestone.name}</span> ({milestone.date})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mt-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  Po utworzeniu projektu, oryginalna karta pozostanie na tablicy Kanban i będzie powiązana z projektem.
                  Możesz później dodawać więcej zadań do projektu.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Przyciski akcji */}
        <div className="flex justify-between items-center p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
            >
              Wróć
            </button>
          ) : (
            <div></div>
          )}
          
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Dalej
            </button>
          ) : (
            <button
              onClick={createProjectFromCard}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Utwórz projekt
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardToProjectDialog;