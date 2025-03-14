'use client';

import { useState } from 'react';
import { useProjectsStore } from '@/store/use-projects-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { ProjectStatus } from '@/lib/types';
import { Plus, X, Check } from 'lucide-react';

interface ProjectFormProps {
  onSuccess?: (projectId: string) => void;
  onCancel?: () => void;
}

export default function ProjectForm({ onSuccess, onCancel }: ProjectFormProps) {
  const { createProject } = useProjectsStore();
  const { departments } = useDepartmentsStore();
  
  // Stany formularza
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [owner, setOwner] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
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
      name.trim() !== '' &&
      startDate !== '' &&
      endDate !== '' &&
      owner.trim() !== '' &&
      selectedDepartments.length > 0
    );
  };
  
  // Obsługa zapisywania projektu
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) return;
    
    const projectId = createProject({
      name,
      description,
      status,
      startDate,
      endDate,
      owner,
      departments: selectedDepartments,
      tags,
      milestones: []
    });
    
    if (onSuccess) {
      onSuccess(projectId);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Nazwa projektu *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Opis projektu
        </label>
        <textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status *
          </label>
          <select
            id="status"
            value={status}
            onChange={e => setStatus(e.target.value as ProjectStatus)}
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
            Osoba odpowiedzialna *
          </label>
          <input
            type="text"
            id="owner"
            value={owner}
            onChange={e => setOwner(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-1">
            Data rozpoczęcia *
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            required
          />
        </div>
        
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-1">
            Planowana data zakończenia *
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            required
          />
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
              className={`px-3 py-1 rounded-md text-sm flex items-center ${
                selectedDepartments.includes(dept.id)
                  ? 'bg-blue-600 text-white dark:bg-blue-700'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
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
            className="bg-blue-600 text-white px-3 py-2 rounded-r-md"
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
                {tag}
                <button 
                  type="button" 
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800"
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
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
          >
            Anuluj
          </button>
        )}
        
        <button
          type="submit"
          disabled={!isFormValid()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          Utwórz projekt
        </button>
      </div>
    </form>
  );
}
