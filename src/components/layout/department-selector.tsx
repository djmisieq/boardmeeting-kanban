'use client';

import { useState } from 'react';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { ChevronDown, Users, Plus, Edit, Trash } from 'lucide-react';

export default function DepartmentSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentDescription, setNewDepartmentDescription] = useState('');
  const [departmentToEdit, setDepartmentToEdit] = useState<string | null>(null);

  const { 
    departments, 
    selectedDepartmentId, 
    selectDepartment, 
    addDepartment,
    updateDepartment,
    deleteDepartment
  } = useDepartmentsStore();

  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);

  const handleCreateDepartment = () => {
    if (newDepartmentName.trim()) {
      addDepartment(newDepartmentName, newDepartmentDescription);
      setNewDepartmentName('');
      setNewDepartmentDescription('');
      setShowCreateModal(false);
    }
  };

  const handleEditDepartment = () => {
    if (departmentToEdit && newDepartmentName.trim()) {
      updateDepartment(departmentToEdit, {
        name: newDepartmentName,
        description: newDepartmentDescription
      });
      setDepartmentToEdit(null);
      setNewDepartmentName('');
      setNewDepartmentDescription('');
      setShowEditModal(false);
    }
  };

  const openEditModal = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    if (dept) {
      setDepartmentToEdit(deptId);
      setNewDepartmentName(dept.name);
      setNewDepartmentDescription(dept.description || '');
      setShowEditModal(true);
    }
    setIsOpen(false);
  };

  const handleDeleteDepartment = (deptId: string) => {
    if (confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      deleteDepartment(deptId);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <Users className="h-4 w-4 mr-2" />
        <span className="mr-2">{selectedDepartment?.name || 'Select Department'}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10">
          <div className="p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">DEPARTMENTS</div>
            <ul>
              {departments.map(dept => (
                <li key={dept.id} className="mb-1">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => {
                        selectDepartment(dept.id);
                        setIsOpen(false);
                      }}
                      className={`px-3 py-2 w-full text-left rounded-md ${
                        selectedDepartmentId === dept.id
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {dept.name}
                    </button>
                    <div className="flex">
                      <button
                        onClick={() => openEditModal(dept.id)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <Trash className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t px-2 py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                setShowCreateModal(true);
              }}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create New Department
            </button>
          </div>
        </div>
      )}

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Create New Department</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department Name</label>
                <input
                  type="text"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., Marketing Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  value={newDepartmentDescription}
                  onChange={(e) => setNewDepartmentDescription(e.target.value)}
                  className="w-full p-2 border rounded-md h-24"
                  placeholder="Brief description of the department's responsibilities"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDepartment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Edit Department</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department Name</label>
                <input
                  type="text"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., Marketing Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  value={newDepartmentDescription}
                  onChange={(e) => setNewDepartmentDescription(e.target.value)}
                  className="w-full p-2 border rounded-md h-24"
                  placeholder="Brief description of the department's responsibilities"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditDepartment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}