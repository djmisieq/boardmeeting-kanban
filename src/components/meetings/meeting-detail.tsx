'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  CheckSquare,
  Lightbulb,
  Plus,
  Edit,
  MoreHorizontal,
  Trash2,
  Download,
  Share2
} from 'lucide-react';
import { useMeetingsStore } from '@/store/use-meetings-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { AgendaItem, Meeting } from '@/lib/types';
import { useKanbanStore } from '@/store/use-kanban-store';
import MeetingOutcomesView from './meeting-outcomes-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MeetingDetailProps {
  meetingId: string;
}

const MeetingDetail: React.FC<MeetingDetailProps> = ({ meetingId }) => {
  const { getMeeting, updateMeeting, deleteMeeting } = useMeetingsStore();
  const { getDepartmentById } = useDepartmentsStore();
  const router = useRouter();
  
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const meeting = getMeeting(meetingId);
  
  if (!meeting) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Spotkanie nie zostało znalezione</h3>
        <Link
          href="/meetings"
          className="mt-4 inline-block bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
        >
          Wróć do listy spotkań
        </Link>
      </div>
    );
  }
  
  // Format date
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
  
  // Get department name(s)
  const getDepartmentNames = () => {
    return meeting.departments
      .map(deptId => {
        const dept = getDepartmentById(deptId);
        return dept ? dept.name : deptId;
      })
      .join(', ');
  };
  
  // Meeting status badge
  const getMeetingStatusBadge = () => {
    switch (meeting.status) {
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Zaplanowane
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            W trakcie
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Zakończone
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 flex items-center">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Anulowane
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // Handle status change
  const handleStatusChange = (status: Meeting['status']) => {
    updateMeeting(meetingId, { status });
  };
  
  // Handle meeting delete
  const handleDeleteMeeting = () => {
    if (isConfirmingDelete) {
      deleteMeeting(meetingId);
      router.push('/meetings');
    } else {
      setIsConfirmingDelete(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => setIsConfirmingDelete(false), 3000);
    }
  };
  
  // Handle add outcome
  const handleAddOutcome = (type: 'task' | 'problem' | 'idea') => {
    router.push(`/meetings/${meetingId}/outcome/new?type=${type}`);
  };
  
  // Render agenda item
  const renderAgendaItem = (item: AgendaItem, index: number) => {
    const isCompleted = item.status === 'completed';
    
    return (
      <div 
        key={item.id} 
        className={`p-4 mb-2 rounded-lg border ${
          isCompleted 
            ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20' 
            : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-medium">
            {index + 1}. {item.title}
          </h4>
          {isCompleted ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Zakończone
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              W trakcie
            </Badge>
          )}
        </div>
        
        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{item.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
          {item.presenter && (
            <span className="flex items-center">
              <Users className="h-3.5 w-3.5 mr-1" />
              Prezentujący: {item.presenter}
            </span>
          )}
          
          {item.duration && (
            <span className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              {item.duration} min
            </span>
          )}
        </div>
        
        {/* Outcome indicators, if any */}
        {item.outcome && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Wyniki:</p>
            <div className="flex gap-2">
              {item.outcome.tasks?.length ? (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  <CheckSquare className="h-3 w-3 mr-1" />
                  {item.outcome.tasks.length} zadań
                </Badge>
              ) : null}
              
              {item.outcome.problems?.length ? (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {item.outcome.problems.length} problemów
                </Badge>
              ) : null}
              
              {item.outcome.ideas?.length ? (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  {item.outcome.ideas.length} pomysłów
                </Badge>
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{meeting.title}</h1>
            {getMeetingStatusBadge()}
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {formatDate(meeting.date)} • {meeting.startTime} - {meeting.endTime}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/meetings/${meetingId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edytuj
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Akcje
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange('scheduled')}>
                <Calendar className="h-4 w-4 mr-2" />
                Ustaw jako zaplanowane
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('in-progress')}>
                <Clock className="h-4 w-4 mr-2" />
                Ustaw jako w trakcie
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Ustaw jako zakończone
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('cancelled')}>
                <XCircle className="h-4 w-4 mr-2" />
                Ustaw jako anulowane
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Udostępnij
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Eksportuj
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                onClick={handleDeleteMeeting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isConfirmingDelete ? "Potwierdź usunięcie" : "Usuń spotkanie"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details & Agenda */}
        <div className="lg:col-span-1 space-y-6">
          {/* Meeting details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Szczegóły spotkania</h2>
            
            {meeting.description && (
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300">{meeting.description}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Data</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{formatDate(meeting.date)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Czas</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{meeting.startTime} - {meeting.endTime}</p>
                </div>
              </div>
              
              {meeting.location && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Lokalizacja</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{meeting.location}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <Users className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Uczestnicy</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {meeting.participants.join(', ')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Działy</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getDepartmentNames()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Agenda */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Agenda spotkania</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/meetings/${meetingId}/agenda/add`}>
                  <Plus className="h-4 w-4 mr-1" />
                  Dodaj punkt
                </Link>
              </Button>
            </div>
            
            {meeting.agenda.length > 0 ? (
              <div className="space-y-3">
                {meeting.agenda.map((item, index) => renderAgendaItem(item, index))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">
                  Brak punktów agendy. Kliknij "Dodaj punkt", aby dodać punkty do omówienia.
                </p>
              </div>
            )}
          </Card>
        </div>
        
        {/* Right Column - Outcomes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Outcomes header & actions */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Wyniki spotkania</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddOutcome('task')}
                >
                  <CheckSquare className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                  Zadanie
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddOutcome('problem')}
                >
                  <AlertCircle className="h-4 w-4 mr-1 text-amber-600 dark:text-amber-400" />
                  Problem
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddOutcome('idea')}
                >
                  <Lightbulb className="h-4 w-4 mr-1 text-yellow-600 dark:text-yellow-400" />
                  Pomysł
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Wyniki spotkania są automatycznie synchronizowane z tablicami Kanban.
              Po dodaniu elementy są widoczne na odpowiednich tablicach w zależności od ich typu.
            </p>
            
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                <div className="font-medium text-blue-700 dark:text-blue-300 mb-1 flex items-center justify-center">
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Zadania
                </div>
                <div className="text-2xl font-semibold text-blue-700 dark:text-blue-300">
                  {meeting.outcomes?.tasks?.length || 0}
                </div>
              </div>
              
              <div className="p-2 rounded bg-amber-50 dark:bg-amber-900/20">
                <div className="font-medium text-amber-700 dark:text-amber-300 mb-1 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Problemy
                </div>
                <div className="text-2xl font-semibold text-amber-700 dark:text-amber-300">
                  {meeting.outcomes?.problems?.length || 0}
                </div>
              </div>
              
              <div className="p-2 rounded bg-yellow-50 dark:bg-yellow-900/20">
                <div className="font-medium text-yellow-700 dark:text-yellow-300 mb-1 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Pomysły
                </div>
                <div className="text-2xl font-semibold text-yellow-700 dark:text-yellow-300">
                  {meeting.outcomes?.ideas?.length || 0}
                </div>
              </div>
            </div>
          </Card>
          
          {/* Outcomes view */}
          <MeetingOutcomesView meetingId={meetingId} />
        </div>
      </div>
    </div>
  );
};

export default MeetingDetail;