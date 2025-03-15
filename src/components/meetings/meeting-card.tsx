import React from 'react';
import { Meeting } from '@/lib/types';
import { 
  CalendarClock, 
  MapPin, 
  Users, 
  Clock, 
  Building2, 
  ArrowRight,
  MoreVertical,
  Copy,
  Edit,
  Trash,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { format, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface MeetingCardProps {
  meeting: Meeting;
  showActions?: boolean;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ 
  meeting, 
  showActions = true 
}) => {
  const { getDepartmentById } = useDepartmentsStore();
  
  // Formatowanie daty
  const formattedDate = format(parseISO(meeting.date), 'EEEE, d MMMM yyyy', { locale: pl });
  
  // Pobieranie nazw działów
  const departmentNames = meeting.departments
    .map(id => {
      const dept = getDepartmentById(id);
      return dept ? dept.name : '';
    })
    .filter(Boolean);
  
  // Określenie statusu spotkania na podstawie daty i statusu
  const getMeetingStatus = (): { text: string; color: string } => {
    if (meeting.status === 'cancelled') {
      return { text: 'Anulowane', color: 'bg-red-100 text-red-800' };
    }
    
    if (meeting.status === 'completed') {
      return { text: 'Zakończone', color: 'bg-green-100 text-green-800' };
    }
    
    const today = new Date();
    const meetingDate = parseISO(meeting.date);
    const startTime = meeting.startTime.split(':').map(Number);
    const endTime = meeting.endTime.split(':').map(Number);
    
    const startDateTime = new Date(meetingDate);
    startDateTime.setHours(startTime[0], startTime[1], 0);
    
    const endDateTime = new Date(meetingDate);
    endDateTime.setHours(endTime[0], endTime[1], 0);
    
    if (isAfter(today, endDateTime)) {
      return { text: 'Zakończone', color: 'bg-green-100 text-green-800' };
    }
    
    if (isAfter(today, startDateTime) && isBefore(today, endDateTime)) {
      return { text: 'W trakcie', color: 'bg-blue-100 text-blue-800' };
    }
    
    if (
      isEqual(today.getDate(), meetingDate.getDate()) &&
      isEqual(today.getMonth(), meetingDate.getMonth()) &&
      isEqual(today.getFullYear(), meetingDate.getFullYear())
    ) {
      return { text: 'Dzisiaj', color: 'bg-purple-100 text-purple-800' };
    }
    
    return { text: 'Zaplanowane', color: 'bg-gray-100 text-gray-800' };
  };
  
  const status = getMeetingStatus();
  
  // Obliczenie liczby uczestników
  const participantsCount = meeting.participants.length;
  
  // Obliczenie liczby wyników spotkania
  const outcomesCount = (
    (meeting.outcomes?.tasks?.length || 0) +
    (meeting.outcomes?.problems?.length || 0) +
    (meeting.outcomes?.ideas?.length || 0)
  );
  
  return (
    <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex justify-between">
        <div className="flex-1">
          <Link href={`/meetings/${meeting.id}`}>
            <h3 className="text-lg font-medium mb-1 hover:text-blue-600 transition-colors">
              {meeting.title}
            </h3>
          </Link>
          
          <div className="mb-4">
            <Badge className={status.color}>{status.text}</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <CalendarClock className="h-4 w-4 mr-2 text-gray-400" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <span>{meeting.startTime} - {meeting.endTime}</span>
            </div>
            
            {meeting.location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>{meeting.location}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2 text-gray-400" />
              <span>{participantsCount} {participantsCount === 1 ? 'uczestnik' : 
                (participantsCount < 5 ? 'uczestników' : 'uczestników')}</span>
            </div>
            
            {departmentNames.length > 0 && (
              <div className="flex items-center text-sm text-gray-600 md:col-span-2">
                <Building2 className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate">{departmentNames.join(', ')}</span>
              </div>
            )}
          </div>
          
          {meeting.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {meeting.description}
            </p>
          )}
          
          {/* Wyniki spotkania (jeśli istnieją) */}
          {outcomesCount > 0 && (
            <div className="flex items-center text-sm text-blue-600 mb-2">
              <FileText className="h-4 w-4 mr-2" />
              <span>{outcomesCount} {outcomesCount === 1 ? 'wynik' : 'wyników'} spotkania</span>
            </div>
          )}
        </div>
        
        {/* Menu akcji */}
        {showActions && (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Opcje spotkania</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link href={`/meetings/${meeting.id}`}>
                    <DropdownMenuItem>
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Zobacz szczegóły</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href={`/meetings/${meeting.id}/edit`}>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      <span>Edytuj spotkanie</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    <span>Duplikuj spotkanie</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash className="h-4 w-4 mr-2" />
                  <span>Usuń spotkanie</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      
      {/* Link do szczegółów spotkania */}
      <div className="mt-4 flex justify-end">
        <Link href={`/meetings/${meeting.id}`}>
          <Button variant="outline" size="sm" className="text-sm">
            Szczegóły
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MeetingCard;