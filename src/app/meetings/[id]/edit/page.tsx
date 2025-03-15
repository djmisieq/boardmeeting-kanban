'use client';

import React from 'react';
import MeetingForm from '@/components/meetings/meeting-form';

export default function EditMeetingPage({ params }: { params: { id: string } }) {
  return <MeetingForm meetingId={params.id} isEdit={true} />;
}
