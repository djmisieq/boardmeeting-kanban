import React from 'react';
import { Meeting } from '@/lib/types';
import { Calendar, Clock } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { useMeetingsStore } from '@/store/use-meetings-store';

interface MeetingOutcomeBadgeProps {
  meetingId: string;
  showDetails?: boolean;
}

/**
 * Component that displays a badge on Kanban cards that were created from meeting outcomes
 * Shows meeting details on hover
 */
export function MeetingOutcomeBadge({ meetingId, showDetails = true }: MeetingOutcomeBadgeProps) {
  // Get the meeting from the store
  const getMeeting = useMeetingsStore(state => state.getMeeting);
  const meeting = getMeeting(meetingId);
  
  if (!meeting) {
    return null;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 cursor-help">
            <Calendar className="h-3 w-3" />
            {showDetails && (
              <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                {meeting.title.length > 15 ? `${meeting.title.substring(0, 15)}...` : meeting.title}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3 space-y-2 bg-white rounded-lg shadow-lg border">
          <div className="font-bold text-sm">{meeting.title}</div>
          
          <div className="text-xs flex items-center gap-1 text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>{meeting.date}</span>
          </div>
          
          <div className="text-xs flex items-center gap-1 text-gray-600">
            <Clock className="h-3 w-3" />
            <span>{meeting.startTime} - {meeting.endTime}</span>
          </div>
          
          {meeting.description && (
            <div className="text-xs text-gray-700 border-t pt-1 mt-1">
              {meeting.description.length > 100 
                ? `${meeting.description.substring(0, 100)}...` 
                : meeting.description}
            </div>
          )}
          
          <div className="text-xs text-blue-600 mt-1">
            Click to view meeting details
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
