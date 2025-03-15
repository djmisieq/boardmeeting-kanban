'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Filter, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Users, 
  Building2
} from 'lucide-react';
import { useMeetingsStore } from '@/store/use-meetings-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { Meeting } from '@/lib/types';
import Link from 'next/link';
import MeetingCard from './meeting-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MeetingsView: React.FC = () => {
  const { meetings, getUpcomingMeetings, getPastMeetings } = useMeetingsStore();
  const { departments } = useDepartmentsStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState('upcoming');
  
  // Filtruj spotkania na podstawie wyszukiwania i wybranych działów
  const filterMeetings = (meetingsList: Meeting[]): Meeting[] => {
    return meetingsList.filter(meeting => {
      // Filtrowanie po wyszukiwanej frazie
      const searchMatch = searchTerm === '' || 
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (meeting.description && meeting.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtrowanie po działach
      const departmentMatch = selectedDepartments.length === 0 || 
        meeting.departments.some(id => selectedDepartments.includes(id));
      
      return searchMatch && departmentMatch;
    });
  };
  
  // Pobieramy listy spotkań
  const upcomingMeetings = filterMeetings(getUpcomingMeetings());
  const pastMeetings = filterMeetings(getPastMeetings());
  
  // Obsługa zaznaczania/odznaczania wszystkich działów
  const toggleAllDepartments = (checked: boolean) => {
    if (checked) {
      setSelectedDepartments(departments.map(dept => dept.id));
    } else {
      setSelectedDepartments([]);
    }
  };
  
  // Obsługa zaznaczania/odznaczania pojedynczego działu
  const toggleDepartment = (deptId: string, checked: boolean) => {
    if (checked) {
      setSelectedDepartments([...selectedDepartments, deptId]);
    } else {
      setSelectedDepartments(selectedDepartments.filter(id => id !== deptId));
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-blue-600" />
          Zarządzanie spotkaniami
        </h1>
        
        <Link href="/meetings/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nowe spotkanie
          </Button>
        </Link>
      </div>
      
      {/* Pasek wyszukiwania i filtrowania */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Wyszukaj spotkania..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filtruj działy
              {selectedDepartments.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                  {selectedDepartments.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Działy</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedDepartments.length === departments.length}
              onCheckedChange={toggleAllDepartments}
            >
              Wszystkie działy
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {departments.map(dept => (
              <DropdownMenuCheckboxItem
                key={dept.id}
                checked={selectedDepartments.includes(dept.id)}
                onCheckedChange={(checked) => toggleDepartment(dept.id, checked)}
              >
                {dept.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Zakładki z listami spotkań */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Nadchodzące ({upcomingMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Zakończone ({pastMeetings.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-4">
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">Brak nadchodzących spotkań</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-4">
                Nie masz zaplanowanych żadnych nadchodzących spotkań lub żadne nie pasuje do wybranych filtrów.
              </p>
              <Link href="/meetings/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Zaplanuj spotkanie
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingMeetings.map(meeting => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-4">
          {pastMeetings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">Brak zakończonych spotkań</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Nie masz zakończonych spotkań lub żadne nie pasuje do wybranych filtrów.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pastMeetings.map(meeting => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Informacja o statystykach */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2 flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-600" />
          Zarządzaj spotkaniami efektywnie
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          Spotkania są kluczowym elementem metodyki BoardMeeting. Wyniki spotkań są automatycznie
          przekształcane w karty na tablicach Kanban, co pozwala na łatwe śledzenie postępów
          i realizacji zadań.
        </p>
        <div className="flex justify-end">
          <Link href="/dashboard/meeting-stats" className="text-sm text-blue-600 flex items-center">
            Zobacz statystyki spotkań
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MeetingsView;