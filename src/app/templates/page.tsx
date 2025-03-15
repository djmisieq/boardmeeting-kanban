'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import TemplateManager from '@/components/projects/templates/template-manager';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function TemplatesPage() {
  return (
    <ErrorBoundary>
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <Link 
            href="/projects"
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Powrót do projektów
          </Link>
          
          <h1 className="text-2xl font-bold mt-4">Zarządzanie szablonami</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Twórz, edytuj i zarządzaj szablonami projeków, które usprawniają procesy transformacji zadań w projekty.
          </p>
        </div>
        
        <TemplateManager />
      </div>
    </ErrorBoundary>
  );
}
