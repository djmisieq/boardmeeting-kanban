'use client';

import React from 'react';
import MeetingDetail from '@/components/meetings/meeting-detail';

export default function MeetingDetailPage({ params }: { params: { id: string } }) {
  return <MeetingDetail meetingId={params.id} />;
}
