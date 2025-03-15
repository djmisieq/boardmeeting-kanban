'use client';

import React, { useState } from 'react';
import { CardType } from '@/lib/types';
import { useMeetingsStore } from '@/store/use-meetings-store';
import { 
  CheckSquare, 
  AlertCircle, 
  Lightbulb,
  Calendar,
  User,
  Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { getSuggestedColumnForMeetingOutcome } from '@/lib/meeting-board-utils';

// Lista przykładowych użytkowników
const USERS = [
  { id: 'user-1', name: 'Jan Kowalski' },
  { id: 'user-2', name: 'Anna Nowak' },
  { id: 'user-3', name: 'Michał Wiśniewski' },
  { id: 'user-4', name: 'Karolina Lewandowska' },
  { id: 'user-5', name: 'Piotr Zieliński' },
];

type OutcomeType = 'task' | 'problem' | 'idea';

interface OutcomeFormProps {
  meetingId: string;
  agendaItemId?: string;
  outcomeType: OutcomeType;
  isOpen: boolean;
  onClose: () => void;
}

const OutcomeForm: React.FC<OutcomeFormProps> = ({ 
  meetingId, 
  agendaItemId, 
  outcomeType,
  isOpen, 
  onClose
}) => {
  const { 
    addOutcomeTask, 
    addOutcomeProblem, 
    addOutcomeIdea 
  } = useMeetingsStore();
  
  // Stan formularza
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | ''>('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Resetowanie formularza przy zamknięciu
  React.useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setDueDate(undefined);
      setAssignee('');
      setPriority('');
      setErrors({});
    }
  }, [isOpen]);
  
  // Walidacja formularza
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Tytuł jest wymagany';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Obsługa zapisu wyniku spotkania
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formattedDueDate = dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined;
      const defaultColumnId = getSuggestedColumnForMeetingOutcome(meetingId, agendaItemId || null, outcomeType);
      
      const outcomeData = {
        title,
        description: description || undefined,
        dueDate: formattedDueDate,
        assignee: assignee || undefined,
        priority: priority as 'low' | 'medium' | 'high' | undefined,
        columnId: defaultColumnId
      };
      
      switch (outcomeType) {
        case 'task':
          addOutcomeTask(meetingId, agendaItemId || null, outcomeData);
          break;
        case 'problem':
          addOutcomeProblem(meetingId, agendaItemId || null, outcomeData);
          break;
        case 'idea':
          addOutcomeIdea(meetingId, agendaItemId || null, outcomeData);
          break;
      }
      
      onClose();
    } catch (error) {
      console.error('Błąd podczas zapisywania wyniku spotkania:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Tytuł formularza w zależności od typu wyniku
  const getFormTitle = (): string => {
    switch (outcomeType) {
      case 'task':
        return 'Dodaj nowe zadanie';
      case 'problem':
        return 'Dodaj nowy problem';
      case 'idea':
        return 'Dodaj nowy pomysł usprawnienia';
      default:
        return 'Dodaj wynik spotkania';
    }
  };
  
  // Ikona w zależności od typu wyniku
  const getFormIcon = () => {
    switch (outcomeType) {
      case 'task':
        return <CheckSquare className="h-5 w-5 text-blue-600" />;
      case 'problem':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case 'idea':
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFormIcon()}
            {getFormTitle()}
          </DialogTitle>
          <DialogDescription>
            {outcomeType === 'task' && 'Zadanie zostanie dodane do tablicy zadań w odpowiedniej kolumnie.'}
            {outcomeType === 'problem' && 'Problem zostanie dodany do tablicy problemów w odpowiedniej kolumnie.'}
            {outcomeType === 'idea' && 'Pomysł zostanie dodany do tablicy usprawnień w odpowiedniej kolumnie.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Tytuł <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                outcomeType === 'task' 
                  ? 'Np. Przygotować prezentację dla klienta' 
                  : outcomeType === 'problem'
                    ? 'Np. Awaria systemu logowania' 
                    : 'Np. Usprawnić proces akceptacji wniosków'
              }
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Opis
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Szczegółowy opis..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium mb-1">
                Osoba odpowiedzialna
              </label>
              <Select 
                value={assignee} 
                onValueChange={setAssignee}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz osobę" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nie wybrano</SelectItem>
                  {USERS.map(user => (
                    <SelectItem key={user.id} value={user.name}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium mb-1">
                Priorytet
              </label>
              <Select 
                value={priority} 
                onValueChange={(value) => setPriority(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz priorytet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nie wybrano</SelectItem>
                  <SelectItem value="low">Niski</SelectItem>
                  <SelectItem value="medium">Średni</SelectItem>
                  <SelectItem value="high">Wysoki</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
              Termin
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "dd.MM.yyyy") : "Wybierz termin"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Zapisywanie...' : 'Dodaj'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OutcomeForm;