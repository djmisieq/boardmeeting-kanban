'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/navbar';
import { useDepartmentsStore, Department } from '@/store/use-departments-store';
import { Users, UserPlus, Trash, Edit, Plus, User, PenTool } from 'lucide-react';
import { useKanbanStore } from '@/store/use-kanban-store';

export default function DepartmentsPage() {
  const { departments, addDepartment, updateDepartment, deleteDepartment, addMemberToDepartment, removeMemberFromDepartment } = useDepartmentsStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  
  // Handle adding a new department
  const handleAddDepartment = () => {
    if (departmentName.trim()) {
      addDepartment(departmentName, departmentDescription);
      resetForm();
      setShowAddModal(false);
    }
  };
  
  // Handle updating a department
  const handleUpdateDepartment = () => {
    if (currentDepartment && departmentName.trim()) {
      updateDepartment(currentDepartment.id, {
        name: departmentName,
        description: departmentDescription
      });
      resetForm();
      setShowEditModal(false);
    }
  };
  
  // Handle adding a member to a department
  const handleAddMember = () => {
    if (currentDepartment && newMemberName.trim()) {
      addMemberToDepartment(currentDepartment.id, newMemberName);
      setNewMemberName('');
    }
  };
  
  // Reset form fields
  const resetForm = () => {
    setDepartmentName('');
    setDepartmentDescription('');
    setCurrentDepartment(null);
    setNewMemberName('');
  };
  
  // Open the edit modal for a department
  const openEditModal = (department: Department) => {
    setCurrentDepartment(department);
    setDepartmentName(department.name);
    setDepartmentDescription(department.description || '');
    setShowEditModal(true);
  };
  
  // Open the members modal for a department
  const openMembersModal = (department: Department) => {
    setCurrentDepartment(department);
    setShowMembersModal(true);
  };
  
  // Handle department deletion with confirmation
  const handleDeleteDepartment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      deleteDepartment(id);
    }
  };

  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Departments Management</h1>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <div
              key={department.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold mb-2">{department.name}</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(department)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Edit Department"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(department.id)}
                      className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                      title="Delete Department"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {department.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                    {department.description}
                  </p>
                )}
                
                <div className="mt-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Members ({department.members.length})</div>
                  <div className="flex flex-wrap gap-2">
                    {department.members.slice(0, 3).map((member) => (
                      <div
                        key={member}
                        className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm"
                      >
                        <User className="h-3 w-3 mr-1" />
                        {member}
                      </div>
                    ))}
                    
                    {department.members.length > 3 && (
                      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm">
                        +{department.members.length - 3} more
                      </div>
                    )}
                    
                    {department.members.length === 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        No members yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-4">
                <button
                  onClick={() => openMembersModal(department)}
                  className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Manage Members
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Department Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Add New Department</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Department name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea
                    value={departmentDescription}
                    onChange={(e) => setDepartmentDescription(e.target.value)}
                    className="w-full p-2 border rounded-md h-24 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Brief description of the department"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      resetForm();
                      setShowAddModal(false);
                    }}
                    className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddDepartment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Department
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Department Modal */}
        {showEditModal && currentDepartment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Edit Department</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea
                    value={departmentDescription}
                    onChange={(e) => setDepartmentDescription(e.target.value)}
                    className="w-full p-2 border rounded-md h-24 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      resetForm();
                      setShowEditModal(false);
                    }}
                    className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateDepartment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Members Management Modal */}
        {showMembersModal && currentDepartment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-2">Manage Members</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {currentDepartment.name}
              </p>
              
              <div className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter member name"
                  />
                  <button
                    onClick={handleAddMember}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Current Members</div>
                {currentDepartment.members.length > 0 ? (
                  <ul className="space-y-2">
                    {currentDepartment.members.map((member) => (
                      <li
                        key={member}
                        className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
                      >
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {member}
                        </div>
                        <button
                          onClick={() => removeMemberFromDepartment(currentDepartment.id, member)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Remove member"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No members have been added yet.
                  </p>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    resetForm();
                    setShowMembersModal(false);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}