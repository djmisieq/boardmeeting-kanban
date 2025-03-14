'use client';

import React, { useState } from 'react';
import { useProjectsStore } from '@/store/use-projects-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { ProjectStatus } from '@/lib/types';
import { useForm } from '@/hooks/use-form';
import { useSuccessNotification } from '@/providers/notification-provider';
import { useErrorHandler } from '@/providers/app-provider';
import { Plus, X, Check, Calendar, User, Tag, AlertTriangle } from 'lucide-react';

interface ProjectFormProps {
  onSuccess?: (projectId: string) => void;
  onCancel?: () => void;
}

export default function ProjectForm({ onSuccess, onCancel }: ProjectFormProps) {
  const { createProject } = useProjectsStore();
  const { departments } = useDepartmentsStore();
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Powiadomienia i obsługa błędów
  const showSuccess = useSuccessNotification();
  const { handleError } = useErrorHandler();
  
  // Konfiguracja formularza z walidacją
  const initialFormConfig = {
    name: {
      value: '',
      required: true,
      requiredMessage: 'Nazwa projektu jest wymagana',
    },
    description: {
      value: '',
      required: false,
    },
    status: {
      value: 'planning' as ProjectStatus,
      required: true,
    },
    startDate: {
      value: new Date().toISOString().split('T')[0],
      required: true,
      requiredMessage: 'Data rozpoczęcia jest wymagana',
    },
    endDate: {
      value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      required: true,
      requiredMessage: 'Data zakończenia jest wymagana',
      validate: [
        {
          validate: (value, formValues) => 
            !value || !formValues.startDate || 
            new Date(value) >= new Date(formValues.startDate),
          message: 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia',
        },
      ],
    },
    owner: {
      value: '',
      required: true,
      requiredMessage: 'Osoba odpowiedzialna jest wymagana',
    },
  };
  
  // Hook formularza
  const {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    handleInputChange,
    handleSubmit,
    hasError,
    getError,
  } = useForm(initialFormConfig, async (formValues) => {
    try {
      // Walidacja departamentów
      if (selectedDepartments.length === 0) {
        throw new Error('Wybierz co najmniej jeden dział');
      }
      
      // Tworzenie projektu
      const projectId = createProject({
        name: formValues.name,
        description: formValues.description,
        status: formValues.status as ProjectStatus,
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        owner: formValues.owner,
        departments: selectedDepartments,
        tags,
        milestones: []
      });
      
      // Powiadomienie o sukcesie
      showSuccess('Projekt został utworzony pomyślnie', 'Sukces');
      
      // Wywołanie callbacka
      if (onSuccess) {
        onSuccess(projectId);
      }
    } catch (error) {
      handleError(error);
    }
  });
  
  // Obsługa wyboru działów
  const toggleDepartment = (departmentId: string) => {
    setSelectedDepartments(prev => 
      prev.includes(departmentId)
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  };
  
  // Obsługa dodawania tagów
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  // Usuwanie tagu
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  // Walidacja formularza
  const isFormValid = () => {
    return (
      !hasError('name') &&
      !hasError('startDate') &&
      !hasError('endDate') &&
      !hasError('owner') &&
      selectedDepartments.length > 0
    );
  };
  
  return (
    <>
      {submitError && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-6 flex items-start">
          <AlertTriangle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">Wystąpił błąd</p>
            <p className="text-red-700 dark:text-red-400">{submitError}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nazwa projektu {hasError('name') && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={values.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 transition-colors
              ${hasError('name') ? 'border-red-500' : ''}`}
          />
          {hasError('name') && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{getError('name')}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Opis projektu
          </label>
          <textarea
            id="description"
            name="description"
            value={values.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={values.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="not-started">Nie rozpoczęty</option>
              <option value="planning">Planowanie</option>
              <option value="in-progress">W trakcie</option>
              <option value="on-hold">Wstrzymany</option>
              <option value="completed">Zakończony</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="owner" className="block text-sm font-medium mb-1">
              Osoba odpowiedzialna {hasError('owner') && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type="text"
                id="owner"
                name="owner"
                value={values.owner}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 pl-9 border rounded-md dark:bg-gray-800 dark:border-gray-700
                  ${hasError('owner') ? 'border-red-500' : ''}`}
              />
              <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {hasError('owner') && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{getError('owner')}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-1">
              Data rozpoczęcia {hasError('startDate') && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={values.startDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 pl-9 border rounded-md dark:bg-gray-800 dark:border-gray-700
                  ${hasError('startDate') ? 'border-red-500' : ''}`}
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {hasError('startDate') && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{getError('startDate')}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-1">
              Planowana data zakończenia {hasError('endDate') && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={values.endDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 pl-9 border rounded-md dark:bg-gray-800 dark:border-gray-700
                  ${hasError('endDate') ? 'border-red-500' : ''}`}
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {hasError('endDate') && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{getError('endDate')}</p>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Działy uczestniczące w projekcie *
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {departments.map(dept => (
              <button
                key={dept.id}
                type="button"
                onClick={() => toggleDepartment(dept.id)}
                className={`px-3 py-1 rounded-md text-sm flex items-center transition-colors ${
                  selectedDepartments.includes(dept.id)
                    ? 'bg-blue-600 text-white dark:bg-blue-700'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {selectedDepartments.includes(dept.id) ? (
                  <Check size={14} className="mr-1" />
                ) : null}
                {dept.name}
              </button>
            ))}
          </div>
          {selectedDepartments.length === 0 && (
            <p className="text-sm text-red-600 mt-1">
              Wybierz co najmniej jeden dział
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            Tagi (opcjonalne)
          </label>
          <div className="flex">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="flex-grow px-3 py-2 border rounded-l-md dark:bg-gray-800 dark:border-gray-700"
              placeholder="Dodaj tag i naciśnij Enter"
            />
            <button
              type="button"
              onClick={addTag}
              className="bg-blue-600 text-white px-3 py-2 rounded-r-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <div 
                  key={tag} 
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-md text-sm flex items-center"
                >
                  <Tag size={12} className="mr-1" />
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Anuluj
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Tworzenie...
              </>
            ) : (
              <>Utwórz projekt</>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
