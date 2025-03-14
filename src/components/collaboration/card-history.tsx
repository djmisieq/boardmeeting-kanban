'use client';

import { useCollaborationStore } from '@/store/use-collaboration-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { HistoryEntry, HistoryAction } from '@/lib/types';
import { 
  Clock, 
  Edit, 
  UserPlus, 
  MessageSquare, 
  Flag, 
  ArrowRight, 
  FolderPlus, 
  FolderMinus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

interface CardHistoryProps {
  cardId: string;
}

export default function CardHistory({ cardId }: CardHistoryProps) {
  const { getHistoryForCard } = useCollaborationStore();
  const { departments } = useDepartmentsStore();
  
  // Pobierz historię dla karty
  const history = getHistoryForCard(cardId);
  
  // Posortuj historię od najnowszej do najstarszej
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Znajdź nazwę departamentu
  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Nieznany dział';
  };
  
  // Formatowanie daty
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: pl
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Zwróć ikon i opis dla danej akcji
  const getActionInfo = (entry: HistoryEntry) => {
    const action = entry.action;
    
    switch (action) {
      case 'created':
        return {
          icon: <Edit className="text-green-600 dark:text-green-400" />,
          text: 'utworzył(a) kartę'
        };
      case 'updated':
        return {
          icon: <Edit className="text-blue-600 dark:text-blue-400" />,
          text: `zaktualizował(a) ${entry.details.field || 'kartę'}`
        };
      case 'moved':
        return {
          icon: <ArrowRight className="text-purple-600 dark:text-purple-400" />,
          text: 'przeniósł(a) kartę do innego statusu'
        };
      case 'assigned':
        return {
          icon: <UserPlus className="text-blue-600 dark:text-blue-400" />,
          text: entry.details.newValue 
            ? `przypisał(a) do ${entry.details.newValue}` 
            : 'usunął(a) przypisanie'
        };
      case 'commented':
        return {
          icon: <MessageSquare className="text-indigo-600 dark:text-indigo-400" />,
          text: 'dodał(a) komentarz'
        };
      case 'changed_priority':
        return {
          icon: <Flag className="text-orange-600 dark:text-orange-400" />,
          text: `zmienił(a) priorytet ${entry.details.oldValue ? `z ${entry.details.oldValue}` : ''} na ${entry.details.newValue || 'brak'}`
        };
      case 'changed_status':
        return {
          icon: <ArrowRight className="text-purple-600 dark:text-purple-400" />,
          text: `zmienił(a) status z "${entry.details.oldValue}" na "${entry.details.newValue}"`
        };
      case 'added_to_project':
        return {
          icon: <FolderPlus className="text-green-600 dark:text-green-400" />,
          text: `dodał(a) do projektu "${entry.details.newValue}"`
        };
      case 'removed_from_project':
        return {
          icon: <FolderMinus className="text-red-600 dark:text-red-400" />,
          text: `usunął(a) z projektu "${entry.details.oldValue}"`
        };
      default:
        return {
          icon: <Edit className="text-gray-600 dark:text-gray-400" />,
          text: 'zaktualizował(a) kartę'
        };
    }
  };
  
  // Renderowanie szczegółów zmiany
  const renderChangeDetails = (entry: HistoryEntry) => {
    if (entry.action === 'updated' && entry.details.field) {
      const { field, oldValue, newValue } = entry.details;
      
      return (
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {oldValue && newValue && (
            <div className="flex items-center gap-2">
              <span className="line-through">{String(oldValue)}</span>
              <ArrowRight size={12} />
              <span>{String(newValue)}</span>
            </div>
          )}
          {!oldValue && newValue && (
            <div>
              Dodano: <span className="font-medium">{String(newValue)}</span>
            </div>
          )}
          {oldValue && !newValue && (
            <div>
              Usunięto: <span className="font-medium line-through">{String(oldValue)}</span>
            </div>
          )}
        </div>
      );
    }
    
    if (entry.action === 'commented' && entry.details.comment) {
      return (
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded border-l-2 border-indigo-400">
          {entry.details.comment}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Historia zmian</h3>
      
      {sortedHistory.length > 0 ? (
        <div className="space-y-4">
          {sortedHistory.map(entry => {
            const { icon, text } = getActionInfo(entry);
            
            return (
              <div 
                key={entry.id} 
                className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{entry.user}</span>
                        <span className="mx-1">
                          {text}
                        </span>
                        <span className="text-sm text-gray-500">({getDepartmentName(entry.departmentId)})</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock size={14} className="mr-1" />
                        {formatDate(entry.timestamp)}
                      </div>
                    </div>
                    
                    {renderChangeDetails(entry)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500">Brak historii zmian.</p>
        </div>
      )}
    </div>
  );
}
