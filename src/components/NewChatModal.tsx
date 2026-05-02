import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Profile } from '../types';

interface NewChatModalProps {
  onClose: () => void;
  onStartChat: (userId: string) => void;
}

export function NewChatModal({ onClose, onStartChat }: NewChatModalProps) {
  const { user } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id)
        .order('email');
        
      if (data) setUsers(data);
      setLoading(false);
    }
    loadUsers();
  }, [user]);

  const handleStartChat = async (userId: string) => {
    if (startingChat) return;
    setStartingChat(userId);
    setErrorMsg(null);
    try {
      await onStartChat(userId);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || String(err));
    } finally {
      if (document.body) { // Component might unmount before this runs but just in case
        setStartingChat(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b flex justify-between items-center bg-neutral-50/50 border-neutral-100">
          <h2 className="font-bold text-lg text-neutral-900">New Chat</h2>
          <button 
            onClick={onClose} 
            disabled={startingChat !== null}
            className="p-2 -mr-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {errorMsg && (
          <div className="px-4 pt-4 pb-2">
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {errorMsg}
            </div>
          </div>
        )}
        
        <div className="p-2">
           {loading ? (
             <div className="flex flex-col items-center justify-center py-8 space-y-3">
               <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
               <p className="text-sm text-neutral-500">Loading people...</p>
             </div>
           ) : users.length === 0 ? (
             <div className="text-center py-8">
               <p className="text-neutral-500">No other users found.</p>
               <p className="text-xs text-neutral-400 mt-2">Make sure you ran the profiles SQL script!</p>
             </div>
           ) : (
             <div className="space-y-1 overflow-y-auto max-h-[60vh] scrollbar-hide">
                {users.map(u => (
                 <button 
                   key={u.id} 
                   onClick={(e) => {
                     e.preventDefault();
                     console.log('Button clicked for user:', u.id);
                     handleStartChat(u.id);
                   }} 
                   className="w-full text-left p-3 hover:bg-neutral-50 active:bg-neutral-100 rounded-xl flex items-center justify-between transition-colors"
                 >
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-brand/10 text-brand rounded-full flex items-center justify-center font-bold">
                       {u.email.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <p className="font-semibold text-neutral-900 leading-tight">
                         {u.email.split('@')[0]}
                       </p>
                       <p className="text-xs text-neutral-500">{u.email}</p>
                     </div>
                   </div>
                   {startingChat === u.id && (
                     <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                   )}
                 </button>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
