'use client';

import React, { useState, useEffect } from 'react';
import { Meeting } from '@/lib/types';
import { useMeetingsStore } from '@/store/use-meetings-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Building2, 
  Info, 
  ArrowLeft, 
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { format, addHours } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface MeetingFormProps {
  meetingId?: string;
  isEdit?: boolean;
}

// List of users (hardcoded for now but could be from a store)
const USERS = [
  { id: 'user-1', name: 'Jan Kowalski' },
  { id: 'user-2', name: 'Anna Nowak' },
  { id: 'user-3', name: 'Michał Wiśniewski' },
  { id: 'user-4', name: 'Karolina Lewandowska' },
  { id: 'user-5', name: 'Piotr Zieliński' },
];

const MeetingForm: React.FC<MeetingFormProps> = ({ 
  meetingId, 
  isEdit = false 
}) => {
  const router = useRouter();
  const { createMeeting, updateMeeting, getMeeting } = useMeetingsStore();
  const { departments } = useDepartmentsStore();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState(USERS[0].id);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load meeting data if editing
  useEffect(() => {
    if (isEdit && meetingId) {
      const meeting = getMeeting(meetingId);
      if (meeting) {
        setTitle(meeting.title);
        setDescription(meeting.description || '');
        setDate(new Date(meeting.date));
        setStartTime(meeting.startTime);
        setEndTime(meeting.endTime);
        setLocation(meeting.location || '');
        setOrganizer(meeting.organizer);
        setSelectedParticipants(meeting.participants);
        setSelectedDepartments(meeting.departments);
      }
    }
  }, [isEdit, meetingId, getMeeting]);
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Tytuł jest wymagany';
    }
    
    if (!date) {
      newErrors.date = 'Data jest wymagana';
    }
    
    if (!startTime) {
      newErrors.startTime = 'Czas rozpoczęcia jest wymagany';
    }
    
    if (!endTime) {
      newErrors.endTime = 'Czas zakończenia jest wymagany';
    }
    
    if (startTime && endTime) {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
        newErrors.endTime = 'Czas zakończenia musi być późniejszy niż czas rozpoczęcia';
      }
    }
    
    if (!organizer) {
      newErrors.organizer = 'Organizator jest wymagany';
    }
    
    if (selectedParticipants.length === 0) {
      newErrors.participants = 'Przynajmniej jeden uczestnik jest wymagany';
    }
    
    if (selectedDepartments.length === 0) {
      newErrors.departments = 'Przynajmniej jeden dział jest wymagany';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    try {
      if (isEdit && meetingId) {
        // Update existing meeting
        updateMeeting(meetingId, {
          title,
          description,
          date: formattedDate,
          startTime,
          endTime,
          location,
          organizer,
          participants: selectedParticipants,
          departments: selectedDepartments,
        });
      } else {
        // Create new meeting
        const newMeetingId = createMeeting({
          title,
          description,
          date: formattedDate,
          startTime,
          endTime,
          location,
          organizer,
          participants: selectedParticipants,
          departments: selectedDepartments,
          status: 'scheduled',
        });
        
        // Redirect to the new meeting
        router.push(`/meetings/${newMeetingId}`);
      }
      
      // Redirect back to meetings list after save
      router.push('/meetings');
    } catch (error) {
      console.error('Error saving meeting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle participant selection
  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  // Toggle department selection
  const toggleDepartment = (deptId: string) => {
    setSelectedDepartments(prev => 
      prev.includes(deptId)
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };
  
  // Generate time options
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };
  
  const timeOptions = generateTimeOptions();
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Powrót
        </Button>
        <h1 className="text-2xl font-semibold">
          {isEdit ? 'Edytuj spotkanie' : 'Nowe spotkanie'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
        {/* Tytuł i opis */}
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Tytuł spotkania <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Np. Cotygodniowe spotkanie zespołu"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Opis spotkania
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opisz cel i agendę spotkania"
              rows={4}
            />
          </div>
        </div>
        
        {/* Data i czas */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Data i czas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Data <span className="text-red-500">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                      errors.date ? 'border-red-500' : ''
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd.MM.yyyy") : "Wybierz datę"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium mb-1">
                  Rozpoczęcie <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={startTime} 
                  onValueChange={setStartTime}
                >
                  <SelectTrigger className={errors.startTime ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Wybierz czas" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.startTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium mb-1">
                  Zakończenie <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={endTime} 
                  onValueChange={setEndTime}
                >
                  <SelectTrigger className={errors.endTime ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Wybierz czas" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.endTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">
              Miejsce
            </label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Np. Sala konferencyjna A"
              className="w-full"
            />
          </div>
        </div>
        
        {/* Organizator i uczestnicy */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Organizator i uczestnicy</h2>
          
          <div>
            <label htmlFor="organizer" className="block text-sm font-medium mb-1">
              Organizator <span className="text-red-500">*</span>
            </label>
            <Select 
              value={organizer} 
              onValueChange={setOrganizer}
            >
              <SelectTrigger className={cn("w-full", errors.organizer ? 'border-red-500' : '')}>
                <SelectValue placeholder="Wybierz organizatora" />
              </SelectTrigger>
              <SelectContent>
                {USERS.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.organizer && (
              <p className="text-red-500 text-sm mt-1">{errors.organizer}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Uczestnicy <span className="text-red-500">*</span>
            </label>
            
            <div className="mb-2">
              {selectedParticipants.length > 0 ? (
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedParticipants.map(userId => {
                    const user = USERS.find(u => u.id === userId);
                    return (
                      <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                        {user?.name}
                        <button 
                          type="button" 
                          onClick={() => toggleParticipant(userId)}
                          className="h-4 w-4 rounded-full hover:bg-gray-200 flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-2">Brak wybranych uczestników</p>
              )}
            </div>
            
            <div className="border rounded-md">
              <Command>
                <CommandInput placeholder="Wyszukaj użytkownika..." />
                <CommandList>
                  <CommandEmpty>Nie znaleziono użytkowników</CommandEmpty>
                  <CommandGroup>
                    {USERS.map(user => (
                      <CommandItem
                        key={user.id}
                        onSelect={() => toggleParticipant(user.id)}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          checked={selectedParticipants.includes(user.id)}
                          onCheckedChange={() => {}}
                          className="mr-2"
                        />
                        <span>{user.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
            {errors.participants && (
              <p className="text-red-500 text-sm mt-1">{errors.participants}</p>
            )}
          </div>
        </div>
        
        {/* Działy */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Działy</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Wybierz działy <span className="text-red-500">*</span>
            </label>
            
            <div className="mb-2">
              {selectedDepartments.length > 0 ? (
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedDepartments.map(deptId => {
                    const dept = departments.find(d => d.id === deptId);
                    return (
                      <Badge key={deptId} variant="secondary" className="flex items-center gap-1">
                        {dept?.name}
                        <button 
                          type="button" 
                          onClick={() => toggleDepartment(deptId)}
                          className="h-4 w-4 rounded-full hover:bg-gray-200 flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-2">Brak wybranych działów</p>
              )}
            </div>
            
            <div className="border rounded-md">
              <Command>
                <CommandInput placeholder="Wyszukaj dział..." />
                <CommandList>
                  <CommandEmpty>Nie znaleziono działów</CommandEmpty>
                  <CommandGroup>
                    {departments.map(dept => (
                      <CommandItem
                        key={dept.id}
                        onSelect={() => toggleDepartment(dept.id)}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          checked={selectedDepartments.includes(dept.id)}
                          onCheckedChange={() => {}}
                          className="mr-2"
                        />
                        <span>{dept.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
            {errors.departments && (
              <p className="text-red-500 text-sm mt-1">{errors.departments}</p>
            )}
          </div>
        </div>
        
        {/* Przyciski akcji */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz spotkanie'}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MeetingForm;