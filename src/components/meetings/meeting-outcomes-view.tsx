'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, 
  AlertCircle, 
  Lightbulb, 
  ArrowRight,
  Calendar,
  Clock,
  Users,
  Filter
} from 'lucide-react';
import { useMeetingsStore } from '@/store/use-meetings-store';
import { useKanbanStore } from '@/store/use-kanban-store';
import { CardType, Meeting } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface MeetingOutcomesViewProps {
  meetingId: string;
}

/**
 * Component for displaying meeting outcomes (tasks, problems, ideas) with Kanban status
 */
const MeetingOutcomesView: React.FC<MeetingOutcomesViewProps> = ({ meetingId }) => {
  const { getMeeting } = useMeetingsStore();
  const { findCardById, getBoard } = useKanbanStore();
  const [activeTab, setActiveTab] = useState('tasks');
  
  // Get meeting data
  const meeting = getMeeting(meetingId);
  
  if (!meeting) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-center text-gray-500 dark:text-gray-400">Spotkanie nie zostało znalezione</p>
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
  
  // Get card current status
  const getCardStatus = (card: CardType) => {
    if (!card.boardId || !card.columnId) return null;
    
    const board = getBoard(card.boardId);
    if (!board) return null;
    
    const column = board.columns.find(col => col.id === card.columnId);
    if (!column) return null;
    
    return column.title;
  };
  
  // Get status badge color based on column type
  const getStatusBadgeClass = (columnTitle: string) => {
    const normalizedTitle = columnTitle.toLowerCase();
    
    if (normalizedTitle.includes('done') || 
        normalizedTitle.includes('zakończone') || 
        normalizedTitle.includes('resolved') || 
        normalizedTitle.includes('rozwiązane') ||
        normalizedTitle.includes('completed') ||
        normalizedTitle.includes('wdrożone')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    }
    
    if (normalizedTitle.includes('progress') || 
        normalizedTitle.includes('trakcie') ||
        normalizedTitle.includes('implement') ||
        normalizedTitle.includes('wdrażanie')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }
    
    if (normalizedTitle.includes('new') || 
        normalizedTitle.includes('nowe') || 
        normalizedTitle.includes('todo') || 
        normalizedTitle.includes('do zrobienia')) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
  };
  
  // Render outcome card
  const renderOutcomeCard = (card: CardType) => {
    const cardStatus = getCardStatus(card);
    const statusClass = cardStatus ? getStatusBadgeClass(cardStatus) : '';
    
    return (
      <Card key={card.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base">{card.title}</CardTitle>
            {cardStatus && (
              <Badge variant="outline" className={statusClass}>
                {cardStatus}
              </Badge>
            )}
          </div>
          {card.assignee && (
            <CardDescription>
              Przypisano: {card.assignee}
            </CardDescription>
          )}
        </CardHeader>
        
        {card.description && (
          <CardContent className="py-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {card.description}
            </p>
          </CardContent>
        )}
        
        <CardFooter className="pt-2 flex justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {card.createdAt ? new Date(card.createdAt).toLocaleDateString() : 'Brak daty'}
          </div>
          
          <Link 
            href={`/card/${card.id}`}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          >
            Zobacz kartę
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </CardFooter>
      </Card>
    );
  };
  
  // Helper to render empty state
  const renderEmptyState = (type: 'tasks' | 'problems' | 'ideas') => {
    const messages = {
      tasks: 'Brak zadań dla tego spotkania',
      problems: 'Brak problemów dla tego spotkania',
      ideas: 'Brak pomysłów dla tego spotkania'
    };
    
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">{messages[type]}</p>
      </div>
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-2">{meeting.title}</h2>
        
        <div className="space-y-2 text-sm mb-4">
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
        
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Wyniki spotkania</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center mr-3">
              <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
              {meeting.outcomes?.tasks?.length || 0} zadań
            </span>
            <span className="inline-flex items-center mr-3">
              <div className="h-3 w-3 rounded-full bg-amber-500 mr-1"></div>
              {meeting.outcomes?.problems?.length || 0} problemów
            </span>
            <span className="inline-flex items-center">
              <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1"></div>
              {meeting.outcomes?.ideas?.length || 0} pomysłów
            </span>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="tasks" value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <TabsList className="bg-transparent h-auto p-0">
            <TabsTrigger 
              value="tasks" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-3"
            >
              <CheckSquare className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
              Zadania
            </TabsTrigger>
            <TabsTrigger 
              value="problems" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:shadow-none rounded-none px-4 py-3"
            >
              <AlertCircle className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
              Problemy
            </TabsTrigger>
            <TabsTrigger 
              value="ideas" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-yellow-600 data-[state=active]:shadow-none rounded-none px-4 py-3"
            >
              <Lightbulb className="h-4 w-4 mr-2 text-yellow-600 dark:text-yellow-400" />
              Pomysły
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="tasks" className="p-4 sm:p-6">
          {meeting.outcomes?.tasks?.length ? (
            meeting.outcomes.tasks.map(task => renderOutcomeCard(task))
          ) : (
            renderEmptyState('tasks')
          )}
        </TabsContent>
        
        <TabsContent value="problems" className="p-4 sm:p-6">
          {meeting.outcomes?.problems?.length ? (
            meeting.outcomes.problems.map(problem => renderOutcomeCard(problem))
          ) : (
            renderEmptyState('problems')
          )}
        </TabsContent>
        
        <TabsContent value="ideas" className="p-4 sm:p-6">
          {meeting.outcomes?.ideas?.length ? (
            meeting.outcomes.ideas.map(idea => renderOutcomeCard(idea))
          ) : (
            renderEmptyState('ideas')
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MeetingOutcomesView;
