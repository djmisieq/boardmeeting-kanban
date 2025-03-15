import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash, 
  Copy, 
  Search, 
  X,
  Filter,
  Clock,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import { useTemplatesStore, CustomProjectTemplate } from '@/store/use-templates-store';
import TemplateForm from './template-form';

interface TemplateManagerProps {
  onSelectTemplate?: (template: CustomProjectTemplate) => void;
  selectionMode?: boolean;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ 
  onSelectTemplate,
  selectionMode = false
}) => {
  const { 
    templates, 
    deleteTemplate,
    initializeTemplates,
    getDuplicateTemplateName,
    createTemplate
  } = useTemplatesStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'task' | 'problem' | 'idea' | 'all'>('all');
  const [customFilter, setCustomFilter] = useState<'custom' | 'default' | 'all'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomProjectTemplate | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Inicjalizacja szablonów przy pierwszym renderowaniu
  useEffect(() => {
    initializeTemplates();
  }, [initializeTemplates]);
  
  // Filtrowanie szablonów
  const filteredTemplates = templates.filter(template => {
    // Filtr wyszukiwania
    if (
      searchTerm && 
      !template.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !template.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    
    // Filtr kategorii
    if (categoryFilter !== 'all' && !template.applicableCategories.includes(categoryFilter)) {
      return false;
    }
    
    // Filtr niestandardowych/domyślnych
    if (customFilter === 'custom' && !template.isCustom) {
      return false;
    }
    if (customFilter === 'default' && template.isCustom) {
      return false;
    }
    
    return true;
  });
  
  // Sortowanie szablonów - najpierw niestandardowe, potem według liczby użyć
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    // Najpierw według isCustom (niestandardowe na górze)
    if (a.isCustom && !b.isCustom) return -1;
    if (!a.isCustom && b.isCustom) return 1;
    
    // Potem według liczby użyć (malejąco)
    return b.usageCount - a.usageCount;
  });
  
  // Obsługa usuwania szablonu
  const handleDeleteTemplate = (id: string) => {
    setConfirmDeleteId(id);
  };
  
  // Potwierdzenie usunięcia
  const confirmDelete = () => {
    if (confirmDeleteId) {
      deleteTemplate(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };
  
  // Obsługa duplikowania szablonu
  const handleDuplicateTemplate = (template: CustomProjectTemplate) => {
    const newName = getDuplicateTemplateName(template.name);
    
    createTemplate({
      ...template,
      name: newName,
      isCustom: true, // Duplikat zawsze jest traktowany jako niestandardowy
    });
  };
  
  // Wybór szablonu (w trybie wyboru)
  const handleSelectTemplate = (template: CustomProjectTemplate) => {
    if (selectionMode && onSelectTemplate) {
      onSelectTemplate(template);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* Nagłówek */}
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Zarządzanie szablonami projektów</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nowy szablon
        </button>
      </div>
      
      {/* Filtry */}
      <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Wyszukiwanie */}
          <div className="flex-grow min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Szukaj szablonów..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-10 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                </button>
              )}
            </div>
          </div>
          
          {/* Filtr kategorii */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <Filter className="h-4 w-4 inline mr-1" /> Kategorie
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1 rounded-md text-sm ${
                  categoryFilter === 'all' 
                    ? 'bg-gray-200 dark:bg-gray-700 font-medium' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Wszystkie
              </button>
              <button
                onClick={() => setCategoryFilter('task')}
                className={`px-3 py-1 rounded-md text-sm ${
                  categoryFilter === 'task' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 font-medium' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Zadania
              </button>
              <button
                onClick={() => setCategoryFilter('problem')}
                className={`px-3 py-1 rounded-md text-sm ${
                  categoryFilter === 'problem' 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 font-medium' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Problemy
              </button>
              <button
                onClick={() => setCategoryFilter('idea')}
                className={`px-3 py-1 rounded-md text-sm ${
                  categoryFilter === 'idea' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 font-medium' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Usprawnienia
              </button>
            </div>
          </div>
          
          {/* Filtr szablonów niestandardowych/domyślnych */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Typ szablonu
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setCustomFilter('all')}
                className={`px-3 py-1 rounded-md text-sm ${
                  customFilter === 'all' 
                    ? 'bg-gray-200 dark:bg-gray-700 font-medium' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Wszystkie
              </button>
              <button
                onClick={() => setCustomFilter('custom')}
                className={`px-3 py-1 rounded-md text-sm ${
                  customFilter === 'custom' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 font-medium' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Niestandardowe
              </button>
              <button
                onClick={() => setCustomFilter('default')}
                className={`px-3 py-1 rounded-md text-sm ${
                  customFilter === 'default' 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 font-medium' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Systemowe
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lista szablonów */}
      <div className="p-4">
        {sortedTemplates.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="mb-2">Nie znaleziono szablonów spełniających kryteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setCustomFilter('all');
              }}
              className="text-blue-600 hover:underline"
            >
              Wyczyść filtry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortedTemplates.map(template => (
              <div 
                key={template.id} 
                className={`border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                  selectionMode ? 'cursor-pointer' : ''
                }`}
                onClick={() => selectionMode && handleSelectTemplate(template)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg mb-1 flex items-center">
                        {template.name}
                        {template.isCustom ? (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded">
                            Niestandardowy
                          </span>
                        ) : (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 rounded">
                            Systemowy
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        {template.description}
                      </p>
                    </div>
                    
                    {!selectionMode && (
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateTemplate(template);
                          }}
                          className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Duplikuj szablon"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        
                        {template.isCustom && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTemplate(template);
                              }}
                              className="p-1.5 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Edytuj szablon"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id);
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Usuń szablon"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="flex items-center text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      <Clock className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                      {template.estimatedDuration} dni
                    </div>
                    
                    {template.applicableCategories.map(category => (
                      <div 
                        key={category}
                        className={`flex items-center text-xs px-2 py-1 rounded ${
                          category === 'task'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                            : category === 'problem'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        }`}
                      >
                        {category === 'task' ? 'Zadania' : category === 'problem' ? 'Problemy' : 'Usprawnienia'}
                      </div>
                    ))}
                    
                    <div className="flex items-center text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      <Check className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                      {template.suggestedMilestones.length} kamieni milowych
                    </div>
                    
                    <div className="flex items-center text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      Użyto: {template.usageCount} razy
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Dialog formularza tworzenia/edycji szablonu */}
      {(showCreateForm || editingTemplate) && (
        <TemplateForm
          template={editingTemplate}
          isOpen={showCreateForm || !!editingTemplate}
          onClose={() => {
            setShowCreateForm(false);
            setEditingTemplate(null);
          }}
        />
      )}
      
      {/* Dialog potwierdzenia usunięcia */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-start mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                  Czy na pewno chcesz usunąć ten szablon?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Ta operacja jest nieodwracalna i spowoduje trwałe usunięcie tego szablonu.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Anuluj
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Usuń szablon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;