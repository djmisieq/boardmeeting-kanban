'use client';

import React, { useState } from 'react';
import { Meeting, AgendaItem, CardType } from '@/lib/types';
import { useMeetingsStore } from '@/store/use-meetings-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Building2, 
  ArrowLeft, 
  Check, 
  Edit, 
  Trash, 
  Copy,
  CheckSquare,
  AlertCircle,
  Lightbulb,
  Plus,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Play,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface MeetingDetailProps {
  meetingId: string;
}

// List of users (hardcoded for now but could be from a store)
const USERS = [
  { id: 'user-1', name: 'Jan Kowalski', initials: 'JK' },
  { id: 'user-2', name: 'Anna Nowak', initials: 'AN' },
  { id: 'user-3', name: 'Michał Wiśniewski', initials: 'MW' },
  { id: 'user-4', name: 'Karolina Lewandowska', initials: 'KL' },
  { id: 'user-5', name: 'Piotr Zieliński', initials: 'PZ' },
];

const MeetingDetail: React.FC<MeetingDetailProps> = ({ meetingId }) => {
  const router = useRouter();
  const { getMeeting, updateMeeting, deleteMeeting, completeAgendaItem } = useMeetingsStore();
  const { getDepartmentById } = useDepartmentsStore();
  
  const [activeTab, setActiveTab] = useState('agenda');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [openAgendaItems, setOpenAgendaItems] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  
  const meeting = getMeeting(meetingId);
  
  if (!meeting) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Spotkanie nie zostało znalezione</h2>
        <p className="mb-6">Spotkanie o podanym identyfikatorze nie istnieje lub zostało usunięte.</p>
        <Button onClick={() => router.push('/meetings')}>
          Wróć do listy spotkań
        </Button>
      </div>
    );
  }
  
  // Formatowanie daty
  const formattedDate = format(parseISO(meeting.date), 'EEEE, d MMMM yyyy', { locale: pl });
  
  // Pobieranie nazw działów
  const departmentNames = meeting.departments
    .map(id => {
      const dept = getDepartmentById(id);
      return dept ? dept.name : '';
    })
    .filter(Boolean);
  
  // Obsługa usuwania spotkania
  const handleDeleteMeeting = () => {
    deleteMeeting(meetingId);
    router.push('/meetings');
  };
  
  // Obsługa zakończenia spotkania
  const handleCompleteMeeting = () => {
    updateMeeting(meetingId, {
      status: 'completed',
    });
  };
  
  // Przełączanie stanu rozwinięcia punktu agendy
  const toggleAgendaItem = (id: string) => {
    setOpenAgendaItems(prev => 
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };
  
  // Obsługa zakończenia punktu agendy
  const handleCompleteAgendaItem = (agendaItemId: string) => {
    completeAgendaItem(meetingId, agendaItemId);
  };
  
  // Wyświetlanie uczestników
  const renderParticipants = () => {
    return meeting.participants.map(participantId => {
      const user = USERS.find(u => u.id === participantId);
      if (!user) return null;
      
      return (
        <div key={participantId} className="flex items-center gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            {participantId === meeting.organizer && (
              <p className="text-xs text-blue-600">Organizator</p>
            )}
          </div>
        </div>
      );
    });
  };
  
  // Renderowanie listy punktów agendy
  const renderAgendaItems = () => {
    if (meeting.agenda.length === 0) {
      return (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Brak punktów agendy dla tego spotkania.</p>
        </div>
      );
    }
    
    return meeting.agenda.map((item) => (
      <Collapsible
        key={item.id}
        open={openAgendaItems.includes(item.id)}
        onOpenChange={() => toggleAgendaItem(item.id)}
        className="border rounded-lg mb-3"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1">
            <Badge 
              variant={item.status === 'completed' ? 'default' : 'outline'}
              className={item.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
            >
              {item.status === 'completed' ? 'Zakończone' : 'Do omówienia'}
            </Badge>
            <h3 className="font-medium truncate">{item.title}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {item.duration && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {item.duration} min
              </span>
            )}
            
            {item.status !== 'completed' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteAgendaItem(item.id);
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className="h-4 w-4 transition-transform ui-open:rotate-180" />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 space-y-3">
            {item.description && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {item.description}
              </div>
            )}
            
            {item.presenter && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <span>Prowadzący: {item.presenter}</span>
              </div>
            )}
            
            {/* Wyniki dla tego punktu agendy */}
            {item.outcome && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Wyniki omówienia:</h4>
                
                {(item.outcome.tasks?.length > 0 || 
                  item.outcome.problems?.length > 0 || 
                  item.outcome.ideas?.length > 0) ? (
                  <div className="space-y-2">
                    {item.outcome.tasks && item.outcome.tasks.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium flex items-center gap-1 mb-1">
                          <CheckSquare className="h-3 w-3 text-blue-600" />
                          Zadania
                        </h5>
                        <ul className="space-y-1">
                          {item.outcome.tasks.map(task => (
                            <li key={task.id} className="text-sm flex items-center gap-1">
                              <CheckSquare className="h-3 w-3 text-gray-400" />
                              <span>{task.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {item.outcome.problems && item.outcome.problems.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium flex items-center gap-1 mb-1">
                          <AlertCircle className="h-3 w-3 text-amber-600" />
                          Problemy
                        </h5>
                        <ul className="space-y-1">
                          {item.outcome.problems.map(problem => (
                            <li key={problem.id} className="text-sm flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-gray-400" />
                              <span>{problem.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {item.outcome.ideas && item.outcome.ideas.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium flex items-center gap-1 mb-1">
                          <Lightbulb className="h-3 w-3 text-yellow-600" />
                          Pomysły usprawnień
                        </h5>
                        <ul className="space-y-1">
                          {item.outcome.ideas.map(idea => (
                            <li key={idea.id} className="text-sm flex items-center gap-1">
                              <Lightbulb className="h-3 w-3 text-gray-400" />
                              <span>{idea.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Brak wyników dla tego punktu agendy.</p>
                )}
              </div>
            )}
            
            {/* Przyciski akcji dla punktu agendy */}
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" className="text-xs flex gap-1">
                <Plus className="h-3 w-3" />
                Dodaj zadanie
              </Button>
              <Button size="sm" variant="outline" className="text-xs flex gap-1">
                <Plus className="h-3 w-3" />
                Dodaj problem
              </Button>
              <Button size="sm" variant="outline" className="text-xs flex gap-1">
                <Plus className="h-3 w-3" />
                Dodaj pomysł
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    ));
  };
  
  // Renderowanie kart wyników spotkania
  const renderOutcomeCards = (cards: CardType[] | undefined, type: 'task' | 'problem' | 'idea') => {
    if (!cards || cards.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">Brak wyników tego typu.</p>
        </div>
      );
    }
    
    const icon = type === 'task' 
      ? <CheckSquare className="h-4 w-4 text-blue-600" />
      : type === 'problem'
        ? <AlertCircle className="h-4 w-4 text-amber-600" />
        : <Lightbulb className="h-4 w-4 text-yellow-600" />;
    
    return (
      <div className="space-y-2">
        {cards.map(card => (
          <div key={card.id} className="border rounded-md p-3 hover:bg-gray-50">
            <div className="flex items-start gap-2">
              <div className="mt-1">{icon}</div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{card.title}</h4>
                {card.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {card.description}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    {card.assignee && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {card.assignee}
                      </span>
                    )}
                    {card.dueDate && (
                      <span className="text-xs text-gray-500 flex items-center gap-1 ml-2">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(card.dueDate), 'dd.MM.yyyy')}
                      </span>
                    )}
                  </div>
                  <Link 
                    href={card.columnId ? `/card?id=${card.id}&boardId=${card.columnId.split('-')[0]}` : '#'}
                    className="text-xs text-blue-600 flex items-center"
                  >
                    Zobacz
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Określ status spotkania
  const getMeetingBadgeInfo = () => {
    switch (meeting.status) {
      case 'scheduled':
        return { text: 'Zaplanowane', color: 'bg-blue-100 text-blue-800' };
      case 'in-progress':
        return { text: 'W trakcie', color: 'bg-yellow-100 text-yellow-800' };
      case 'completed':
        return { text: 'Zakończone', color: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { text: 'Anulowane', color: 'bg-red-100 text-red-800' };
      default:
        return { text: 'Zaplanowane', color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  const meetingBadge = getMeetingBadgeInfo();
  
  // Obliczenie liczby wyników spotkania
  const outcomesCount = (
    (meeting.outcomes?.tasks?.length || 0) +
    (meeting.outcomes?.problems?.length || 0) +
    (meeting.outcomes?.ideas?.length || 0)
  );
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/meetings')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
          <h1 className="text-2xl font-semibold">{meeting.title}</h1>
        </div>
        
        <div className="flex gap-2">
          {/* Stan spotkania */}
          <Badge className={meetingBadge.color}>{meetingBadge.text}</Badge>
          
          {/* Akcje dla spotkania */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Opcje spotkania</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href={`/meetings/${meetingId}/edit`}>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    <span>Edytuj spotkanie</span>
                  </DropdownMenuItem>
                </Link>
                
                {meeting.status !== 'completed' && (
                  <DropdownMenuItem onClick={handleCompleteMeeting}>
                    <Check className="h-4 w-4 mr-2" />
                    <span>Oznacz jako zakończone</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  <span>Duplikuj spotkanie</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash className="h-4 w-4 mr-2" />
                <span>Usuń spotkanie</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Informacje o spotkaniu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 bg-white border rounded-lg p-5 shadow-sm">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="capitalize">{formattedDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Godzina</p>
                  <p>{meeting.startTime} - {meeting.endTime}</p>
                </div>
              </div>
              
              {meeting.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Miejsce</p>
                    <p>{meeting.location}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Działy</p>
                  <p className="truncate">{departmentNames.join(', ')}</p>
                </div>
              </div>
            </div>
            
            {meeting.description && (
              <div className="pt-4 border-t">
                <h2 className="text-lg font-medium mb-2">Opis</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{meeting.description}</p>
              </div>
            )}
            
            {outcomesCount > 0 && (
              <div className="flex items-center pt-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                  {outcomesCount} {outcomesCount === 1 ? 'wynik' : 'wyników'} spotkania
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-gray-400" />
            Uczestnicy
          </h2>
          
          <ScrollArea className="h-[200px] rounded-md">
            {renderParticipants()}
          </ScrollArea>
        </div>
      </div>
      
      {/* Zakładki */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="bg-white border rounded-lg shadow-sm"
      >
        <TabsList className="p-0 h-12 rounded-none border-b bg-transparent">
          <TabsTrigger 
            value="agenda" 
            className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none"
          >
            <FileText className="h-4 w-4 mr-2" />
            Agenda
          </TabsTrigger>
          <TabsTrigger 
            value="tasks" 
            className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Zadania
          </TabsTrigger>
          <TabsTrigger 
            value="problems" 
            className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:shadow-none"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Problemy
          </TabsTrigger>
          <TabsTrigger 
            value="ideas" 
            className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-yellow-600 data-[state=active]:shadow-none"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Pomysły
          </TabsTrigger>
          <TabsTrigger 
            value="notes" 
            className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:shadow-none"
          >
            <FileText className="h-4 w-4 mr-2" />
            Notatki
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="agenda" className="p-6 mt-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Agenda spotkania</h2>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj punkt
            </Button>
          </div>
          {renderAgendaItems()}
        </TabsContent>
        
        <TabsContent value="tasks" className="p-6 mt-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Zadania z tego spotkania</h2>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj zadanie
            </Button>
          </div>
          {renderOutcomeCards(meeting.outcomes?.tasks, 'task')}
        </TabsContent>
        
        <TabsContent value="problems" className="p-6 mt-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Problemy z tego spotkania</h2>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj problem
            </Button>
          </div>
          {renderOutcomeCards(meeting.outcomes?.problems, 'problem')}
        </TabsContent>
        
        <TabsContent value="ideas" className="p-6 mt-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Pomysły z tego spotkania</h2>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj pomysł
            </Button>
          </div>
          {renderOutcomeCards(meeting.outcomes?.ideas, 'idea')}
        </TabsContent>
        
        <TabsContent value="notes" className="p-6 mt-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Notatki ze spotkania</h2>
            <Button size="sm" onClick={() => updateMeeting(meetingId, { notes })}>
              Zapisz notatki
            </Button>
          </div>
          <Textarea
            placeholder="Dodaj notatki ze spotkania tutaj..."
            className="min-h-[300px]"
            value={meeting.notes || notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </TabsContent>
      </Tabs>
      
      {/* Dialog potwierdzenia usunięcia */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usunąć spotkanie?</DialogTitle>
            <DialogDescription>
              Ta akcja jest nieodwracalna. Spowoduje usunięcie spotkania wraz ze wszystkimi powiązanymi punktami agendy i wynikami.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDeleteMeeting}>
              Usuń spotkanie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetingDetail;