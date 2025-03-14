'use client';

import { useState, useEffect } from 'react';
import { useCollaborationStore } from '@/store/use-collaboration-store';
import { useDepartmentsStore } from '@/store/use-departments-store';
import { CommentType } from '@/lib/types';
import { User, Reply, Edit, Trash2, Send, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

interface CommentSectionProps {
  cardId: string;
  currentUser: string;
  currentDepartmentId: string;
}

export default function CommentSection({ 
  cardId, 
  currentUser, 
  currentDepartmentId 
}: CommentSectionProps) {
  const { 
    getCommentsForCard, 
    getThreadedComments,
    addComment,
    editComment,
    deleteComment
  } = useCollaborationStore();
  
  const { departments } = useDepartmentsStore();
  
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  // Pobierz komentarze pogrupowane w wątki
  const commentThreads = getThreadedComments(cardId);
  
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
  
  // Obsługa dodawania komentarza
  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    addComment(
      cardId,
      commentText,
      currentUser,
      currentDepartmentId,
      replyTo || undefined
    );
    
    setCommentText('');
    setReplyTo(null);
  };
  
  // Obsługa edycji komentarza
  const handleEditComment = () => {
    if (!editingComment || !editText.trim()) return;
    
    editComment(cardId, editingComment, editText);
    setEditingComment(null);
    setEditText('');
  };
  
  // Obsługa usunięcia komentarza
  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten komentarz?')) {
      deleteComment(cardId, commentId);
    }
  };
  
  // Rozpocznij edycję komentarza
  const startEditing = (comment: CommentType) => {
    setEditingComment(comment.id);
    setEditText(comment.content);
  };
  
  // Rozpocznij odpowiadanie na komentarz
  const startReplying = (commentId: string) => {
    setReplyTo(commentId);
    setCommentText('');
  };
  
  // Renderowanie pojedynczego komentarza
  const renderComment = (comment: CommentType, isReply = false) => {
    const isCurrentUserAuthor = comment.author === currentUser;
    const isEditing = editingComment === comment.id;
    
    return (
      <div 
        key={comment.id} 
        className={`p-3 rounded-lg mb-3 ${
          isReply 
            ? 'ml-8 bg-gray-50 dark:bg-gray-800 border-l-2 border-blue-300' 
            : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full">
              <User size={16} className="text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <span className="font-medium">{comment.author}</span>
              <span className="mx-2 text-gray-500">·</span>
              <span className="text-sm text-gray-500">{getDepartmentName(comment.departmentId)}</span>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock size={14} className="mr-1" />
            {formatDate(comment.createdAt)}
            {comment.updatedAt && <span className="ml-1">(edytowany)</span>}
          </div>
        </div>
        
        {isEditing ? (
          <div className="mt-2">
            <textarea
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm"
                onClick={() => setEditingComment(null)}
              >
                Anuluj
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm flex items-center"
                onClick={handleEditComment}
              >
                <Send size={14} className="mr-1" />
                Zapisz
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-2 whitespace-pre-wrap">{comment.content}</div>
            
            <div className="flex justify-end gap-2 mt-3">
              {!isReply && (
                <button
                  className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  onClick={() => startReplying(comment.id)}
                >
                  <Reply size={14} className="mr-1" />
                  Odpowiedz
                </button>
              )}
              
              {isCurrentUserAuthor && (
                <>
                  <button
                    className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    onClick={() => startEditing(comment)}
                  >
                    <Edit size={14} className="mr-1" />
                    Edytuj
                  </button>
                  <button
                    className="px-2 py-1 text-sm text-red-600 dark:text-red-400 flex items-center hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Usuń
                  </button>
                </>
              )}
            </div>
          </>
        )}
        
        {/* Odpowiedzi na ten komentarz */}
        {commentThreads[comment.id]?.length > 0 && (
          <div className="mt-3 pt-2 border-t dark:border-gray-700">
            {commentThreads[comment.id].map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };
  
  // Efekt do rejestrowania aktualnego użytkownika jako przeglądającego kartę
  useEffect(() => {
    const { registerUserViewingCard, unregisterUserViewingCard } = useCollaborationStore.getState();
    
    registerUserViewingCard(cardId, currentUser);
    
    return () => {
      unregisterUserViewingCard(cardId, currentUser);
    };
  }, [cardId, currentUser]);
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Komentarze</h3>
      
      {replyTo && (
        <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex justify-between items-center">
          <span className="text-sm">
            Odpowiadasz na komentarz
          </span>
          <button 
            className="text-sm text-blue-600 dark:text-blue-400"
            onClick={() => setReplyTo(null)}
          >
            Anuluj
          </button>
        </div>
      )}
      
      <div className="mb-4">
        <textarea
          className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          placeholder="Dodaj komentarz..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={3}
        />
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-gray-500">
            Użyj @nazwa aby oznaczyć osobę
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center disabled:opacity-50"
            onClick={handleAddComment}
            disabled={!commentText.trim()}
          >
            <Send size={16} className="mr-2" />
            {replyTo ? 'Odpowiedz' : 'Dodaj komentarz'}
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {commentThreads.root?.length > 0 ? (
          commentThreads.root.map(comment => renderComment(comment))
        ) : (
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500">Brak komentarzy. Dodaj pierwszy!</p>
          </div>
        )}
      </div>
    </div>
  );
}
