'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckSquare,
  AlertCircle,
  Lightbulb,
  Calendar,
  Flag,
  User,
  X,
  PanelLeftClose,
  AlertTriangle
} from 'lucide-react';
import { useMeetingsStore } from '@/store/use-meetings-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useKanbanStore } from '@/store/use-kanban-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AgendaItem, CardType } from '@/lib/types';

type OutcomeType = 'task' | 'problem' | 'idea';

interface MeetingOutcomeFormProps {
  meetingId: string;
  agendaItemId?: string;
  type: OutcomeType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MeetingOutcomeForm: React.FC<MeetingOutcomeFormProps> = ({
  meetingId,
  agendaItemId,
  type,
  onSuccess,
  onCancel
}) => {
  const router = useRouter();
  const { getMeeting, addOutcomeTask, addOutcomeProblem, addOutcomeIdea } = useMeetingsStore();
  const { getDepartmentById } = useDepartmentsStore();
  const { boards } = useKanbanStore();
  
  const meeting = getMeeting(meetingId);
  
  // Get agenda item if ID provided
  const agendaItem = agendaItemId 
    ? meeting?.agenda.find(item => item.id === agendaItemId)
    : undefined;
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [departmentId, setDepartmentId] = useState('');
  const [initialColumnId, setInitialColumnId] = useState('');
  
  // Find matching board for the department and type
  useEffect(() => {
    if (departmentId && boards.length > 0) {
      let boardType = '';
      switch (type) {
        case 'task':
          boardType = 'tasks';
          break;
        case 'problem':
          boardType = 'problems';
          break;
        case 'idea':
          boardType = 'ideas';
          break;
      }
      
      const matchingBoard = boards.find(
        board => board.departmentId === departmentId && board.type === boardType
      );
      
      if (matchingBoard && matchingBoard.columns.length > 0) {
        // Set default initial column (usually the first one)
        setInitialColumnId(matchingBoard.columns[0].id);
      }
    }
  }, [departmentId, type, boards]);
  
  // Set default department ID from meeting if only one department
  useEffect(() => {
    if (meeting?.departments.length === 1) {
      setDepartmentId(meeting.departments[0]);
    }
  }, [meeting]);
  
  // Form validation
  const isFormValid = title.trim() !== '' && departmentId !== '';
  
  // Get type-specific details
  const getTypeDetails = () => {
    switch (type) {
      case 'task':
        return {
          title: 'Dodaj zadanie',
          icon: <CheckSquare className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />,
          description: 'Dodaj nowe zadanie jako wynik spotkania.',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        };
      case 'problem':
        return {
          title: 'Dodaj problem',
          icon: <AlertCircle className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />,
          description: 'Dodaj nowy problem jako wynik spotkania.',
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20'
        };
      case 'idea':
        return {
          title: 'Dodaj pomysł',
          icon: <Lightbulb className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />,
          description: 'Dodaj nowy pomysł jako wynik spotkania.',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        };
    }
  };
  
  const typeDetails = getTypeDetails();
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || !meeting) return;
    
    const outcomeData: Omit<CardType, 'id' | 'createdAt' | 'meetingId'> = {
      title,
      description,
      assignee,
      dueDate: dueDate || undefined,
      priority: priority as 'low' | 'medium' | 'high',
      boardId: getBoardId(departmentId, type),
      columnId: initialColumnId,
      departmentId,
      category: type,
    };
    
    let outcomeId = '';
    
    switch (type) {
      case 'task':
        outcomeId = addOutcomeTask(meetingId, agendaItemId || null, outcomeData);
        break;
      case 'problem':
        outcomeId = addOutcomeProblem(meetingId, agendaItemId || null, outcomeData);
        break;
      case 'idea':
        outcomeId = addOutcomeIdea(meetingId, agendaItemId || null, outcomeData);
        break;
    }
    
    if (onSuccess) {
      onSuccess();
    } else {
      router.push(`/meetings/${meetingId}`);
    }
  };
  
  // Get board ID based on department and type
  const getBoardId = (deptId: string, type: OutcomeType): string => {
    const boardType = type === 'task' ? 'tasks' : type === 'problem' ? 'problems' : 'ideas';
    
    const boardId = `${deptId}-${boardType}`;
    return boardId;
  };
  
  // Get available columns for selected department and type
  const getAvailableColumns = () => {
    if (!departmentId) return [];
    
    const boardType = type === 'task' ? 'tasks' : type === 'problem' ? 'problems' : 'ideas';
    const boardId = `${departmentId}-${boardType}`;
    
    const board = boards.find(b => b.id === boardId);
    return board ? board.columns : [];
  };
  
  if (!meeting) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Spotkanie nie zostało znalezione</h3>
        <Button asChild>
          <a href="/meetings">Wróć do listy spotkań</a>
        </Button>
      </div>
    );
  }
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className={`${typeDetails.bgColor}`}>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            {typeDetails.icon}
            {typeDetails.title}
          </CardTitle>
          
          {agendaItem && (
            <Badge variant="outline">
              Punkt agendy: {agendaItem.title}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          {typeDetails.description} Element zostanie dodany do odpowiedniej tablicy Kanban.
        </p>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Wpisz tytuł ${type === 'task' ? 'zadania' : type === 'problem' ? 'problemu' : 'pomysłu'}`}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dodaj szczegółowy opis"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Dział</Label>
              <Select
                value={departmentId}
                onValueChange={setDepartmentId}
                required
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Wybierz dział" />
                </SelectTrigger>
                <SelectContent>
                  {meeting.departments.map(deptId => {
                    const dept = getDepartmentById(deptId);
                    return (
                      <SelectItem key={deptId} value={deptId}>
                        {dept ? dept.name : deptId}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="initialColumn">Kolumna początkowa</Label>
              <Select
                value={initialColumnId}
                onValueChange={setInitialColumnId}
                disabled={!departmentId}
              >
                <SelectTrigger id="initialColumn">
                  <SelectValue placeholder="Wybierz kolumnę" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableColumns().map(column => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Przypisz do</Label>
              <Input
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Imię osoby odpowiedzialnej"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Termin</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priorytet</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <span className="flex items-center">
                    <Flag className="h-4 w-4 mr-2 text-green-600" />
                    Niski
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center">
                    <Flag className="h-4 w-4 mr-2 text-amber-600" />
                    Średni
                  </span>
                </SelectItem>
                <SelectItem value="high">
                  <span className="flex items-center">
                    <Flag className="h-4 w-4 mr-2 text-red-600" />
                    Wysoki
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel || (() => router.back())}
          >
            <X className="h-4 w-4 mr-2" />
            Anuluj
          </Button>
          
          <Button 
            type="submit" 
            disabled={!isFormValid}
            className={typeDetails.color}
          >
            {typeDetails.icon}
            {`Dodaj ${type === 'task' ? 'zadanie' : type === 'problem' ? 'problem' : 'pomysł'}`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default MeetingOutcomeForm;