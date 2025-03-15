'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ProjectDetail from '@/components/projects/project-detail';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <ErrorBoundary>
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <Link 
            href="/projects"
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Powrót do listy projektów
          </Link>
        </div>
        
        <ProjectDetail projectId={params.id} />
      </div>
    </ErrorBoundary>
  );
}