'use client';

import React, { useState, useEffect } from 'react';
import { AgendaItem } from '@/lib/types';
import { useMeetingsStore } from '@/store/use-meetings-store';
import { 
  FileText, 
  Users, 
  Clock, 
  Save, 
  X,
  ChevronRight
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

// Lista przykładowych użytkowników
const USERS = [
  { id: 'user-1', name: 'Jan Kowalski' },
  { id: 'user-2', name: 'Anna Nowak' },
  { id: 'user-3', name: 'Michał Wiśniewski' },
  { id: 'user-4', name: 'Karolina Lewandowska' },
  { id: 'user-5', name: 'Piotr Zieliński' },
];

interface AgendaItemFormProps {
  meetingId: string;
  agendaItemId?: string;
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
}

const AgendaItemForm: React.FC<AgendaItemFormProps> = ({ 
  meetingId, 
  agendaItemId, 
  isOpen, 
  onClose, 
  isEdit = false 
}) => {
  const { getMeeting, addAgendaItem, updateAgendaItem } = useMeetingsStore();
  
  // Stan formularza
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('15');
  const [presenter, setPresenter] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pobierz dane punktu agendy, jeśli edytujemy
  useEffect(() => {
    if (isEdit && agendaItemId) {
      const meeting = getMeeting(meetingId);
      if (meeting) {
        const agendaItem = meeting.agenda.find(item => item.id === agendaItemId);
        if (agendaItem) {
          setTitle(agendaItem.title);
          setDescription(agendaItem.description || '');
          setDuration(String(agendaItem.duration));
          setPresenter(agendaItem.presenter || '');
        }
      }
    }
  }, [isEdit, agendaItemId, meetingId, getMeeting]);
  
  // Resetowanie formularza przy zamknięciu
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setDuration('15');
      setPresenter('');
      setErrors({});
    }
  }, [isOpen]);
  
  // Walidacja formularza
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Tytuł jest wymagany';
    }
    
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      newErrors.duration = 'Czas trwania musi być dodatnią liczbą';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Obsługa zapisu punktu agendy
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEdit && agendaItemId) {
        // Aktualizacja istniejącego punktu
        updateAgendaItem(meetingId, agendaItemId, {
          title,
          description: description || undefined,
          duration: Number(duration),
          presenter: presenter || undefined,
        });
      } else {
        // Dodanie nowego punktu
        addAgendaItem(meetingId, {
          title,
          description: description || undefined,
          duration: Number(duration),
          presenter: presenter || undefined,
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Błąd podczas zapisywania punktu agendy:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generowanie opcji czasu trwania
  const generateDurationOptions = () => {
    const options = [];
    for (let min = 5; min <= 120; min += 5) {
      options.push(String(min));
    }
    return options;
  };
  
  const durationOptions = generateDurationOptions();
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edytuj punkt agendy' : 'Dodaj nowy punkt agendy'}
          </DialogTitle>
          <DialogDescription>
            Punkty agendy pomagają strukturyzować przebieg spotkania i śledzić tematy do omówienia.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Tytuł punktu <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Np. Przegląd postępów z ostatniego tygodnia"
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
              placeholder="Opisz, co będzie omawiane w tym punkcie"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium mb-1">
                Czas trwania (min) <span className="text-red-500">*</span>
              </label>
              <Select 
                value={duration} 
                onValueChange={setDuration}
              >
                <SelectTrigger className={errors.duration ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Wybierz czas" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map(dur => (
                    <SelectItem key={dur} value={dur}>
                      {dur} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="presenter" className="block text-sm font-medium mb-1">
                Prowadzący
              </label>
              <Select 
                value={presenter} 
                onValueChange={setPresenter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz prowadzącego" />
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
              {isSubmitting 
                ? 'Zapisywanie...' 
                : isEdit 
                  ? 'Zapisz zmiany' 
                  : 'Dodaj punkt agendy'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AgendaItemForm;