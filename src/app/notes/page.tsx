'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/navbar';
import { useMeetingNotesStore } from '@/store/use-meeting-notes-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { MeetingNote } from '@/lib/types';
import { Search, Filter, Users, Plus, Calendar, Tag, ChevronDown, FileText, Share2, Edit, Trash } from 'lucide-react';

export default function NotesPage() {
  const searchParams = useSearchParams();
  const departmentIdParam = searchParams.get('departmentId');
  const noteIdParam = searchParams.get('noteId');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentNote, setCurrentNote] = useState<MeetingNote | null>(null);
  const [newNote, setNewNote] = useState<Partial<MeetingNote>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    participants: [],
    content: '',
    summary: '',
    tags: []
  });
  const [filterTag, setFilterTag] = useState('');
  
  // Stores
  const { 
    departments, 
    selectedDepartmentId, 
    selectDepartment 
  } = useDepartmentsStore();
  
  const { 
    notes,
    getAllNotes,
    getNotesForDepartment,
    getNoteById,
    searchNotes,
    addNote,
    updateNote,
    deleteNote
  } = useMeetingNotesStore();
  
  // Select the department from URL params if provided
  useEffect(() => {
    if (departmentIdParam) {
      selectDepartment(departmentIdParam);
    }
  }, [departmentIdParam, selectDepartment]);
  
  // Get the notes based on selected department
  const filteredNotes = selectedDepartmentId 
    ? getNotesForDepartment(selectedDepartmentId)
    : getAllNotes();
  
  // Get the current selected department
  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);
  
  // Open note if noteId is provided in URL
  useEffect(() => {
    if (noteIdParam) {
      const note = getNoteById(noteIdParam);
      if (note) {
        setCurrentNote(note);
        setShowViewModal(true);
      }
    }
  }, [noteIdParam, getNoteById]);
  
  // Apply search filter
  const displayedNotes = searchQuery 
    ? searchNotes(searchQuery, selectedDepartmentId || undefined)
    : filteredNotes;
  
  // Apply tag filter if selected
  const finalDisplayedNotes = filterTag
    ? displayedNotes.filter(note => note.tags.includes(filterTag))
    : displayedNotes;
  
  // Extract all unique tags
  const allTags = Array.from(
    new Set(
      displayedNotes.flatMap(note => note.tags)
    )
  ).sort();
  
  // Handle creating a new note
  const handleCreateNote = () => {
    if (newNote.title && newNote.content && selectedDepartmentId) {
      addNote({
        title: newNote.title,
        date: newNote.date || new Date().toISOString().split('T')[0],
        departmentId: selectedDepartmentId,
        participants: newNote.participants || [],
        content: newNote.content,
        summary: newNote.summary || '',
        tags: newNote.tags || []
      });
      
      // Reset form
      setNewNote({
        title: '',
        date: new Date().toISOString().split('T')[0],
        participants: [],
        content: '',
        summary: '',
        tags: []
      });
      
      setShowCreateModal(false);
    }
  };
  
  // Handle updating a note
  const handleUpdateNote = () => {
    if (currentNote && currentNote.id) {
      updateNote(currentNote.id, {
        title: currentNote.title,
        date: currentNote.date,
        participants: currentNote.participants,
        content: currentNote.content,
        summary: currentNote.summary,
        tags: currentNote.tags
      });
      
      setShowEditModal(false);
    }
  };
  
  // Handle deleting a note
  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      deleteNote(noteId);
      if (currentNote?.id === noteId) {
        setCurrentNote(null);
        setShowViewModal(false);
        setShowEditModal(false);
      }
    }
  };
  
  // Group notes by month
  const notesByMonth: Record<string, MeetingNote[]> = {};
  
  finalDisplayedNotes.forEach(note => {
    const date = new Date(note.date);
    const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    
    if (!notesByMonth[monthYear]) {
      notesByMonth[monthYear] = [];
    }
    
    notesByMonth[monthYear].push(note);
  });
  
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">{selectedDepartment?.name || 'All'} Meeting Notes</h1>
              
              {departments.length > 1 && (
                <div className="relative ml-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-gray-500" />
                    <select
                      className="appearance-none bg-transparent pr-8 py-1 focus:outline-none text-gray-700 dark:text-gray-300"
                      value={selectedDepartmentId || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          window.location.href = `/notes?departmentId=${e.target.value}`;
                        } else {
                          window.location.href = `/notes`;
                        }
                      }}
                    >
                      <option value="">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes..."
                className="pl-9 pr-4 py-2 border rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            {allTags.length > 0 && (
              <div>
                <select 
                  className="px-4 py-2 border rounded-lg"
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                >
                  <option value="">Filter by tag</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            )}
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              disabled={!selectedDepartmentId}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </button>
          </div>
        </div>
        
        {!selectedDepartmentId && (
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> Select a department above to create and view department-specific meeting notes.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {/* Notes List */}
            {Object.entries(notesByMonth).length > 0 ? (
              Object.entries(notesByMonth).map(([monthYear, monthNotes]) => (
                <div key={monthYear} className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 border-b pb-2">{monthYear}</h2>
                  <div className="space-y-4">
                    {monthNotes.map(note => (
                      <div 
                        key={note.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setCurrentNote(note);
                          setShowViewModal(true);
                        }}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{note.title}</h3>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(note.date).toLocaleDateString()}
                                {departments.length > 1 && !selectedDepartmentId && (
                                  <span className="ml-3 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-0.5 rounded text-xs">
                                    {departments.find(d => d.id === note.departmentId)?.name || 'Unknown Department'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex">
                              <Edit 
                                className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer mx-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentNote(note);
                                  setShowEditModal(true);
                                }}  
                              />
                              <Trash 
                                className="h-4 w-4 text-gray-400 hover:text-red-600 cursor-pointer mx-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(note.id);
                                }}  
                              />
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                            {note.summary}
                          </p>
                          
                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {note.tags.map(tag => (
                                <span 
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFilterTag(tag);
                                  }}
                                >
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No meeting notes found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchQuery || filterTag 
                    ? 'No notes match your search criteria. Try adjusting your filters.' 
                    : selectedDepartmentId
                      ? 'This department doesn\'t have any meeting notes yet. Create your first note to get started.'
                      : 'Select a department to view and create meeting notes.'}
                </p>
                {selectedDepartmentId && !searchQuery && !filterTag && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Note
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-4">
              <h3 className="font-medium mb-4">Quick Stats</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Notes</div>
                  <div className="text-2xl font-bold">{finalDisplayedNotes.length}</div>
                </div>
                
                {selectedDepartmentId && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Recent Activity</div>
                    {finalDisplayedNotes.length > 0 ? (
                      <div className="text-sm">
                        Last meeting: {new Date(finalDisplayedNotes[0].date).toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="text-sm">No meetings recorded yet</div>
                    )}
                  </div>
                )}
                
                {allTags.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Popular Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {allTags.slice(0, 5).map(tag => (
                        <span 
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 cursor-pointer"
                          onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterTag('');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    disabled={!searchQuery && !filterTag}
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* View Note Modal */}
      {showViewModal && currentNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold">{currentNote.title}</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setCurrentNote(currentNote);
                    setShowEditModal(true);
                    setShowViewModal(false);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date</div>
                  <div className="font-medium">{new Date(currentNote.date).toLocaleDateString()}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Department</div>
                  <div className="font-medium">
                    {departments.find(d => d.id === currentNote.departmentId)?.name || 'Unknown'}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Participants</div>
                  <div className="font-medium">{currentNote.participants.join(', ') || 'None recorded'}</div>
                </div>
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: currentNote.content
                    .split('\n')
                    .map(line => {
                      if (line.startsWith('# ')) {
                        return `<h1>${line.substring(2)}</h1>`;
                      } else if (line.startsWith('## ')) {
                        return `<h2>${line.substring(3)}</h2>`;
                      } else if (line.startsWith('### ')) {
                        return `<h3>${line.substring(4)}</h3>`;
                      } else if (line.startsWith('- ')) {
                        return `<li>${line.substring(2)}</li>`;
                      } else if (line.trim() === '') {
                        return '<br />';
                      } else {
                        return `<p>${line}</p>`;
                      }
                    })
                    .join('')
                }} />
              </div>
              
              {currentNote.tags.length > 0 && (
                <div className="mt-8 pt-4 border-t dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {currentNote.tags.map(tag => (
                      <span 
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Create/Edit Note Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold">{showCreateModal ? 'Create New Meeting Note' : 'Edit Meeting Note'}</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                showCreateModal ? handleCreateNote() : handleUpdateNote();
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                      value={showCreateModal ? newNote.title : currentNote?.title || ''}
                      onChange={(e) => showCreateModal 
                        ? setNewNote({...newNote, title: e.target.value})
                        : setCurrentNote(current => current ? {...current, title: e.target.value} : null)
                      }
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                      value={showCreateModal 
                        ? newNote.date || new Date().toISOString().split('T')[0]
                        : currentNote?.date || ''
                      }
                      onChange={(e) => showCreateModal 
                        ? setNewNote({...newNote, date: e.target.value})
                        : setCurrentNote(current => current ? {...current, date: e.target.value} : null)
                      }
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Participants (comma separated)</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                      value={showCreateModal 
                        ? (newNote.participants || []).join(', ')
                        : (currentNote?.participants || []).join(', ')
                      }
                      onChange={(e) => {
                        const participants = e.target.value.split(',').map(p => p.trim()).filter(Boolean);
                        showCreateModal 
                          ? setNewNote({...newNote, participants})
                          : setCurrentNote(current => current ? {...current, participants} : null);
                      }}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Summary</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                      value={showCreateModal ? newNote.summary || '' : currentNote?.summary || ''}
                      onChange={(e) => showCreateModal 
                        ? setNewNote({...newNote, summary: e.target.value})
                        : setCurrentNote(current => current ? {...current, summary: e.target.value} : null)
                      }
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Content (supports markdown)</label>
                    <textarea
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 font-mono h-64"
                      value={showCreateModal ? newNote.content || '' : currentNote?.content || ''}
                      onChange={(e) => showCreateModal 
                        ? setNewNote({...newNote, content: e.target.value})
                        : setCurrentNote(current => current ? {...current, content: e.target.value} : null)
                      }
                      required
                      placeholder="# Meeting Title
## Agenda
- Item 1
- Item 2

## Notes
Important points discussed...

## Action Items
- Task for Person A
- Task for Person B"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                      value={showCreateModal 
                        ? (newNote.tags || []).join(', ') 
                        : (currentNote?.tags || []).join(', ')
                      }
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                        showCreateModal 
                          ? setNewNote({...newNote, tags})
                          : setCurrentNote(current => current ? {...current, tags} : null);
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                    }}
                    className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {showCreateModal ? 'Create Note' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}