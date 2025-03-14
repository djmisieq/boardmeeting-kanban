import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, User, Flag, MessageSquare, History, Check, Paperclip } from 'lucide-react';
import { CardType } from '@/lib/types';
import CommentSection from '@/components/collaboration/comment-section';
import CardHistory from '@/components/collaboration/card-history';
import { useCollaborationStore } from '@/store/use-collaboration-store';
import { useForm } from '@/hooks/use-form';
import { useErrorHandler } from '@/providers/app-provider';
import { useSuccessNotification } from '@/providers/notification-provider';

interface CardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<CardType, 'id'>) => void;
  card?: CardType;
  title: string;
  currentUser: string;
  departmentId: string;
}

const CardDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  card, 
  title,
  currentUser,
  departmentId
}: CardDialogProps) => {
  // Tab management
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');
  
  // Error and notification handling
  const { handleError } = useErrorHandler();
  const showSuccess = useSuccessNotification();
  
  // Dialog ref for click outside detection
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Form initialization with validation
  const initialConfig = {
    title: {
      value: card?.title || '',
      required: true,
      requiredMessage: 'Tytuł jest wymagany',
    },
    description: {
      value: card?.description || '',
      required: false,
    },
    assignee: {
      value: card?.assignee || '',
      required: false,
    },
    dueDate: {
      value: card?.dueDate || '',
      required: false,
      validate: [
        {
          validate: (value) => !value || new Date(value) >= new Date(new Date().setHours(0, 0, 0, 0)),
          message: 'Data nie może być w przeszłości',
        },
      ],
    },
    priority: {
      value: card?.priority || '',
      required: false,
    },
  };
  
  // Collaboration store
  const collaborationStore = useCollaborationStore();
  
  // Form hook
  const {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    handleInputChange,
    handleSubmit,
    resetForm,
    hasError,
    getError,
    setFieldValue,
  } = useForm(initialConfig, async (formValues) => {
    try {
      // Prepare card data
      const updatedCard: Omit<CardType, 'id'> = {
        title: formValues.title,
        description: formValues.description || undefined,
        assignee: formValues.assignee || undefined,
        dueDate: formValues.dueDate || undefined,
        priority: formValues.priority || undefined,
      };
      
      // If card exists, add history entries for changes
      if (card) {
        // Check for title changes
        if (card.title !== updatedCard.title) {
          collaborationStore.addHistoryEntry(
            card.id,
            'updated',
            currentUser,
            departmentId,
            {
              field: 'title',
              oldValue: card.title,
              newValue: updatedCard.title
            }
          );
        }
        
        // Check for description changes
        if (card.description !== updatedCard.description) {
          collaborationStore.addHistoryEntry(
            card.id,
            'updated',
            currentUser,
            departmentId,
            {
              field: 'description',
              oldValue: card.description,
              newValue: updatedCard.description
            }
          );
        }
        
        // Check for assignee changes
        if (card.assignee !== updatedCard.assignee) {
          collaborationStore.addHistoryEntry(
            card.id,
            'assigned',
            currentUser,
            departmentId,
            {
              oldValue: card.assignee,
              newValue: updatedCard.assignee
            }
          );
        }
        
        // Check for priority changes
        if (card.priority !== updatedCard.priority) {
          collaborationStore.addHistoryEntry(
            card.id,
            'changed_priority',
            currentUser,
            departmentId,
            {
              oldValue: card.priority,
              newValue: updatedCard.priority
            }
          );
        }
        
        // Check for due date changes
        if (card.dueDate !== updatedCard.dueDate) {
          collaborationStore.addHistoryEntry(
            card.id,
            'updated',
            currentUser,
            departmentId,
            {
              field: 'dueDate',
              oldValue: card.dueDate,
              newValue: updatedCard.dueDate
            }
          );
        }
      }
      
      // Save the card
      onSave(updatedCard);
      
      // Show success notification
      showSuccess(card ? 'Karta została zaktualizowana' : 'Nowa karta została utworzona');
      
      // Close dialog
      onClose();
    } catch (error) {
      handleError(error);
    }
  });
  
  // Click outside handler for modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (card) {
        setFieldValue('title', card.title);
        setFieldValue('description', card.description || '');
        setFieldValue('assignee', card.assignee || '');
        setFieldValue('dueDate', card.dueDate || '');
        setFieldValue('priority', card.priority || '');
      } else {
        resetForm();
      }
      setActiveTab('details');
    }
  }, [isOpen, card, setFieldValue, resetForm]);
  
  // Keyboard controls for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      
      // Save on Ctrl/Cmd + Enter when in details tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && activeTab === 'details') {
        const form = document.getElementById('card-form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, activeTab]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div 
        ref={dialogRef}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b dark:border-gray-700">
          <button
            className={`px-4 py-2 flex items-center transition-colors ${
              activeTab === 'details' 
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('details')}
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Szczegóły
          </button>
          <button
            className={`px-4 py-2 flex items-center transition-colors ${
              activeTab === 'comments' 
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('comments')}
            disabled={!card}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Komentarze
            {card && <span className="ml-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2">
              {collaborationStore.getCommentsForCard(card.id).length}
            </span>}
          </button>
          <button
            className={`px-4 py-2 flex items-center transition-colors ${
              activeTab === 'history' 
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('history')}
            disabled={!card}
          >
            <History className="h-4 w-4 mr-2" />
            Historia
            {card && <span className="ml-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2">
              {collaborationStore.getHistoryForCard(card.id).length}
            </span>}
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 flex-grow">
          {activeTab === 'details' && (
            <form onSubmit={handleSubmit} id="card-form" className="space-y-4">
              {submitError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4">
                  {submitError}
                </div>
              )}
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Tytuł {hasError('title') && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={values.title}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 transition-colors
                    ${hasError('title') ? 'border-red-500 dark:border-red-500' : ''}`}
                  autoFocus
                />
                {hasError('title') && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{getError('title')}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Opis
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={values.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md h-24 dark:bg-gray-700 dark:border-gray-600 transition-colors"
                  placeholder="Opis (opcjonalnie)"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assignee" className="block text-sm font-medium mb-1">
                    Przypisana osoba
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="assignee"
                      name="assignee"
                      value={values.assignee}
                      onChange={handleInputChange}
                      className="w-full p-2 pl-8 border rounded-md dark:bg-gray-700 dark:border-gray-600 transition-colors"
                      placeholder="Przypisz osobę (opcjonalnie)"
                    />
                    <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
                    Termin {hasError('dueDate') && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={values.dueDate}
                      onChange={handleInputChange}
                      className={`w-full p-2 pl-8 border rounded-md dark:bg-gray-700 dark:border-gray-600 transition-colors
                        ${hasError('dueDate') ? 'border-red-500 dark:border-red-500' : ''}`}
                    />
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  {hasError('dueDate') && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{getError('dueDate')}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priorytet</label>
                <div className="flex flex-wrap space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      value="low"
                      checked={values.priority === 'low'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <Flag className="h-4 w-4 text-green-500 mr-1" />
                      Niski
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      value="medium"
                      checked={values.priority === 'medium'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <Flag className="h-4 w-4 text-yellow-500 mr-1" />
                      Średni
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      value="high"
                      checked={values.priority === 'high'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <Flag className="h-4 w-4 text-red-500 mr-1" />
                      Wysoki
                    </span>
                  </label>
                </div>
              </div>
            </form>
          )}
          
          {/* Comments section */}
          {activeTab === 'comments' && card && (
            <CommentSection
              cardId={card.id}
              currentUser={currentUser}
              currentDepartmentId={departmentId}
            />
          )}
          
          {/* History */}
          {activeTab === 'history' && card && (
            <CardHistory cardId={card.id} />
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3 p-4 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            Anuluj
          </button>
          
          {activeTab === 'details' && (
            <button
              type="submit"
              form="card-form"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Zapisywanie...
                </>
              ) : (
                <>Zapisz</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDialog;