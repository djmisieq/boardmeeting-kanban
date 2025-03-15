'use client';

import React, { useState } from 'react';
import { 
  Calendar,
  Clock,
  Users,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { useMeetingsStore } from '@/store/use-meetings-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { Meeting } from '@/lib/types';

export default function MeetingsPage() {
  const { getUpcomingMeetings, getPastMeetings, selectMeeting } = useMeetingsStore();
  const { departments } = useDepartmentsStore();
  
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');
  const [departmentFilter, setDepartmentFilter] = useState<string | 'all'>('all');
  
  // Pobierz dane spotkań
  const upcomingMeetings = getUpcomingMeetings();
  const pastMeetings = getPastMeetings();
  
  // Filtruj spotkania według działu
  const filteredMeetings = (view === 'upcoming' ? upcomingMeetings : pastMeetings)
    .filter(meeting => departmentFilter === 'all' || meeting.departments.includes(departmentFilter));
  
  // Format daty
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('pl-PL', options);
  };
  
  // Get department name
  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : departmentId;
  };
  
  // Status spotkania
  const getMeetingStatus = (meeting: Meeting) => {
    switch (meeting.status) {
      case 'scheduled':
        return (
          <span className="flex items-center text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs font-medium dark:bg-blue-900/30 dark:text-blue-300">
            <Calendar className="h-3 w-3 mr-1" />
            Zaplanowane
          </span>
        );
      case 'in-progress':
        return (
          <span className="flex items-center text-amber-600 bg-amber-100 px-2 py-1 rounded text-xs font-medium dark:bg-amber-900/30 dark:text-amber-300">
            <Clock className="h-3 w-3 mr-1" />
            W trakcie
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-medium dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Zakończone
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-medium dark:bg-red-900/30 dark:text-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Anulowane
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Spotkania</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2 text-gray-500" />
            <select
              className="border rounded-md py-2 px-3 dark:bg-gray-800 dark:border-gray-700"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value as string | 'all')}
            >
              <option value="all">Wszystkie działy</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          <Link 
            href="/meetings/new" 
            className="bg-blue-600 text-white rounded-md px-4 py-2 flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nowe spotkanie
          </Link>
        </div>
      </div>
      
      {/* Zakładki */}
      <div className="mb-6 border-b dark:border-gray-700">
        <div className="flex">
          <button
            className={`px-4 py-2 border-b-2 font-medium ${
              view === 'upcoming'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setView('upcoming')}
          >
            Nadchodzące
          </button>
          <button
            className={`px-4 py-2 border-b-2 font-medium ${
              view === 'past'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setView('past')}
          >
            Poprzednie
          </button>
        </div>
      </div>
      
      {/* Lista spotkań */}
      {filteredMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map(meeting => (
            <Link
              key={meeting.id}
              href={`/meetings/${meeting.id}`}
              onClick={() => selectMeeting(meeting.id)}
              className="block bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-5 border-b dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{meeting.title}</h3>
                  {getMeetingStatus(meeting)}
                </div>
                
                {meeting.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                    {meeting.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(meeting.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{meeting.startTime} - {meeting.endTime}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{meeting.participants.length} uczestników</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-b-lg">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Działy: {meeting.departments.map(deptId => getDepartmentName(deptId)).join(', ')}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="mt-2 flex items-center">
                  <div className="flex -space-x-1">
                    {meeting.outcomes?.tasks?.length ? (
                      <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        {meeting.outcomes.tasks.length}
                      </div>
                    ) : null}
                    
                    {meeting.outcomes?.problems?.length ? (
                      <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                        {meeting.outcomes.problems.length}
                      </div>
                    ) : null}
                    
                    {meeting.outcomes?.ideas?.length ? (
                      <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-medium text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                        {meeting.outcomes.ideas.length}
                      </div>
                    ) : null}
                  </div>
                  
                  {(meeting.outcomes?.tasks?.length || 0) + 
                   (meeting.outcomes?.problems?.length || 0) + 
                   (meeting.outcomes?.ideas?.length || 0) > 0 ? (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      Utworzone elementy
                    </span>
                  ) : view === 'upcoming' ? (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Brak utworzonych elementów
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Brak spotkań</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {view === 'upcoming' 
              ? 'Nie masz zaplanowanych nadchodzących spotkań. Utwórz nowe spotkanie, aby zacząć.'
              : 'Nie masz żadnych poprzednich spotkań.'}
          </p>
          
          {view === 'upcoming' && (
            <Link
              href="/meetings/new"
              className="mt-4 inline-block bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
            >
              Utwórz spotkanie
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
