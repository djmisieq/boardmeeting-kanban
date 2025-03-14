'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/navbar';
import { useDepartmentsStore, Department } from '@/store/use-departments-store';
import { useKanbanStore } from '@/store/use-kanban-store';
import { Users, UserPlus, Trash, Edit, Plus, User, PenTool, ChevronDown, ChevronUp } from 'lucide-react';
import DepartmentMetrics from '@/components/departments/department-metrics';
import Link from 'next/link';

export default function DepartmentsPage() {
  const { departments, addDepartment, updateDepartment, deleteDepartment, addMemberToDepartment, removeMemberFromDepartment } = useDepartmentsStore();
  const { getBoardsForDepartment, initializeBoard } = useKanbanStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [expandedDepartments, setExpandedDepartments] = useState<Record<string, boolean>>({});
  
  // Initialize expanded state for all departments
  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {};
    departments.forEach(dept => {
      initialExpandedState[dept.id] = true; // Start with all expanded
    });
    setExpandedDepartments(initialExpandedState);
  }, [departments.length]);
  
  // Initialize boards for all departments if they don't exist yet
  useEffect(() => {
    departments.forEach(dept => {
      // Initialize task board
      const taskBoardId = dept.boardIds.tasksBoard || `${dept.id}-tasks`;
      if (!getBoardsForDepartment(dept.id, 'tasks').length) {
        initializeBoard(taskBoardId, 'tasks', dept.id, []);
      }
      
      // Initialize problems board
      const problemsBoardId = dept.boardIds.problemsBoard || `${dept.id}-problems`;
      if (!getBoardsForDepartment(dept.id, 'problems').length) {
        initializeBoard(problemsBoardId, 'problems', dept.id, []);
      }
      
      // Initialize ideas board
      const ideasBoardId = dept.boardIds.ideasBoard || `${dept.id}-ideas`;
      if (!getBoardsForDepartment(dept.id, 'ideas').length) {
        initializeBoard(ideasBoardId, 'ideas', dept.id, []);
      }
    });
  }, [departments, getBoardsForDepartment, initializeBoard]);
  
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
  
  // Toggle department expanded/collapsed state
  const toggleDepartmentExpanded = (deptId: string) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
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
        
        {/* Empty state */}
        {departments.length === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center my-10">
            <h3 className="text-xl font-semibold mb-2">No departments yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Get started by creating your first department. Departments help you organize your teams and their work.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Department
              </button>
            </div>
          </div>
        )}
        
        {/* Department List */}
        <div className="space-y-6">
          {departments.map((department) => (
            <div
              key={department.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{department.name}</h2>
                    {department.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {department.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center mt-4">
                      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg px-3 py-1 text-sm mr-3 mb-2">
                        <span className="font-medium">{department.members.length}</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">Members</span>
                      </div>
                      
                      <button
                        onClick={() => openMembersModal(department)}
                        className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm mb-2"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Manage Members
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleDepartmentExpanded(department.id)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      title={expandedDepartments[department.id] ? "Collapse" : "Expand"}
                    >
                      {expandedDepartments[department.id] ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
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
              </div>
              
              {/* Expanded view with metrics */}
              {expandedDepartments[department.id] && (
                <div className="p-4">
                  {/* Department Metrics */}
                  <DepartmentMetrics 
                    departmentId={department.id} 
                    departmentName={department.name}
                  />
                  
                  {/* Team Members Section */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Team Members</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {department.members.length > 0 ? (
                        department.members.map((member, index) => (
                          <div 
                            key={index} 
                            className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                          >
                            <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-8 h-8 flex items-center justify-center font-medium mr-3">
                              {member.charAt(0)}
                            </div>
                            <div className="flex-1">{member}</div>
                            <button
                              onClick={() => removeMemberFromDepartment(department.id, member)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove member"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-gray-500">
                          No members have been added to this department yet.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t dark:border-gray-700 flex flex-wrap gap-3">
                    <Link
                      href={`/dashboard?departmentId=${department.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Dashboard
                    </Link>
                    <Link
                      href={`/boards/tasks?departmentId=${department.id}`}
                      className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Tasks Board
                    </Link>
                    <Link
                      href={`/boards/problems?departmentId=${department.id}`}
                      className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Problems Board
                    </Link>
                    <Link
                      href={`/boards/ideas?departmentId=${department.id}`}
                      className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Ideas Board
                    </Link>
                  </div>
                </div>
              )}
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