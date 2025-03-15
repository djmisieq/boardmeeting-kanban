'use client';

import { useState } from 'react';
import { FileDown, X, FileText, Table, ChevronDown } from 'lucide-react';

interface DepartmentStats {
  departmentId: string;
  departmentName: string;
  tasks: any;
  problems: any;
  ideas: any;
}

interface ExportReportDialogProps {
  departmentsStats: DepartmentStats[];
  reportType: 'tasks' | 'problems' | 'ideas';
  onClose: () => void;
}

const ExportReportDialog = ({ departmentsStats, reportType, onClose }: ExportReportDialogProps) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);
  const [includeDepartments, setIncludeDepartments] = useState<string[]>(
    departmentsStats.map(dept => dept.departmentId)
  );
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Toggle department selection
  const toggleDepartment = (deptId: string) => {
    if (includeDepartments.includes(deptId)) {
      setIncludeDepartments(includeDepartments.filter(id => id !== deptId));
    } else {
      setIncludeDepartments([...includeDepartments, deptId]);
    }
  };
  
  // Select/deselect all departments
  const toggleAllDepartments = () => {
    if (includeDepartments.length === departmentsStats.length) {
      setIncludeDepartments([]);
    } else {
      setIncludeDepartments(departmentsStats.map(dept => dept.departmentId));
    }
  };
  
  // Handle export
  const handleExport = () => {
    if (includeDepartments.length === 0) {
      alert('Please select at least one department to include in the report.');
      return;
    }
    
    const filteredStats = departmentsStats.filter(dept => 
      includeDepartments.includes(dept.departmentId)
    );
    
    // In a real app, this would connect to PDF/Excel/CSV generation services
    console.log(`Exporting report as ${exportFormat}`);
    console.log('Report type:', reportType);
    console.log('Include charts:', includeCharts);
    console.log('Include tables:', includeTables);
    console.log('Departments included:', filteredStats.map(d => d.departmentName));
    
    // Show success message
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };
  
  const getReportTypeLabel = () => {
    switch (reportType) {
      case 'tasks':
        return 'Tasks Report';
      case 'problems':
        return 'Problems Resolution Report';
      case 'ideas':
        return 'Improvement Ideas Report';
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Export {getReportTypeLabel()}</h2>
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
              Your report has been exported successfully.
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
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="h-4 w-4 text-blue-600 mr-2"
                    checked={exportFormat === 'csv'}
                    onChange={() => setExportFormat('csv')}
                  />
                  <FileText className="h-5 w-5 mr-2" />
                  CSV File
                </label>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Content Options</h3>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 mr-2"
                    checked={includeCharts}
                    onChange={() => setIncludeCharts(!includeCharts)}
                    disabled={exportFormat === 'csv'}
                  />
                  Include visualization charts
                  {exportFormat === 'csv' && (
                    <span className="text-sm text-gray-500 ml-2">(not available for CSV)</span>
                  )}
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 mr-2"
                    checked={includeTables}
                    onChange={() => setIncludeTables(!includeTables)}
                  />
                  Include data tables
                </label>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Departments to Include</h3>
              <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 mr-2"
                      checked={includeDepartments.length === departmentsStats.length}
                      onChange={toggleAllDepartments}
                    />
                    {includeDepartments.length === departmentsStats.length 
                      ? 'Deselect All' 
                      : 'Select All'} ({includeDepartments.length}/{departmentsStats.length})
                  </label>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {departmentsStats.map(dept => (
                    <div 
                      key={dept.departmentId}
                      className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center border-t dark:border-gray-700"
                    >
                      <label className="flex items-center cursor-pointer w-full">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 mr-2"
                          checked={includeDepartments.includes(dept.departmentId)}
                          onChange={() => toggleDepartment(dept.departmentId)}
                        />
                        {dept.departmentName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
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
                disabled={includeDepartments.length === 0}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportReportDialog;