'use client';

import { useState } from 'react';
import { FileDown, X, FileText, Table } from 'lucide-react';
import { MeetingNote } from '@/lib/types';
import { useDepartmentsStore } from '@/store/use-departments-store';

interface ExportNotesDialogProps {
  notes: MeetingNote[];
  onClose: () => void;
}

const ExportNotesDialog = ({ notes, onClose }: ExportNotesDialogProps) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [exportType, setExportType] = useState<'selected' | 'all'>('selected');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [exportNoteContent, setExportNoteContent] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { departments } = useDepartmentsStore();
  
  // Toggle selection of a note
  const toggleNoteSelection = (noteId: string) => {
    if (selectedNotes.includes(noteId)) {
      setSelectedNotes(selectedNotes.filter(id => id !== noteId));
    } else {
      setSelectedNotes([...selectedNotes, noteId]);
    }
  };
  
  // Get department name by ID
  const getDepartmentName = (departmentId: string) => {
    return departments.find(dept => dept.id === departmentId)?.name || 'Unknown Department';
  };
  
  // Handle export
  const handleExport = () => {
    const exportData = exportType === 'all' 
      ? notes 
      : notes.filter(note => selectedNotes.includes(note.id));
    
    if (exportData.length === 0) {
      alert('Please select at least one note to export.');
      return;
    }
    
    // In a real app, this would connect to a PDF or Excel generation service
    // For now, we'll just simulate the export
    
    // For PDF, we would typically use a library like jsPDF or react-pdf
    // For Excel, we would use libraries like exceljs or xlsx
    
    console.log(`Exporting ${exportData.length} notes as ${exportFormat}`);
    console.log(`Export data:`, exportData);
    
    // Show success message
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Export Meeting Notes</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {showSuccess ? (
          <div className="p-8 text-center">
            <div className="bg-green-100 text-green-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Export Successful!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your meeting notes have been exported successfully.
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="font-medium mb-2">Export Format</h3>
              <div className="flex space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="h-4 w-4 text-blue-600 mr-2"
                    checked={exportFormat === 'pdf'}
                    onChange={() => setExportFormat('pdf')}
                  />
                  <FileText className="h-5 w-5 mr-2" />
                  PDF Document
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="h-4 w-4 text-blue-600 mr-2"
                    checked={exportFormat === 'excel'}
                    onChange={() => setExportFormat('excel')}
                  />
                  <Table className="h-5 w-5 mr-2" />
                  Excel Spreadsheet
                </label>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Notes to Export</h3>
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="h-4 w-4 text-blue-600 mr-2"
                    checked={exportType === 'selected'}
                    onChange={() => setExportType('selected')}
                  />
                  Selected Notes
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="h-4 w-4 text-blue-600 mr-2"
                    checked={exportType === 'all'}
                    onChange={() => setExportType('all')}
                  />
                  All Notes ({notes.length})
                </label>
              </div>
              
              {exportType === 'selected' && (
                <div className="border dark:border-gray-700 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={selectedNotes.length === notes.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedNotes(notes.map(note => note.id));
                              } else {
                                setSelectedNotes([]);
                              }
                            }}
                          />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Department
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {notes.map((note) => (
                        <tr 
                          key={note.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => toggleNoteSelection(note.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={selectedNotes.includes(note.id)}
                              onChange={() => toggleNoteSelection(note.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{note.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(note.date).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">{getDepartmentName(note.departmentId)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Export Options</h3>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 mr-2"
                  checked={exportNoteContent}
                  onChange={(e) => setExportNoteContent(e.target.checked)}
                />
                Include full note content
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">
                If unchecked, only summary information will be exported
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                disabled={exportType === 'selected' && selectedNotes.length === 0}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export {exportType === 'selected' ? selectedNotes.length : notes.length} Note(s)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportNotesDialog;
