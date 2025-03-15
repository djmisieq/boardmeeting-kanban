'use client';

import React, { useState } from 'react';
import Navbar from './navbar';
import Sidebar from './sidebar';
import { MenuIcon, X } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Nagłówek */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 mr-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </button>
            <Navbar />
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Tutaj można dodać dodatkowe elementy nagłówka, np. profil użytkownika */}
          </div>
        </div>
      </header>
      
      {/* Główny kontener */}
      <div className="flex flex-1 overflow-hidden">
        {/* Boczny pasek */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Główna treść */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
