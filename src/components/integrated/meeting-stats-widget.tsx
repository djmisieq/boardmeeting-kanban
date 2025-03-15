import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  PieChart, 
  BarChart3, 
  ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import { getMeetingCardStatistics } from '@/lib/meeting-board-utils';
import { useMeetingsStore } from '@/store/use-meetings-store';

interface MeetingStatsWidgetProps {
  className?: string;
}

export function MeetingStatsWidget({ className = '' }: MeetingStatsWidgetProps) {
  const [stats, setStats] = useState<ReturnType<typeof getMeetingCardStatistics> | null>(null);
  const upcomingMeetings = useMeetingsStore(state => state.getUpcomingMeetings);
  
  useEffect(() => {
    // Get statistics
    const meetingStats = getMeetingCardStatistics();
    setStats(meetingStats);
  }, []);
  
  const upcoming = upcomingMeetings();
  
  if (!stats) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
        <p>Ładowanie statystyk...</p>
      </div>
    );
  }
  
  // Format percentage with 1 decimal place
  const formattedPercentage = stats.percentageOfCardsFromMeetings.toFixed(1);
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <h3 className="font-semibold text-lg mb-3 flex items-center">
        <Calendar className="mr-2 h-5 w-5 text-blue-600" />
        Statystyki spotkań
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">Karty ze spotkań</p>
          <p className="text-xl font-semibold">{stats.totalMeetingCards}</p>
          <p className="text-xs text-blue-600">{formattedPercentage}% wszystkich kart</p>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm text-purple-700">Nadchodzące spotkania</p>
          <p className="text-xl font-semibold">{upcoming.length}</p>
          <p className="text-xs text-purple-600">
            {upcoming.length > 0 
              ? `Najbliższe: ${upcoming[0].date}`
              : 'Brak zaplanowanych spotkań'}
          </p>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2 flex items-center">
          <PieChart className="h-4 w-4 mr-1 text-gray-500" />
          Rozkład według typu
        </h4>
        <div className="flex gap-2">
          <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex-1 text-center">
            Zadania: {stats.cardTypeDistribution.tasks}
          </div>
          <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs flex-1 text-center">
            Problemy: {stats.cardTypeDistribution.problems}
          </div>
          <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs flex-1 text-center">
            Pomysły: {stats.cardTypeDistribution.ideas}
          </div>
        </div>
      </div>
      
      {stats.cardsPerMeeting.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <BarChart3 className="h-4 w-4 mr-1 text-gray-500" />
            Najaktywniejsze spotkania
          </h4>
          <ul className="text-sm space-y-1">
            {stats.cardsPerMeeting
              .sort((a, b) => b.cardCount - a.cardCount)
              .slice(0, 3)
              .map(meeting => (
                <li key={meeting.meetingId} className="flex justify-between items-center py-1 border-b">
                  <span className="truncate mr-2">{meeting.meetingTitle}</span>
                  <span className="text-blue-600 font-medium">{meeting.cardCount}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
      
      <Link 
        href="/meetings" 
        className="flex items-center justify-center mt-4 text-sm text-blue-600 hover:text-blue-800"
      >
        Wszystkie spotkania
        <ChevronRight className="h-4 w-4 ml-1" />
      </Link>
    </div>
  );
}
