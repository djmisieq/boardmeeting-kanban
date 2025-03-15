'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import MeetingOutcomeForm from '@/components/meetings/meeting-outcome-form';
import { useSearchParams } from 'next/navigation';

interface NewOutcomePageProps {
  params: {
    id: string;
  };
}

/**
 * Strona dodawania nowego wyniku spotkania
 */
const NewOutcomePage: React.FC<NewOutcomePageProps> = ({ params }) => {
  const { id } = params;
  const searchParams = useSearchParams();
  
  // Get type and agendaItemId from query params
  const type = searchParams.get('type') as 'task' | 'problem' | 'idea' || 'task';
  const agendaItemId = searchParams.get('agendaItemId') || undefined;
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href={`/meetings/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć do spotkania
          </Link>
        </Button>
      </div>
      
      <MeetingOutcomeForm 
        meetingId={id} 
        agendaItemId={agendaItemId}
        type={type}
      />
    </div>
  );
};

export default NewOutcomePage;