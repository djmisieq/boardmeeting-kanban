'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import MeetingDetail from '@/components/meetings/meeting-detail';
import { useMeetingsStore } from '@/store/use-meetings-store';

interface MeetingDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * Strona szczegółów spotkania
 */
const MeetingDetailPage: React.FC<MeetingDetailPageProps> = ({ params }) => {
  const { id } = params;
  const { getMeeting } = useMeetingsStore();
  const meeting = getMeeting(id);
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/meetings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć do spotkań
          </Link>
        </Button>
      </div>
      
      <MeetingDetail meetingId={id} />
    </div>
  );
};

export default MeetingDetailPage;