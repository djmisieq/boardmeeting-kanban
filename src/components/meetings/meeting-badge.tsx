'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowUpRight } from 'lucide-react';
import { Meeting } from '@/lib/types';
import { useMeetingsStore } from '@/store/use-meetings-store';

interface MeetingBadgeProps {
  meetingId: string;
  size?: 'sm' | 'md' | 'lg';
  isCard?: boolean;
  className?: string;
}

/**
 * Komponent wyświetlający oznaczenie spotkania dla kart Kanban
 */
const MeetingBadge: React.FC<MeetingBadgeProps> = ({
  meetingId,
  size = 'md',
  isCard = false,
  className = '',
}) => {
  const { getMeeting } = useMeetingsStore();
  
  const meeting = getMeeting(meetingId);
  
  if (!meeting) return null;
  
  // Określ wymiary ikony na podstawie rozmiaru
  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  // Określ styl dla różnych rozmiarów
  const badgeSize = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5',
  };
  
  // Format daty
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Jeśli komponent jest używany na karcie, pokazujemy tylko ikonę z tooltip
  if (isCard) {
    return (
      <div className={`group relative ${className}`}>
        <div className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full p-1 shadow-sm">
          <Calendar className={iconSize[size]} />
        </div>
        
        {/* Tooltip z informacją o spotkaniu */}
        <div className="absolute z-50 top-full mt-1 right-0 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 text-xs invisible group-hover:visible transform origin-top-right scale-95 group-hover:scale-100 transition-all">
          <div className="font-medium mb-1 truncate">{meeting.title}</div>
          <div className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 inline-block rounded-full px-1.5 py-0.5 text-xs mb-1">
            {formatDate(meeting.date)}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-xs mb-1.5">
            {meeting.startTime} - {meeting.endTime}
          </div>
          <Link
            href={`/meetings/${meeting.id}`}
            className="flex items-center justify-between text-blue-600 dark:text-blue-400 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-xs"
          >
            <span>Przejdź do spotkania</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }
  
  // Standardowy wygląd odznaki spotkania
  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className={`
        inline-flex items-center rounded-md ${badgeSize[size]} bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300
        hover:opacity-90 transition-opacity ${className}
      `}
    >
      <Calendar className={`${iconSize[size]} mr-1`} />
      <span className="truncate">{meeting.title}</span>
      <ArrowUpRight className={`${iconSize[size]} ml-1 opacity-70`} />
    </Link>
  );
};

export default MeetingBadge;