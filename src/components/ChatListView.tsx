import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, MessageSquarePlus, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Conversation, Profile } from '../types';
import { cn, formatDate } from '../lib/utils';
import { NewChatModal } from './NewChatModal';

interface ChatListViewProps {
  onSelectConversation: (conversation: Conversation) => void;
  activeConversationId?: string;
}

export function ChatListView({ onSelectConversation, activeConversationId }: ChatListViewProps) {
  const { user, signOut } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    // 1. Get all conversation IDs the user is part of
    const { data: participants, error: pError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (pError || !participants) {
      console.error('Error fetching participations:', pError);
      setLoading(false);
      return;
    }

    const convIds = participants.map(p => p.conversation_id);
    if (convIds.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // 2. Fetch the actual conversations and their participants
    const { data: convs, error: cError } = await supabase
      .from('conversations')
      .select(`
        id,
        created_at,
        conversation_participants (user_id)
      `)
      .in('id', convIds);

    if (cError || !convs) {
      console.error('Error fetching conversations:', cError);
      setLoading(false);
      return;
    }

    // 3. Fetch metadata for other participants (ideally from a 'profiles' table or similar)
    // For this assessment, we'll imagine a simplified user lookup or just use IDs/Emails
    
    const conversationsWithDetails: Conversation[] = await Promise.all(
      convs.map(async (c: any) => {
        const otherParticipantId = c.conversation_participants.find((p: any) => p.user_id !== user.id)?.user_id;
        
        // Get last message
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', c.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get other participant profile (Mocking email lookup if profiles table isn't there)
        // In real Supabase, you'd have a public profiles table linked to auth.users
        let profile = null;
        try {
          const { data: profileData } = await supabase
             .from('profiles')
             .select('id, email, avatar_url')
             .eq('id', otherParticipantId)
             .single();
          profile = profileData;
        } catch (e) {
          console.warn('Profiles table might be missing, falling back to ID');
        }

        return {
          id: c.id,
          created_at: c.created_at,
          last_message: lastMsg || undefined,
          other_participant: profile || { id: otherParticipantId, email: 'User ' + otherParticipantId?.slice(0, 4) }
        };
      })
    );

    setConversations(conversationsWithDetails.sort((a, b) => 
      new Date(b.last_message?.created_at || b.created_at).getTime() - 
      new Date(a.last_message?.created_at || a.created_at).getTime()
    ));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleStartChat = async (otherUserId: string) => {
    if (!user) {
      throw new Error("No user found");
    }
    
    // First, check if conversation already exists
    const existingConv = conversations.find(c => c.other_participant?.id === otherUserId);
    
    if (existingConv) {
      onSelectConversation(existingConv);
      setShowNewChat(false);
      return;
    }
    
    // Create new conversation
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({ created_at: new Date().toISOString() })
      .select('id')
      .single();
      
    if (convError || !conv) {
      console.error('Failed to create conversation', convError);
      throw new Error(`Failed to create conversation: ${convError?.message || 'Unknown error'}`);
    }

    const { error: partError } = await supabase.from('conversation_participants').insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: otherUserId }
    ]);
    
    if (partError) {
      console.error('Participant insertion error:', partError);
      // Wait, we need to rollback the conversation if this fails?
      // Since we don't have transaction support easily, we'll just throw
      throw new Error(`Failed to add participants: ${partError?.message}`);
    }
    
    setShowNewChat(false);
    
    fetchConversations(); // Start refresh in background
    
    // Look up profile if possible
    let profileData = null;
    try {
      const { data } = await supabase
          .from('profiles')
          .select('id, email, avatar_url')
          .eq('id', otherUserId)
          .single();
      profileData = data;
    } catch (e) {
      // ignore
    }
        
    onSelectConversation({
      id: conv.id,
      created_at: new Date().toISOString(),
      other_participant: profileData || { id: otherUserId, email: 'User ' + otherUserId.slice(0, 4) }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {showNewChat && (
        <NewChatModal 
          onClose={() => setShowNewChat(false)} 
          onStartChat={handleStartChat} 
        />
      )}
      
      <header className="px-5 py-4 shrink-0 border-b border-neutral-100 flex items-center justify-between gap-4">
         <h2 className="text-[17px] font-bold text-neutral-900 tracking-tight">All Messages</h2>
         <button 
            onClick={() => setShowNewChat(true)}
            className="p-1.5 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
            title="New Chat"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-12 h-12 bg-neutral-100 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-neutral-100 rounded w-1/3" />
                  <div className="h-3 bg-neutral-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquarePlus className="w-8 h-8 text-neutral-300" />
            </div>
            <p className="text-neutral-500">No conversations yet.</p>
            <button 
              onClick={() => setShowNewChat(true)}
              className="mt-4 text-accent font-semibold text-sm hover:underline"
            >
              Start chatting
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {conversations.map((conv, idx) => (
               <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                 className={cn(
                  "w-full flex items-center gap-4 p-4 transition-all duration-200 text-left relative",
                  activeConversationId === conv.id 
                    ? "bg-black/5" 
                    : "hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
                )}
              >
                 {activeConversationId === conv.id && (
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-black rounded-r-md" />
                 )}
                 <div className="relative shrink-0">
                   <div className={cn(
                     "w-12 h-12 rounded-full overflow-hidden bg-neutral-200 transition-all",
                     activeConversationId === conv.id ? "ring-2 ring-offset-2 ring-black" : ""
                   )}>
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${conv.other_participant?.email}`} className="w-full h-full object-cover" />
                   </div>
                   <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-[2.5px] border-white rounded-full" />
                 </div>
                 
                 <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between mb-0.5">
                       <h3 className={cn(
                          "text-[15px] truncate transition-colors",
                          activeConversationId === conv.id ? "font-bold text-neutral-900" : "font-semibold text-neutral-900"
                       )}>
                         {conv.other_participant?.email?.split('@')[0]}
                       </h3>
                       {conv.last_message && (
                         <span className={cn(
                           "text-[11px] font-medium whitespace-nowrap ml-2",
                           activeConversationId === conv.id ? "text-neutral-900" : "text-neutral-400"
                         )}>
                           {formatDate(conv.last_message.created_at)}
                         </span>
                       )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                       <p className={cn(
                         "text-sm truncate font-medium",
                         activeConversationId === conv.id ? "text-neutral-700" : "text-neutral-500"
                       )}>
                         {conv.last_message?.content || 'No messages yet'}
                       </p>
                    </div>
                 </div>
               </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
