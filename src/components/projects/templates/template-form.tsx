import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Check, 
  AlertCircle, 
  Plus, 
  Trash
} from 'lucide-react';
import { useTemplatesStore, CustomProjectTemplate } from '@/store/use-templates-store';
import { SuggestedMilestone } from '@/lib/project-suggestions';

interface TemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  template: CustomProjectTemplate | null; // Jeśli null, to tworzymy nowy szablon
}

interface MilestoneFormData {
  name: string;
  description: string;
  relativeDays: number;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ 
  isOpen, 
  onClose, 
  template 
}) => {
  const { createTemplate, updateTemplate } = useTemplatesStore();
  
  // Stan formularza
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [applicableCategories, setApplicableCategories] = useState<('task' | 'problem' | 'idea')[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [milestones, setMilestones] = useState<MilestoneFormData[]>([]);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDescription, setNewMilestoneDescription] = useState('');
  const [newMilestoneRelativeDays, setNewMilestoneRelativeDays] = useState(0);
  const [error, setError] = useState('');
  
  // Inicjalizacja formularza, jeśli edytujemy istniejący szablon
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setEstimatedDuration(template.estimatedDuration);
      setApplicableCategories([...template.applicableCategories]);
      setKeywords([...template.keywords]);
      
      // Konwersja SuggestedMilestone na MilestoneFormData
      const formattedMilestones: MilestoneFormData[] = template.suggestedMilestones.map(milestone => ({
        name: milestone.name,
        description: milestone.description,
        relativeDays: milestone.relativeDays
      }));
      
      setMilestones(formattedMilestones);
    } else {
      // Domyślne wartości dla nowego szablonu
      setName('');
      setDescription('');
      setEstimatedDuration(30);
      setApplicableCategories(['task']);
      setKeywords([]);
      setMilestones([]);
    }
  }, [template]);
  
  // Funkcja pomocnicza do walidacji
  const validateForm = () => {
    if (!name.trim()) {
      setError('Nazwa szablonu jest wymagana');
      return false;
    }
    
    if (applicableCategories.length === 0) {
      setError('Wybierz co najmniej jedną kategorię, do której szablon jest odpowiedni');
      return false;
    }
    
    if (estimatedDuration <= 0) {
      setError('Przewidywany czas trwania musi być większy od zera');
      return false;
    }
    
    setError('');
    return true;
  };
  
  // Obsługa zapisywania formularza
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // Konwersja MilestoneFormData na SuggestedMilestone
    const suggestedMilestones: SuggestedMilestone[] = milestones.map(milestone => ({
      name: milestone.name,
      description: milestone.description,
      relativeDays: milestone.relativeDays
    }));
    
    // Tworzenie lub aktualizacja szablonu
    if (template) {
      // Aktualizacja
      updateTemplate(template.id, {
        name,
        description,
        estimatedDuration,
        applicableCategories,
        keywords,
        suggestedMilestones
      });
    } else {
      // Tworzenie nowego
      createTemplate({
        name,
        description,
        estimatedDuration,
        applicableCategories,
        keywords,
        suggestedMilestones,
        isCustom: true
      });
    }
    
    onClose();
  };
  
  // Obsługa kategorii
  const toggleCategory = (category: 'task' | 'problem' | 'idea') => {
    if (applicableCategories.includes(category)) {
      setApplicableCategories(applicableCategories.filter(c => c !== category));
    } else {
      setApplicableCategories([...applicableCategories, category]);
    }
  };
  
  // Dodawanie słowa kluczowego
  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };
  
  // Usuwanie słowa kluczowego
  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };
  
  // Dodawanie kamienia milowego
  const addMilestone = () => {
    if (!newMilestoneName.trim()) {
      setError('Nazwa kamienia milowego jest wymagana');
      return;
    }
    
    const newMilestone: MilestoneFormData = {
      name: newMilestoneName.trim(),
      description: newMilestoneDescription.trim(),
      relativeDays: newMilestoneRelativeDays
    };
    
    // Sortuj kamienie milowe według dni
    const updatedMilestones = [...milestones, newMilestone]
      .sort((a, b) => a.relativeDays - b.relativeDays);
    
    setMilestones(updatedMilestones);
    setNewMilestoneName('');
    setNewMilestoneDescription('');
    setNewMilestoneRelativeDays(estimatedDuration > 0 ? Math.round(estimatedDuration / 2) : 15);
    setError('');
  };
  
  // Usuwanie kamienia milowego
  const removeMilestone = (index: number) => {
    const updatedMilestones = [...milestones];
    updatedMilestones.splice(index, 1);
    setMilestones(updatedMilestones);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl animate-scaleIn overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {template ? 'Edytuj szablon projektu' : 'Utwórz nowy szablon projektu'}
          </h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Treść formularza */}
        <div className="overflow-y-auto p-6 flex-grow">
          {/* Komunikat błędu */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4 rounded">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            {/* Podstawowe informacje */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informacje podstawowe</h3>
              
              <div>
                <label htmlFor="templateName" className="block text-sm font-medium mb-1">
                  Nazwa szablonu *
                </label>
                <input
                  id="templateName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  placeholder="np. Wdrożenie systemu, Analiza procesu..."
                  autoFocus
                />
              </div>
              
              <div>
                <label htmlFor="templateDescription" className="block text-sm font-medium mb-1">
                  Opis szablonu
                </label>
                <textarea
                  id="templateDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-md h-24 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Opisz, kiedy i do jakich projektów powinien być stosowany ten szablon..."
                />
              </div>
              
              <div>
                <label htmlFor="estimatedDuration" className="block text-sm font-medium mb-1">
                  Przewidywany czas trwania (dni) *
                </label>
                <input
                  id="estimatedDuration"
                  type="number"
                  min="1"
                  value={estimatedDuration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      setEstimatedDuration(value);
                    }
                  }}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Odpowiedni dla typów kart *
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCategory('task')}
                    className={`px-3 py-1.5 rounded-md flex items-center ${
                      applicableCategories.includes('task')
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <div className={`w-4 h-4 flex items-center justify-center border rounded mr-2 ${
                      applicableCategories.includes('task')
                        ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600'
                        : 'border-gray-400 dark:border-gray-500'
                    }`}>
                      {applicableCategories.includes('task') && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    Zadania
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => toggleCategory('problem')}
                    className={`px-3 py-1.5 rounded-md flex items-center ${
                      applicableCategories.includes('problem')
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <div className={`w-4 h-4 flex items-center justify-center border rounded mr-2 ${
                      applicableCategories.includes('problem')
                        ? 'bg-amber-500 border-amber-500 dark:bg-amber-600 dark:border-amber-600'
                        : 'border-gray-400 dark:border-gray-500'
                    }`}>
                      {applicableCategories.includes('problem') && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    Problemy
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => toggleCategory('idea')}
                    className={`px-3 py-1.5 rounded-md flex items-center ${
                      applicableCategories.includes('idea')
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <div className={`w-4 h-4 flex items-center justify-center border rounded mr-2 ${
                      applicableCategories.includes('idea')
                        ? 'bg-yellow-500 border-yellow-500 dark:bg-yellow-600 dark:border-yellow-600'
                        : 'border-gray-400 dark:border-gray-500'
                    }`}>
                      {applicableCategories.includes('idea') && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    Usprawnienia
                  </button>
                </div>
              </div>
            </div>
            
            {/* Słowa kluczowe */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Słowa kluczowe</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Słowa kluczowe pomagają w automatycznym wykrywaniu odpowiedniego szablonu podczas tworzenia projektu.
              </p>
              
              <div className="flex">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="flex-grow p-2 border rounded-l-md dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Dodaj słowo kluczowe..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newKeyword.trim()) {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywords.map((keyword, index) => (
                    <div 
                      key={index} 
                      className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Kamienie milowe */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Kamienie milowe</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Dodaj typowe kamienie milowe, które będą proponowane podczas tworzenia projektu z tego szablonu.
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
                  <label htmlFor="milestoneRelativeDays" className="block text-sm font-medium mb-1">
                    Dni od rozpoczęcia projektu
                  </label>
                  <div className="relative">
                    <input
                      id="milestoneRelativeDays"
                      type="number"
                      min="0"
                      max={estimatedDuration}
                      value={newMilestoneRelativeDays}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 0) {
                          setNewMilestoneRelativeDays(value);
                        }
                      }}
                      className="w-full p-2 pl-8 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    />
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={addMilestone}
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
                            {milestone.relativeDays} dni od rozpoczęcia
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Przyciski akcji */}
        <div className="flex justify-end items-center p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors mr-2"
          >
            Anuluj
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {template ? 'Zapisz zmiany' : 'Utwórz szablon'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateForm;